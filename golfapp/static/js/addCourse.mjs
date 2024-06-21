import { NikElement, html } from "./customElement.mjs";

function match(name, courses) {
  const regex = new RegExp(".*" + name + ".*", "i");
  return courses.filter((course) => regex.test(course.replace(" ", "")));
}

class AddCourseEl extends NikElement {
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
  };

  get currentCourse() {
    return COURSES.find((c) => c.id == this.courseSelectEl.value);
  }

  get currentTeeboxNames() {
    return this.existingTeeboxes?.map((t) => t.teebox);
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

    this.similarCourses = match(this.courseInputEl.value, COURSE_NAMES);
  }

  coursesOptionTemplate() {
    return COURSES.map(
      (c) => html`<sl-option value="${c.id}">${c.name}</sl-option>`
    );
  }

  existingTeeboxesTemplate() {
    return this.existingTeeboxes?.map(
      (t) => html`<li>${t.teebox} (${t.rating} / ${t.slope})</li>`
    );
  }

  existingCoursesTemplate() {
    return this.similarCourses?.map((c) => html`<li>${c}</li>`);
  }

  addTeeboxTemplate() {
    return html`<sl-tab-panel name="addteebox" style="overflow: clip;">
      <form action="${ADD_TEEBOX_URL}" method="POST">
        <div class="d-flex flex-column" style="gap:var(--sl-spacing-small);">
          <sl-select
            class="w-100"
            id="course"
            name="course"
            label="Select a course"
            @sl-input=${this.updateTeeboxes}
            hoist
            required
            >${this.coursesOptionTemplate()}</sl-select
          >
          <ul>
            ${this.existingTeeboxesTemplate()}
          </ul>
          <sl-input
            id="teebox"
            name="teebox"
            label="Teebox name"
            required
          ></sl-input>
          <div class="row">
            <sl-input
              name="par"
              label="Par"
              class="col-4"
              type="number"
              step="1"
              required
            ></sl-input>
            <sl-input
              name="rating"
              label="Rating"
              class="col-4"
              type="number"
              step=".1"
              required
            ></sl-input>
            <sl-input
              name="slope"
              label="Slope"
              class="col-4"
              type="number"
              step="1"
              required
            ></sl-input>
          </div>
          <sl-button type="submit" class="w-100" variant="success"
            >Add teebox</sl-button
          >
        </div>
      </form>
    </sl-tab-panel>`;
  }

  addCourseTemplate() {
    return html`<sl-tab-panel name="addcourse" style="overflow: clip;">
      <form action="${ADD_COURSE_URL}" method="POST">
        <div class="d-flex flex-column" style="gap:var(--sl-spacing-small);">
          <sl-input
            id="courseInput"
            name="name"
            label="Course name"
            @sl-input=${this.checkCourseName}
            required
          ></sl-input>
          <ul>
            ${this.existingCoursesTemplate()}
          </ul>
          <sl-input name="teebox" label="Teebox name" required></sl-input>
          <div class="row">
            <sl-input
              name="par"
              label="Par"
              class="col-4"
              type="number"
              step="1"
              required
            ></sl-input>
            <sl-input
              name="rating"
              label="Rating"
              class="col-4"
              type="number"
              step=".1"
              required
            ></sl-input>
            <sl-input
              name="slope"
              label="Slope"
              class="col-4"
              type="number"
              step="1"
              required
            ></sl-input>
          </div>
          <sl-button type="submit" class="w-100" variant="success"
            >Add course</sl-button
          >
        </div>
      </form>
    </sl-tab-panel>`;
  }

  render() {
    return html`<sl-card>
      <h2>Add a course or teebox</h2>
      <sl-divider class="w-100"></sl-divider>
      <sl-tab-group>
        <sl-tab slot="nav" panel="addteebox">Add Teebox</sl-tab>
        <sl-tab slot="nav" panel="addcourse">Add Course</sl-tab>

        ${this.addTeeboxTemplate()}
        ${this.addCourseTemplate()}
    </sl-card>`;
  }
}
customElements.define("add-course-el", AddCourseEl);
