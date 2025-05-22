class PlayersGridManager {
  constructor() {
    this.playersGridEl = document.getElementById("playersGrid");

    this.createDataGrid();

    this.setupThemeWatcher();
  }

  createDataGrid() {
    const rowData = PLAYERS;

    const columnDefs = [
      {
        field: "username",
        headerName: "Player",
        filter: "agTextColumnFilter",
        cellRenderer: (param) => {
          return `<a href="${param.data.url}">${param.data.username}</a>`;
        },
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
      },
    ];

    const gridOptions = {
      columnDefs,
      rowData,
      autoSizeStrategy: {
        type: "fitGridWidth",
      },
      onRowDataUpdated: (event) => {
        let height =
          document.querySelector(".ag-center-cols-container").scrollHeight +
          document.querySelector(".ag-header-row").scrollHeight +
          document.querySelector(".ag-paging-panel").scrollHeight;

        if (height < 192) {
          height = 192;
        }

        this.playersGridEl.style.height = `${height + 3}px`;
      },
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
      "ag-theme-quartz-dark",
      theme === "dark"
    );
    this.playersGridEl.classList.toggle("ag-theme-quartz", theme === "light");
  }
}

new PlayersGridManager();
