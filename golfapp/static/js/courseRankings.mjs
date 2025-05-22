class RankingsGridManager {
  constructor() {
    this.rankingsGridEl = document.getElementById("rankingsGrid");

    this.parseData();

    this.createDataGrid();

    this.setupThemeWatcher();
  }

  rankCourses(courseRankings) {
    let courseData = this.getAverageCourseRating(courseRankings);
    courseData.sort((a, b) => b.averageRating - a.averageRating);

    let rank = 1;
    for (let [i, rankData] of courseData.entries()) {
      if (i === 0) {
      } else if (
        rankData.averageRating === courseData.at(i - 1).averageRating
      ) {
      } else {
        rank = i + 1;
      }
      rankData.rank = rank;
    }

    return courseData;
  }

  getAverageCourseRating(courseRankings) {
    let courseData = {};
    for (let courseRanking of courseRankings) {
      if (courseData[courseRanking.course.id]) {
        courseData[courseRanking.course.id].array.push(courseRanking);
      } else {
        courseData[courseRanking.course.id] = { ...courseRanking.course };
        courseData[courseRanking.course.id].array = [courseRanking];
      }
    }

    for (let [_, obj] of Object.entries(courseData)) {
      obj.averageRating = this.averageRating(obj.array);
    }

    return Object.values(courseData);
  }

  getWeight(number) {
    return Math.min(95 + number, 100) / 100;
  }

  averageRating(array) {
    let averageRating =
      array.reduce(
        (acumulator, currentValue) => acumulator + currentValue.rating,
        0
      ) / array.length;

    let weight = this.getWeight(array.length);
    return Math.round((averageRating * weight + Number.EPSILON) * 100) / 100;
  }

  parseData() {
    this.rankings = this.rankCourses(COURSE_RANKINGS_ARRAY);
  }

  createDataGrid() {
    const rowData = this.rankings;

    const columnDefs = [
      {
        field: "rank",
      },
      {
        field: "name",
        headerName: "Course",
      },
      {
        field: "averageRating",
      },
      {
        field: "array",
        headerName: "All Ratings",
        cellRenderer: (param) => {
          let rankings = param.data.array.map(
            (x) =>
              `<a class="rating-by-user" href="/course_ranking/${x.user.id}" title="Rating from ${x.user.username}">${x.rating} by ${x.user.username}</a>`
          );

          return rankings.join('<span class="rating-by-user">, </span>');
        },
      },
    ];

    const gridOptions = {
      columnDefs,
      rowData,
      autoSizeStrategy: {
        type: "fitCellContents",
        skipHeader: false,
      },
      onRowDataUpdated: (event) => {
        let height =
          document.querySelector(".ag-center-cols-container").scrollHeight +
          document.querySelector(".ag-header-row").scrollHeight +
          document.querySelector(".ag-paging-panel").scrollHeight;

        if (height < 192) {
          height = 192;
        }

        this.rankingsGridEl.style.height = `${height + 3}px`;
      },
    };
    this.dataGrid = agGrid.createGrid(this.rankingsGridEl, gridOptions);
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
    this.rankingsGridEl.classList.toggle(
      "ag-theme-alpine-dark",
      theme === "dark"
    );
    this.rankingsGridEl.classList.toggle("ag-theme-alpine", theme === "light");
  }
}

new RankingsGridManager();
