import { html } from "./imports.mjs";
import { NikElement } from "./customElement.mjs";
import "./nb-delete-round.mjs";

class RoundActions extends NikElement {
  static properties = {
    round: { type: Object },
    editing: { type: Boolean },
  };

  get gridApi() {
    return this.closest("nb-rounds-grid").dataGrid;
  }

  get row() {
    let rowIndex = Array.from(
      document.querySelectorAll("nb-round-actions")
    ).findIndex((el) => el === this);

    return rowIndex + this.gridApi.paginationGetCurrentPage() * 20;
  }

  handleDoneEditing() {
    this.editing = false;
    this.gridApi.stopEditing();
  }

  handleEditClick() {
    this.editing = true;

    this.gridApi.setFocusedCell(this.row, "score");
    this.gridApi.startEditingCell({
      rowIndex: this.row,
      colKey: "score",
    });
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
    if (this.editing) {
      return html`<div class="wa-cluster wa-align-items-center">
        <wa-button
          appearance="outlined"
          variant="success"
          size="small"
          @click=${this.handleDoneEditing}
          >Save</wa-button
        >
        <wa-button
          appearance="outlined"
          size="small"
          @click=${this.handleDoneEditing}
          >Cancel</wa-button
        >
      </div>`;
    } else {
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
        editable: IS_ME,
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
        editable: IS_ME,
        filter: "agNumberColumnFilter",
        cellEditor: IS_ME ? "agNumberCellEditor" : false,
        cellEditorParams: {
          step: 1,
        },
      },
      {
        field: "gir",
        headerName: "GIR",
        editable: IS_ME,
        filter: "agNumberColumnFilter",
        cellEditor: IS_ME ? "agNumberCellEditor" : false,
        cellEditorParams: {
          step: 1,
        },
      },
      {
        field: "putts",
        editable: IS_ME,
        filter: "agNumberColumnFilter",
        cellEditor: IS_ME ? "agNumberCellEditor" : false,
        cellEditorParams: {
          step: 1,
        },
      },
      {
        field: "date",
        editable: IS_ME,
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
      onRowEditingStarted: (event) => this.handleEvent(event),
      onRowEditingStopped: (event) => this.handleEvent(event),
      onRowValueChanged: (event) => this.handleEvent(event),
      domLayout: "autoHeight",
      editType: "fullRow",
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
      case "rowEditingStarted":
        this.hanldeRowEditingStarted(event);
        break;
      case "rowEditingStopped":
        this.handleRowEditingStopped(event);
        break;
      case "rowValueChanged":
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

    let round = event.data;

    let formData = new FormData();
    for (let param of ["score", "fir", "gir", "putts", "date"]) {
      formData.append(param, round[param]);
    }

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

  hanldeRowEditingStarted(event) {
    let row = event.rowIndex;
    let nbRoudnActions = Array.from(
      document.querySelectorAll("nb-round-actions")
    ).at(row % 20);

    nbRoudnActions.editing = true;
  }

  handleRowEditingStopped(event) {
    let row = event.rowIndex;
    let nbRoudnActions = Array.from(
      document.querySelectorAll("nb-round-actions")
    ).at(row % 20);

    nbRoudnActions.editing = false;
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
