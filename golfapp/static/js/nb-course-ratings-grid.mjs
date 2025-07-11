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

  get currentColorScheme() {
    let theme = document.documentElement.classList.contains("wa-dark")
      ? "dark"
      : "light";

    let colorScheme =
      theme === "dark" ? agGrid.colorSchemeDark : agGrid.colorSchemeLight;

    return colorScheme;
  }

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
        width: 75,
        minWidth: 75,
        maxWidth: 75,
        filter: "agNumberColumnFilter",
      },
      {
        field: "name",
        headerName: "Course",
        autoHeight: true,
        width: 240,
        minWidth: 240,
        maxWidth: 240,
        cellRenderer: (param) => {
          let course = param.data;
          let address = course.address ?? "";
          let courseAddress = "";
          try {
            let [street, city, stateZip] = address.split(", ");
            let [state, zip] = stateZip.split(" ");
            courseAddress = `${city}, ${state}`;
          } catch {}

          return `<div class="wa-heading-xs">${course.name}</div><div class="wa-body-xs">${courseAddress}</div>`;
        },
        comparator: (valueA, valueB, nodeA, nodeB, isDescending) => {
          let courseA = nodeA.data.course;
          let courseB = nodeB.data.course;

          return courseA.name.localeCompare(courseB.name);
        },
        filterValueGetter: (param) => {
          let course = param.data.course;

          return course.name;
        },
      },
      {
        field: "averageRating",
        headerName: "Weighted Rating",
        width: 130,
        minWidth: 130,
        maxWidth: 130,
        filter: "agNumberColumnFilter",
      },
      {
        field: "array",
        headerName: "All Ratings",
        autoHeight: true,
        flex: 1,
        minWidth: 200,
        cellRenderer: (param) => {
          let rankings = param.data.array.map(
            (x) =>
              `<a class="rating-by-user_" href="/course_ranking/${x.user.id}" title="Rating from ${x.user.username}">${x.rating} by ${x.user.username}</a>`
          );
          rankings = rankings.join('<span class="min-w-[1ch]">, </span>');

          return `<div class="flex flex-wrap">${rankings}</div>`;
        },
      },
    ];

    const gridOptions = {
      columnDefs,
      rowData: this.ratings,
      autoSizeStrategy: {
        type: "fitGridWidth",
      },
      defaultColDef: {
        resizable: false,
      },
      domLayout: "autoHeight",
      suppressCellFocus: true,
      suppressMovableColumns: true,
      theme: agGrid.themeAlpine.withPart(this.currentColorScheme),
    };
    this.dataGrid = agGrid.createGrid(this.ratingsGridEl, gridOptions);
  }

  setupThemeWatcher() {
    this.mutationObserver = new MutationObserver(() =>
      this.handleThemeChange()
    );

    this.mutationObserver.observe(document.documentElement, {
      attributes: true,
    });
  }

  handleThemeChange() {
    this.dataGrid.setGridOption(
      "theme",
      agGrid.themeAlpine.withPart(this.currentColorScheme)
    );
  }

  render() {
    if (!this.ratings.length) {
      return null;
    }

    return html`<div id="grid" style="--ag-grid-size: 4px;"></div>`;
  }
}

customElements.define("nb-course-ratings-grid", CourseRatingsGrid);
