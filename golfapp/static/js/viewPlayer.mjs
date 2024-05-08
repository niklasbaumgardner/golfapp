import { postRequest } from "./fetch.mjs";

class RoundsGridManager {
  constructor() {
    this.roundsGridEl = document.getElementById("roundsGrid");

    this.createDataGrid();

    this.setupThemeWatcher();

    this.deleteRoundsEls = {};

    document.addEventListener("UpdateRounds", this);
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

  handleEditRound(event) {
    if (!IS_ME) {
      return;
    }

    if (event.newValue === event.oldValue) {
      return;
    }

    let formData = new FormData();
    formData.append(event.colDef.field, event.newValue);

    this.handlePostRequest(
      postRequest(EDIT_ROUND_URL + event.data.id, formData)
    );
  }

  async handlePostRequest(request) {
    let response = await request;
    let jsonResponse = await response.json();

    if (jsonResponse.handicap) {
      this.updateHandicap(jsonResponse.handicap);
    }
    if (jsonResponse.rounds) {
      this.updateRounds(jsonResponse.rounds);
    }
  }

  updateHandicap(handicap) {
    document.getElementById("handicap").textContent = handicap;
  }

  updateRounds(rounds) {
    this.dataGrid.setGridOption("rowData", rounds);
  }

  handleClick(event) {
    if (event.target.classList.contains("delete-button")) {
      let row = event.target.closest(".ag-row");
      let node = this.dataGrid.getRowNode(row.getAttribute("row-index"));
      let roundData = node.data;

      let deleteRoundEl = this.deleteRoundsEls[roundData.id];
      if (!deleteRoundEl) {
        deleteRoundEl = document.createElement("delete-round");
        deleteRoundEl.round = roundData;
        document.body.appendChild(deleteRoundEl);

        this.deleteRoundsEls[roundData.id] = deleteRoundEl;
      }

      deleteRoundEl.show();
    }
  }

  getTeeboxForCourse(teeboxId, course) {
    return course.teeboxes.find((t) => t.id === teeboxId);
  }

  createDataGrid() {
    const rowData = [];
    for (let round of ROUNDS) {
      rowData.push(round);
    }

    const columnDefs = [
      {
        field: "course",
        // editable: true,
        filter: "agTextColumnFilter",
        cellRenderer: (param) => {
          let course = COURSES[param.data.course_id];
          let teebox = this.getTeeboxForCourse(param.data.teebox_id, course); //course.teeboxes[param.data.teebox_id];

          return `${course.name} - ${teebox.teebox} (${teebox.rating} / ${teebox.slope})`;
        },
        comparator: (valueA, valueB, nodeA, nodeB, isDescending) => {
          let courseA = COURSES[nodeA.data.course_id];
          let courseB = COURSES[nodeB.data.course_id];

          return courseA.name.localeCompare(courseB.name);
        },
        filterValueGetter(param) {
          let course = COURSES[param.data.course_id];
          let teebox = this.getTeeboxForCourse(param.data.teebox_id, course); //course.teeboxes[param.data.teebox_id];

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
          let course = COURSES[param.data.course_id];
          let teebox = this.getTeeboxForCourse(param.data.teebox_id, course); //course.teeboxes[param.data.teebox_id];

          return `${param.data.score} / ${teebox.par} (${param.data.score_diff})`;
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

          return `<sl-format-date month="long" day="numeric" year="numeric" date="${
            date + "T00:00:00"
          }"></sl-format-date>`;
        },
      },
    ];

    if (IS_ME) {
      columnDefs.push({
        field: "actions",
        cellRenderer: () => {
          let button = document.createElement("sl-button");
          button.classList.add("delete-button");
          button.variant = "danger";
          button.size = "small";
          button.textContent = "Delete";
          button.addEventListener("click", this);
          return button;
        },
      });
    }

    const gridOptions = {
      columnDefs,
      rowData,
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
      onRowDataUpdated: (event) => {
        let height =
          document.querySelector(".ag-center-cols-container").scrollHeight +
          document.querySelector(".ag-header-row").scrollHeight +
          document.querySelector(".ag-paging-panel").scrollHeight;

        if (height < 192) {
          height = 192;
        }

        this.roundsGridEl.style.height = `${height + 4}px`;
      },
      defaultColDef: {
        resizable: false,
      },
      onCellEditingStopped: (event) => this.handleEvent(event),
      pagination: true,
      paginationPageSize: 20,
      paginationPageSizeSelector: false,
      getRowClass: (param) => {
        if (param.data.isIncluded) {
          return "bg-success-subtle";
        }
      },
    };
    this.dataGrid = agGrid.createGrid(this.roundsGridEl, gridOptions);
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
    let theme = document.documentElement.getAttribute("data-bs-theme");
    this.roundsGridEl.classList.toggle(
      "ag-theme-quartz-dark",
      theme === "dark"
    );
    this.roundsGridEl.classList.toggle("ag-theme-quartz", theme === "light");
  }
}

new RoundsGridManager();
