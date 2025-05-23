import { html } from "./imports.mjs";
import { NikElement } from "./customElement.mjs";

export class PlayersGrid extends NikElement {
  static properties = {
    players: {
      type: Object,
    },
    theme: {
      type: String,
    },
  };

  static queries = {
    playersGridEl: "#grid",
  };

  firstUpdated() {
    this.init();
  }

  async init() {
    await this.updateComplete;

    this.createDataGrid();
    this.setupThemeWatcher();
  }

  createDataGrid() {
    if (!this.players.length) {
      return;
    }

    const columnDefs = [
      {
        field: "username",
        headerName: "Player",
        filter: "agTextColumnFilter",
        cellRenderer: (param) => {
          return `<a href="${param.data.url}">${param.data.username}</a>`;
        },
        width: 200,
      },
      {
        field: "handicap",
        filter: "agNumberColumnFilter",
        cellRenderer: (param) => {
          return param.data.handicap.handicap_str;
        },
        valueGetter: (param) => {
          return param.data.handicap.handicap;
        },
        width: 100,
      },
    ];

    const gridOptions = {
      columnDefs,
      rowData: this.players,
      defaultColDef: {
        resizable: false,
      },
      onCellEditingStopped: (event) => this.handleEvent(event),
      rowHeight: 50,
      domLayout: "autoHeight",
      suppressCellFocus: true,
      suppressMovableColumns: true,
      autoSizeStrategy: {
        type: "fitCellContents",
        // columnLimits: [
        //   { colId: "username", minWidth: 200, maxWidth: 850, flex: 1 },
        //   {
        //     colId: "handicap",
        //     minWidth: 200,
        //     maxWidth: 200,
        //     // flex: 1,
        //   },
        // ],
      },
      // onGridReady: (event) => event.api.sizeColumnsToFit(),
    };
    this.dataGrid = agGrid.createGrid(this.playersGridEl, gridOptions);
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
    this.playersGridEl.classList.toggle(
      "ag-theme-alpine-dark",
      theme === "dark"
    );
    this.playersGridEl.classList.toggle("ag-theme-alpine", theme === "light");
  }

  render() {
    if (!this.players.length) {
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
customElements.define("nb-players-grid", PlayersGrid);
