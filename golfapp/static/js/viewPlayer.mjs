import { createElement } from "./customElement.mjs";
import { Round } from "./round.mjs";
import { Pagination } from "./pagination.mjs";

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

const pagination = new Pagination(
  roundsArray,
  TOTAL_ROUNDS,
  CURRENT_PAGE,
  NUM_PAGES
);
