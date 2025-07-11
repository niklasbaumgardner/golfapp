import { html } from "./imports.mjs";
import { NikElement } from "./customElement.mjs";
import "./nb-delete-round.mjs";

class RoundActions extends NikElement {
  static properties = {
    round: { type: Object },
  };

  handleEditClick() {
    if (!this.editRoundModal) {
      this.editRoundModal = document.createElement("nb-edit-round");
      this.editRoundModal.round = this.round;
      document.body.appendChild(this.editRoundModal);
    }

    this.editRoundModal.show();
  }

  handleDeleteClick() {
    if (!this.deleteRoundModal) {
      this.deleteRoundModal = document.createElement("nb-delete-round");
      this.deleteRoundModal.round = this.round;
      document.body.appendChild(this.deleteRoundModal);
    }

    this.deleteRoundModal.show();
  }

  render() {
    return html`<div class="wa-cluster wa-align-items-center">
      <wa-button
        appearance="outlined"
        size="small"
        @click=${this.handleEditClick}
        >Edit</wa-button
      >
      <wa-button
        appearance="outlined"
        variant="danger"
        size="small"
        @click=${this.handleDeleteClick}
        >Delete</wa-button
      >
    </div>`;
  }
}
customElements.define("nb-round-actions", RoundActions);

export class RoundsGrid extends NikElement {
  static properties = {
    rounds: {
      type: Object,
    },
    theme: {
      type: String,
    },
  };

  static queries = {
    roundsGridEl: "#grid",
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
    document.addEventListener("UpdateRounds", this);

    await this.updateComplete;

    this.createDataGrid();
    this.setupThemeWatcher();
  }

  createDataGrid() {
    if (!this.rounds.length) {
      return;
    }

    const columnDefs = [
      {
        field: "course",
        headerName: "Course - Teebox",
        filter: "agTextColumnFilter",
        autoHeight: true,
        cellRenderer: (param) => {
          let course = param.data.course;
          let address = course.address ?? "";
          let courseAddress = "";
          try {
            let [street, city, stateZip] = address.split(", ");
            let [state, zip] = stateZip.split(" ");
            courseAddress = `${city}, ${state}`;
          } catch {}

          let teebox = param.data.teebox;

          return `<div class="wa-heading-xs">${course.name} - ${teebox.teebox} (${teebox.rating} / ${teebox.slope})</div><div class="wa-body-xs">${courseAddress}</div>`;
        },
        comparator: (valueA, valueB, nodeA, nodeB, isDescending) => {
          let courseA = nodeA.data.course;
          let courseB = nodeB.data.course;

          return courseA.name.localeCompare(courseB.name);
        },
        filterValueGetter: (param) => {
          let course = param.data.course;
          let teebox = param.data.teebox;

          return `${course.name} - ${teebox.teebox} (${teebox.rating} / ${teebox.slope})`;
        },
      },
      {
        field: "score",
        headerName: "Score / Par",
        filter: "agNumberColumnFilter",
        cellRenderer: (param) => {
          let teebox = param.data.teebox;

          return `${param.data.score} / ${
            param.data.nine_hole_round ? teebox.par / 2 : teebox.par
          } (${param.data.score_diff})`;
        },
      },
      {
        field: "fir",
        headerName: "FIR",
        filter: "agNumberColumnFilter",
      },
      {
        field: "gir",
        headerName: "GIR",
        filter: "agNumberColumnFilter",
      },
      {
        field: "putts",
        filter: "agNumberColumnFilter",
      },
      {
        field: "date",
        filter: "agDateColumnFilter",
        cellRenderer: (param) => {
          let date = param.data.date;

          return `<wa-format-date month="long" day="numeric" year="numeric" date="${
            date + "T00:00:00"
          }"></sl-format-date>`;
        },
      },
    ];

    if (IS_ME) {
      columnDefs.push({
        field: "actions",
        minWidth: 160,
        maxWidth: 160,
        cellRenderer: (param) => {
          let actions = document.createElement("nb-round-actions");
          actions.round = param.data;

          return actions;
        },
      });
    }

    const gridOptions = {
      columnDefs,
      rowData: this.rounds,
      autoSizeStrategy: {
        type: "fitGridWidth",
        defaultMinWidth: 100,
        defaultMaxWidth: 100,
        columnLimits: [
          {
            colId: "course",
            minWidth: 350,
            maxWidth: 350,
          },
          {
            colId: "score",
            minWidth: 125,
            maxWidth: 125,
          },
          {
            colId: "date",
            minWidth: 175,
            maxWidth: 175,
          },
        ],
      },
      defaultColDef: {
        resizable: false,
      },
      domLayout: "autoHeight",
      suppressCellFocus: true,
      suppressMovableColumns: true,
      pagination: true,
      paginationPageSize: 20,
      paginationPageSizeSelector: false,
      getRowClass: (param) => {
        if (param.data.isIncluded) {
          return "bg-(--wa-color-success-fill-quiet)!";
        }
      },
      theme: agGrid.themeAlpine.withPart(this.currentColorScheme),
    };
    this.dataGrid = agGrid.createGrid(this.roundsGridEl, gridOptions);
  }

  handleEvent(event) {
    switch (event.type) {
      case "click":
        this.handleClick(event);
        break;
      case "UpdateRounds": {
        let { handicap, rounds } = event.detail;
        this.updateHandicap(handicap);
        this.updateRounds(rounds);
      }
    }
  }

  updateHandicap(handicap) {
    document.dispatchEvent(
      new CustomEvent("UpdateHandicap", { detail: handicap, bubbles: true })
    );
  }

  updateRounds(rounds) {
    this.dataGrid.setGridOption("rowData", rounds);
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
    if (!this.rounds.length) {
      return null;
    }

    return html`<div id="grid" style="--ag-grid-size: 4px;"></div>`;
  }
}

customElements.define("nb-rounds-grid", RoundsGrid);
