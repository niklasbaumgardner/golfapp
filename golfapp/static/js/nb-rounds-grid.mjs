import { html } from "./imports.mjs";
import { NikElement } from "./customElement.mjs";
import "./nb-delete-round.mjs";

class RoundActions extends NikElement {
  static properties = {
    round: { type: Object },
  };

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
        // editable: true,
        filter: "agTextColumnFilter",
        cellRenderer: (param) => {
          let course = param.data.course;
          let teebox = param.data.teebox;

          return `${course.name} - ${teebox.teebox} (${teebox.rating} / ${teebox.slope})`;
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
        editable: true,
        filter: "agNumberColumnFilter",
        cellEditor: IS_ME ? "agNumberCellEditor" : false,
        cellEditorParams: {
          step: 1,
        },
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
        editable: true,
        filter: "agNumberColumnFilter",
        cellEditor: IS_ME ? "agNumberCellEditor" : false,
        cellEditorParams: {
          step: 1,
        },
      },
      {
        field: "gir",
        headerName: "GIR",
        editable: true,
        filter: "agNumberColumnFilter",
        cellEditor: IS_ME ? "agNumberCellEditor" : false,
        cellEditorParams: {
          step: 1,
        },
      },
      {
        field: "putts",
        editable: true,
        filter: "agNumberColumnFilter",
        cellEditor: IS_ME ? "agNumberCellEditor" : false,
        cellEditorParams: {
          step: 1,
        },
      },
      {
        field: "date",
        editable: true,
        filter: "agDateColumnFilter",
        cellEditor: IS_ME ? "agDateStringCellEditor" : false,
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
      onCellEditingStopped: (event) => this.handleEvent(event),
      rowHeight: 50,
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
    };
    this.dataGrid = agGrid.createGrid(this.roundsGridEl, gridOptions);
  }

  handleEvent(event) {
    switch (event.type) {
      case "cellEditingStopped":
        this.handleEditRound(event);
        break;
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

  async handleEditRound(event) {
    if (!IS_ME) {
      return;
    }

    if (!event.newValue || event.newValue === event.oldValue) {
      return;
    }

    let round = event.data;

    let formData = new FormData();
    formData.append(event.colDef.field, event.newValue);

    let response = await fetch(round.edit_round_url, {
      method: "POST",
      body: formData,
    });

    let jsonResponse = await response.json();

    if (jsonResponse.handicap) {
      this.updateHandicap(jsonResponse.handicap);
    }
    if (jsonResponse.rounds) {
      this.updateRounds(jsonResponse.rounds);
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
    this.roundsGridEl.classList.toggle(
      "ag-theme-alpine-dark",
      theme === "dark"
    );
    this.roundsGridEl.classList.toggle("ag-theme-alpine", theme === "light");
  }

  render() {
    if (!this.rounds.length) {
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

customElements.define("nb-rounds-grid", RoundsGrid);
