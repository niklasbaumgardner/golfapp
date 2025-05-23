import { NikElement } from "./customElement.mjs";
import { html } from "./imports.mjs";

function match(name, courses) {
  const regex = new RegExp(".*" + name + ".*", "i");
  return courses.filter((course) => regex.test(course.replace(" ", "")));
}

export class AddCourse extends NikElement {
  static get queries() {
    return {
      courseSelectEl: "#course",
      courseInputEl: "#courseInput",
      teeboxInputEl: "#teebox",
    };
  }

  static properties = {
    existingTeeboxes: { type: Array },
    similarCourses: { type: Array },
    courses: { type: Object },
  };

  get currentCourse() {
    return this.courses.find((c) => c.id == this.courseSelectEl.value);
  }

  get currentTeeboxNames() {
    return this.existingTeeboxes?.map((t) => t.teebox);
  }

  connectedCallback() {
    super.connectedCallback();

    this.init();
  }

  init() {
    this.courses.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    this.courseNames = this.courses.map((c) => c.name);
  }

  updateTeeboxes() {
    this.existingTeeboxes = this.currentCourse?.teeboxes.sort(
      (a, b) => b.rating - a.rating
    );
  }

  checkCourseName() {
    if (this.courseInputEl.value.length < 2) {
      this.similarCourses = [];
    }

    if (this.courseInputEl.value.length < 3) {
      return;
    }

    this.similarCourses = match(this.courseInputEl.value, this.courseNames);
  }

  coursesOptionTemplate() {
    return this.courses.map(
      (c) => html`<wa-option value="${c.id}">${c.name}</wa-option>`
    );
  }

  existingTeeboxesTemplate() {
    if (!this.existingTeeboxes) {
      return null;
    }

    let teeboxes = this.existingTeeboxes?.map(
      (t) => html`<li>${t.teebox} (${t.rating} / ${t.slope})</li>`
    );

    return html`<ul>
      ${teeboxes}
    </ul>`;
  }

  existingCoursesTemplate() {
    if (!this.similarCourses) {
      return null;
    }

    let courses = this.similarCourses?.map((c) => html`<li>${c}</li>`);

    return html`<ul>
      ${courses}
    </ul>`;
  }

  addTeeboxTemplate() {
    return html`<wa-tab-panel name="addteebox">
      <form action="${ADD_TEEBOX_URL}" method="POST">
        <div class="wa-stack">
          <div>
            <wa-select
              class=""
              id="course"
              name="course"
              label="Select a course"
              @input=${this.updateTeeboxes}
              hoist
              required
              >${this.coursesOptionTemplate()}</wa-select
            >
            ${this.existingTeeboxesTemplate()}
          </div>
          <wa-input
            id="teebox"
            name="teebox"
            label="Teebox name"
            required
          ></wa-input>
          <div class="flex gap-(--wa-space-m) flex-nowrap">
            <wa-input
              name="par"
              label="Par"
              class="min-w-0"
              type="number"
              step="1"
              required
            ></wa-input>
            <wa-input
              name="rating"
              label="Rating"
              class="min-w-0"
              type="number"
              step=".1"
              required
            ></wa-input>
            <wa-input
              name="slope"
              label="Slope"
              class="min-w-0"
              type="number"
              step="1"
              required
            ></wa-input>
          </div>
          <wa-button type="submit" class="w-full" variant="success"
            >Add Teebox</wa-button
          >
        </div>
      </form>
    </wa-tab-panel>`;
  }

  addCourseTemplate() {
    return html`<wa-tab-panel name="addcourse">
      <form action="${ADD_COURSE_URL}" method="POST">
        <div class="wa-stack">
          <div>
            <wa-input
              id="courseInput"
              name="name"
              label="Course name"
              @input=${this.checkCourseName}
              required
            ></wa-input>
            ${this.existingCoursesTemplate()}
          </div>
          <wa-input name="teebox" label="Teebox name" required></wa-input>
          <div class="flex gap-(--wa-space-m) flex-nowrap">
            <wa-input
              name="par"
              label="Par"
              class="min-w-0"
              type="number"
              step="1"
              required
            ></wa-input>
            <wa-input
              name="rating"
              label="Rating"
              class="min-w-0"
              type="number"
              step=".1"
              required
            ></wa-input>
            <wa-input
              name="slope"
              label="Slope"
              class="min-w-0"
              type="number"
              step="1"
              required
            ></wa-input>
          </div>
          <wa-button type="submit" class="w-full" variant="success"
            >Add Course</wa-button
          >
        </div>
      </form>
    </wa-tab-panel>`;
  }

  render() {
    return html`<wa-card>
      <h2>Add Course or Teebox</h2>
      <wa-tab-group>
        <wa-tab slot="nav" panel="addteebox">Add Teebox</wa-tab>
        <wa-tab slot="nav" panel="addcourse">Add Course</wa-tab>

        ${this.addTeeboxTemplate()}
        ${this.addCourseTemplate()}
    </wa-card>`;
  }
}

customElements.define("nb-add-course", AddCourse);
