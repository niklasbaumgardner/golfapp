import { NikElement } from "./customElement.mjs";
import { html } from "./imports.mjs";

export class CourseRatingsGrid extends NikElement {
  static properties = {
    ratings: {
      type: Object,
    },
    theme: {
      type: String,
    },
  };

  static queries = {
    ratingsGridEl: "#grid",
  };

  firstUpdated() {
    this.init();
  }

  async init() {
    await this.updateComplete;

    this.createDataGrid();
    this.setupThemeWatcher();
  }

  rankCourses() {
    let courseData = this.getAverageCourseRating();
    courseData.sort((a, b) => b.averageRating - a.averageRating);

    let rank = 1;
    for (let [i, rankData] of courseData.entries()) {
      if (i === 0) {
      } else if (
        rankData.averageRating === courseData.at(i - 1).averageRating
      ) {
      } else {
        rank = i + 1;
      }
      rankData.rank = rank;
    }

    this.ratings = courseData;
  }

  getAverageCourseRating() {
    let courseRankings = this.ratings;

    let courseData = {};
    for (let courseRanking of courseRankings) {
      if (courseData[courseRanking.course.id]) {
        courseData[courseRanking.course.id].array.push(courseRanking);
      } else {
        courseData[courseRanking.course.id] = { ...courseRanking.course };
        courseData[courseRanking.course.id].array = [courseRanking];
      }
    }

    for (let [_, obj] of Object.entries(courseData)) {
      obj.averageRating = this.averageRating(obj.array);
    }

    return Object.values(courseData);
  }

  getWeight(number) {
    return Math.min(95 + number, 100) / 100;
  }

  averageRating(array) {
    let averageRating =
      array.reduce(
        (acumulator, currentValue) => acumulator + currentValue.rating,
        0
      ) / array.length;

    let weight = this.getWeight(array.length);
    return Math.round((averageRating * weight + Number.EPSILON) * 100) / 100;
  }

  createDataGrid() {
    if (!this.ratings.length) {
      return;
    }

    this.rankCourses();

    const columnDefs = [
      {
        field: "rank",
      },
      {
        field: "name",
        headerName: "Course",
      },
      {
        field: "averageRating",
        headerName: "Average Weighted Rating",
      },
      {
        field: "array",
        headerName: "All Ratings",
        cellRenderer: (param) => {
          let rankings = param.data.array.map(
            (x) =>
              `<a class="rating-by-user" href="/course_ranking/${x.user.id}" title="Rating from ${x.user.username}">${x.rating} by ${x.user.username}</a>`
          );

          return rankings.join('<span class="rating-by-user">, </span>');
        },
      },
    ];

    const gridOptions = {
      columnDefs,
      rowData: this.ratings,
      autoSizeStrategy: {
        type: "fitCellContents",
        skipHeader: false,
      },
      defaultColDef: {
        resizable: false,
      },
      rowHeight: 50,
      domLayout: "autoHeight",
      suppressCellFocus: true,
      suppressMovableColumns: true,
    };
    this.dataGrid = agGrid.createGrid(this.ratingsGridEl, gridOptions);
  }

  setupThemeWatcher() {
    this.mutationObserver = new MutationObserver((params) =>
      this.handleThemeChange(params)
    );

    this.mutationObserver.observe(document.documentElement, {
      attributes: true,
    });

    this.handleThemeChange();
  }

  handleThemeChange() {
    let theme = document.documentElement.classList.contains("wa-dark")
      ? "dark"
      : "light";
    this.ratingsGridEl.classList.toggle(
      "ag-theme-alpine-dark",
      theme === "dark"
    );
    this.ratingsGridEl.classList.toggle("ag-theme-alpine", theme === "light");
  }

  render() {
    if (!this.ratings.length) {
      return null;
    }

    return html`<div
      id="grid"
      style="--ag-grid-size: 4px;"
      class=${this.theme === "dark"
        ? "ag-theme-alpine-dark"
        : "ag-theme-alpine"}
    ></div>`;
  }
}

customElements.define("nb-course-ratings-grid", CourseRatingsGrid);
