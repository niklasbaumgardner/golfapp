import { postRequest } from "./fetch.mjs";

class RoundsGridManager {
  constructor() {
    this.roundsGridEl = document.getElementById("roundsGrid");

    this.createDataGrid();

    this.setupThemeWatcher();
  }

  handleEvent(event) {
    switch (event.type) {
      case "cellEditingStopped":
        this.handleEditRound(event);
    }
    console.log(event);
  }

  async handleEditRound(event) {
    if (event.newValue === event.oldValue) {
      return;
    }

    let formData = new FormData();
    formData.append(event.colDef.field, event.newValue);

    console.log(formData);
    let respone = await postRequest(EDIT_ROUND_URL + event.data.id, formData);
    console.log(respone);
    let jsonResponse = await respone.json();

    if (jsonResponse.rounds) {
      this.dataGrid.setGridOption("rowData", jsonResponse.rounds);
    }
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
          let teebox = course.teeboxes[param.data.teebox_id];

          return `${course.name} - ${teebox.teebox} (${teebox.rating} / ${teebox.slope})`;
        },
        comparator: (valueA, valueB, nodeA, nodeB, isDescending) => {
          let courseA = COURSES[nodeA.data.course_id];
          let courseB = COURSES[nodeB.data.course_id];

          return courseA.name.localeCompare(courseB.name);
        },
        filterValueGetter(param) {
          let course = COURSES[param.data.course_id];
          let teebox = course.teeboxes[param.data.teebox_id];

          return `${course.name} - ${teebox.teebox} (${teebox.rating} / ${teebox.slope})`;
        },
      },
      {
        field: "score",
        headerName: "Score / Par",
        editable: true,
        filter: "agNumberColumnFilter",
        cellEditor: "agNumberCellEditor",
        cellEditorParams: {
          step: 1,
        },
        cellRenderer: (param) => {
          let course = COURSES[param.data.course_id];
          let teebox = course.teeboxes[param.data.teebox_id];

          return `${param.data.score} / ${teebox.par} (${param.data.score_diff})`;
        },
      },
      {
        field: "fir",
        headerName: "FIR",
        editable: true,
        filter: "agNumberColumnFilter",
        cellEditor: "agNumberCellEditor",
        cellEditorParams: {
          step: 1,
        },
      },
      {
        field: "gir",
        headerName: "GIR",
        editable: true,
        filter: "agNumberColumnFilter",
        cellEditor: "agNumberCellEditor",
        cellEditorParams: {
          step: 1,
        },
      },
      {
        field: "putts",
        editable: true,
        filter: "agNumberColumnFilter",
        cellEditor: "agNumberCellEditor",
        cellEditorParams: {
          step: 1,
        },
      },
      {
        field: "date",
        editable: true,
        filter: "agDateColumnFilter",
        cellEditor: "agDateStringCellEditor",
        cellRenderer: (param) => {
          let date = param.data.date;

          return `<sl-format-date  month="long" day="numeric" year="numeric" date="${
            date + "T00:00:00"
          }"></sl-format-date>`;
        },
      },
    ];

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
