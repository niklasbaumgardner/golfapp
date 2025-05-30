import { html } from "./imports.mjs";
import { NikElement } from "./customElement.mjs";

class RatingActions extends NikElement {
  static properties = {
    rating: { type: Object },
  };

  handleEditClick() {
    if (!this.editRatingModal) {
      this.editRatingModal = document.createElement("nb-edit-course-rating");
      this.editRatingModal.rating = this.rating;
      document.body.appendChild(this.editRatingModal);
    }

    this.editRatingModal.show();
  }

  render() {
    return html`<div class="wa-cluster wa-align-items-center">
      <wa-button
        appearance="outlined"
        size="small"
        @click=${this.handleEditClick}
        >Edit</wa-button
      >
    </div>`;
  }
}
customElements.define("nb-course-rating-actions", RatingActions);

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
    document.addEventListener("UpdateRatings", this);

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
        autoHeight: true,
        filter: "agTextColumnFilter",
        cellRenderer: (param) => {
          let course = param.data.course;
          let address = course.address ?? "";
          let state = "",
            city = "",
            stateZip = "",
            _ = "";

          if (address) {
            [_, city, stateZip] = address.split(", ");
            [state, _] = stateZip.split(" ");
          }

          return `<div class="wa-heading-xs">${course.name}</div><div class="wa-body-xs">${city}, ${state}</div>`;
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
        filter: "agNumberColumnFilter",
        minWidth: 100,
      },
    ];

    if (IS_ME) {
      columnDefs.push({
        field: "actions",
        minWidth: 80,
        maxWidth: 80,
        cellRenderer: (param) => {
          let actions = document.createElement("nb-course-rating-actions");
          actions.rating = param.data;

          return actions;
        },
      });
    }

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
    };
    this.dataGrid = agGrid.createGrid(this.ratingsGrid, gridOptions);
  }

  handleEvent(event) {
    switch (event.type) {
      case "UpdateRatings":
        let ratings = event.detail;
        this.updateRatings(ratings);
        break;
    }
  }

  updateRatings(ratings) {
    this.ratings = ratings;

    this.rankCourses();

    this.dataGrid.setGridOption("rowData", this.ratings);
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
