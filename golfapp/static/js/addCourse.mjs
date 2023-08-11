import { NikElement, html } from "./customElement.mjs";

let allCoursesLower;
async function getPageData() {
  let respone = await fetch(GET_COURSE_TEEBOX_DATA);
  let data = await respone.json();

  console.log(data);

  let coursesData = data.course_teebox_data;
  allCoursesLower = Array.from(coursesData, (obj) =>
    obj.course.name.toLowerCase()
  );

  addEventListenerToInput();
  addCoursesToPage(coursesData);
}
getPageData();

function check_existing_courses(event) {
  let name = event.target.value.toLowerCase();
  let matchingDiv = document.querySelector("#matching-courses-div");
  matchingDiv.hidden = true;
  if (name.length < 3) {
    return;
  }

  let matches = [];

  for (let course of allCoursesLower) {
    if (course.includes(name)) {
      console.log(course, name);
      matches.push(course);
    }
  }
  let listDiv = document.querySelector("#matching-courses-list");
  listDiv.innerHTML = "";

  if (matches < 1) {
    return;
  }

  matchingDiv.hidden = false;

  for (let match of matches) {
    let span = document.createElement("span");
    span.innerText = " - " + match;
    listDiv.appendChild(span);
  }
}

function addEventListenerToInput() {
  document
    .getElementById("course_name")
    .addEventListener("input", check_existing_courses);
}

function addCoursesToPage(coursesData) {
  coursesData.sort((a, b) => {
    return a.course.name.localeCompare(b.course.name);
  });

  let anchor = document.getElementById("existing-courses");

  for (let obj of coursesData) {
    let listEl = document.createElement("list-element");
    listEl.courseData = obj;
    listEl.classList.add("list-group-item", "list-group-item-light");
    anchor.appendChild(listEl);
  }
}

class ListElement extends NikElement {
  static properties = {
    courseData: { type: Object },
  };

  getTeeboxesTemplate() {
    let teeboxes = "";
    for (let teebox of this.courseData.teeboxes) {
      teeboxes += `${teebox.teebox}: ${teebox.par} - ${teebox.rating}/${teebox.slope}, `;
    }
    return teeboxes.slice(0, teeboxes.length - 2);
  }

  render() {
    return html`<span
      >${this.courseData.course.name} (${this.getTeeboxesTemplate()})</span
    >`;
  }
}
customElements.define("list-element", ListElement);
