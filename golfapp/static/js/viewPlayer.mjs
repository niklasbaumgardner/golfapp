import { createElement } from "./customElement.mjs";
import { Round } from "./round.mjs";
import { Pagination } from "./pagination.mjs";
import * as chartJs from "https://cdn.jsdelivr.net/npm/chart.js@3.6.2/+esm";

for (let r of roundsPy) {
  let round = new Round(...r);
  roundsArray.push(round);
}

let coursesArray = [];
for (let [id, course] of Object.entries(COURSES)) {
  coursesArray.push(course);
}

coursesArray.sort((a, b) => {
  return a.name.localeCompare(b.name);
});

let selectCourse = document.getElementById("course");

if (selectCourse) {
  selectCourse.addEventListener("input", onCourseSelect);

  for (let course of coursesArray) {
    let courseOption = createElement({
      type: "option",
      value: course.id,
      content: course.name, //`${course.name} - ${course.teebox} (${course.rating} / ${course.slope})`
    });
    selectCourse.appendChild(courseOption);
  }
}

const pagination = new Pagination(
  roundsArray,
  TOTAL_ROUNDS,
  CURRENT_PAGE,
  NUM_PAGES
);

const COLORS = {
  light: {
    labelColor: "rgb(33, 37, 41)",
    gridColor: "rgba(0, 0, 0, .11)",
    tickColor: "rgb(33, 37, 41)",
  },
  dark: {
    labelColor: "rgb(173, 181, 189)",
    gridColor: "rgba(255, 255, 255, .11)",
    tickColor: "rgb(173, 181, 189)",
  },
};
let theme = document.documentElement.dataset.bsTheme;

chartJs.Chart.register(...chartJs.registerables);

let roundsReversed = roundsArray.toReversed();
let data = roundsReversed.map((obj) => {
  return obj.score;
});
let labels = roundsReversed.map((obj) => {
  let courseName = COURSES[obj.course_id].name;
  return [`${obj.score} at ${courseName}`, dateAsString(obj.date)];
});

const ctx = document.getElementById("rounds-graph").getContext("2d");
let lineChart = createBarChart(ctx, data, labels);

let observer = new MutationObserver((mutations) => {
  theme = document.documentElement.dataset.bsTheme;
  if (lineChart) {
    lineChart.destroy();
  }
  lineChart = createBarChart(ctx, data, labels);
});

observer.observe(document.documentElement, { attributes: true });

function dateAsString(date) {
  date = new Date(date + "T00:00:00");
  let options = { month: "long", day: "numeric", year: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

function createTeeboxElements(teeboxes) {
  let teeboxSelect = document.getElementById("teebox");
  let children = teeboxSelect.children;
  for (let i = children.length; i > 0; i--) {
    let child = children[i - 1];
    child.remove();
  }
  teeboxSelect.hidden = false;

  let teeboxesArr = Object.entries(teeboxes);

  if (teeboxesArr.length > 1) {
    let defaultOption = createElement({
      type: "option",
      value: "",
      content: "Select teebox",
      hidden: true,
      disabled: true,
      selected: true,
    });
    teeboxSelect.appendChild(defaultOption);
  }

  for (let [id, teebox] of teeboxesArr) {
    let option = createElement({
      type: "option",
      value: teebox.id,
      content: `${teebox.teebox} (${teebox.rating} / ${teebox.slope})`,
    });
    teeboxSelect.appendChild(option);
  }
}

function onCourseSelect(event) {
  let courseId = event.target.value;
  let teeboxes = COURSES[courseId].teeboxes;
  let courseNotFoundText = document.getElementById("course-not-found-text");
  courseNotFoundText.hidden = true;
  createTeeboxElements(teeboxes);
}

function createBarChart(ctx, data, labels) {
  return new chartJs.Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          id: "handicap",
          data,
          backgroundColor: "rgb(0, 184, 148)",
          borderColor: "rgb(0, 184, 148)",
          borderWidth: 2,
          color: COLORS[theme].labelColor,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false,
          labels: {
            color: COLORS[theme].labelColor,
          },
        },
        title: {
          display: true,
          text: "Most recent rounds",
          color: COLORS[theme].labelColor,
          font: {
            size: 19,
            weight: "normal",
          },
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          labels: {
            color: COLORS[theme].labelColor,
          },
          grid: {
            color: COLORS[theme].gridColor,
          },
          ticks: {
            color: COLORS[theme].tickColor,
          },
        },
        x: {
          grid: {
            color: COLORS[theme].gridColor,
          },
          ticks: {
            color: COLORS[theme].tickColor,
            maxRotation: 90,
            minRotation: 90,
          },
        },
      },
    },
  });
}
