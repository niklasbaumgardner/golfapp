import { NikElement } from "./nik-element.mjs";
import { html } from "./bundle.mjs";

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
        class="icon-button no-border"
        variant="brand"
        appearance="plain"
        @click=${this.handleEditClick}
        ><wa-icon library="ion" name="create-outline" label="Edit"></wa-icon
      ></wa-button>
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
      theme: agGrid.themeAlpine.withPart(this.currentColorScheme),
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
customElements.define("nb-players-course-rating-grid", PlayersCourseRatingGrid);
