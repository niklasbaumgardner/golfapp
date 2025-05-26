import { html } from "./imports.mjs";
import { NikElement } from "./customElement.mjs";

export class PlayersCourseRatingGrid extends NikElement {
  static properties = {
    ratings: {
      type: Object,
    },
    theme: {
      type: String,
    },
  };

  static queries = {
    ratingsGrid: "#grid",
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
    this.ratings.sort((a, b) => b.rating - a.rating);

    let rank = 1;
    for (let [i, courseRatingObj] of this.ratings.entries()) {
      if (i === 0) {
      } else if (courseRatingObj.rating === this.ratings.at(i - 1).rating) {
      } else {
        rank = i + 1;
      }
      courseRatingObj.rank = rank;
    }
  }

  createDataGrid() {
    if (!this.ratings.length) {
      return;
    }

    this.rankCourses();

    const columnDefs = [
      { field: "rank", width: 75, minWidth: 75 },
      {
        field: "course",
        flex: 1,
        minWidth: 200,
        filter: "agTextColumnFilter",
        cellRenderer: (param) => {
          let course = param.data.course;

          return course.name;
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
        field: "rating",
        editable: IS_ME,
        filter: "agNumberColumnFilter",
        cellEditor: IS_ME ? "agNumberCellEditor" : false,
        cellEditorParams: {
          step: 0.01,
        },
        minWidth: 100,
      },
    ];

    const gridOptions = {
      columnDefs,
      rowData: this.ratings,
      defaultColDef: {
        resizable: false,
      },
      rowHeight: 50,
      domLayout: "autoHeight",
      suppressCellFocus: true,
      suppressMovableColumns: true,
      onCellEditingStopped: (event) => this.handleEvent(event),
      autoSizeStrategy: {
        type: "fitGridWidth",
        // columnLimits: [
        //   { colId: "Rank", wdith: 50 },
        // {
        //   colId: "Course",
        //   minWidth: 200,
        //   maxWidth: 850,
        // },
        //   {
        //     colId: "Rating",
        //     minWidth: 50,
        //     maxWidth: 100,
        //   },
        // ],
      },
      onGridReady: (event) =>
        new Promise((r) => setTimeout(r, 200)).then(() => {
          event.api.sizeColumnsToFit();
        }),
    };
    this.dataGrid = agGrid.createGrid(this.ratingsGrid, gridOptions);
  }

  handleEvent(event) {
    switch (event.type) {
      case "cellEditingStopped":
        this.handleEditRating(event);
        break;
    }
  }

  async handleEditRating(event) {
    if (!IS_ME) {
      return;
    }

    if (!event.newValue || event.newValue === event.oldValue) {
      return;
    }

    let courseRating = event.data;

    let formData = new FormData();
    formData.append("rating", event.newValue);

    let response = await fetch(courseRating.edit_rating_url, {
      method: "POST",
      body: formData,
    });

    let jsonResponse = await response.json();

    if (jsonResponse.ratings) {
      this.updateRatings(jsonResponse.ratings);
    }
  }

  updateRatings(ratings) {
    this.ratings = ratings;

    this.rankCourses();

    this.dataGrid.setGridOption("rowData", this.ratings);

    document.dispatchEvent(
      new CustomEvent("UpdateRatings", { detail: ratings, bubbles: true })
    );
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
    this.ratingsGrid.classList.toggle("ag-theme-alpine-dark", theme === "dark");
    this.ratingsGrid.classList.toggle("ag-theme-alpine", theme === "light");
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
customElements.define("nb-players-course-rating-grid", PlayersCourseRatingGrid);
