import { createElement } from "./customElement.mjs";

let selectCourse = document.getElementById("course");

if (selectCourse) {
  selectCourse.addEventListener("input", onCourseSelect);

  for (let course of COURSES) {
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
  let teeboxes = COURSES.find((c) => c.id == courseId).teeboxes;
  createTeeboxElements(teeboxes);
}
