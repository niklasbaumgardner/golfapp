import { NikElement } from "./customElement.mjs";
import { html } from "./imports.mjs";
import { postRequest } from "./fetch.mjs";

class AddRound extends NikElement {
  constructor() {
    super();

    this.courses = [];
    for (let [id, course] of Object.entries(COURSES)) {
      this.courses.push(course);
    }

    this.courses.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    this.addNewRoundButton = document.getElementById("addNewRoundButton");
    if (this.addNewRoundButton) {
      this.addNewRoundButton.addEventListener("click", () =>
        this.toggleNewRoundDialogVisibility()
      );
    }
  }

  static properties = {
    teeboxes: { type: Array },
  };

  static get queries() {
    return {
      dialogEl: "sl-dialog",
      courseSelectEl: "#course",
      teeboxSelectEl: "#teebox",
    };
  }

  toggleNewRoundDialogVisibility() {
    if (this.dialogEl.open) {
      this.dialogEl.hide();
    } else {
      this.dialogEl.show();
    }
  }

  async handleCourseSelect(event) {
    this.teeboxSelectEl.value = "";

    this.teeboxes = Object.values(COURSES[this.courseSelectEl.value].teeboxes);

    await this.updateComplete;
    await this.teeboxSelectEl.updateComplete;

    if (this.teeboxes.length === 1) {
      this.teeboxSelectEl.value = `${this.teeboxes[0].id}`;
    }

    this.teeboxSelectEl.disabled = this.teeboxes.length === 0;
  }

  coursesOptionTemplate() {
    return this.courses.map(
      (c) => html`<sl-option value="${c.id}">${c.name}</sl-option>`
    );
  }

  teeboxOptionsTemplate() {
    if (!this.courseSelectEl?.value) {
      return null;
    }

    this.teeboxes.sort((a, b) => {
      return b.slope - a.slope;
    });

    return this.teeboxes.map(
      (t) =>
        html`<sl-option value="${t.id}"
          >${t.teebox} (${t.rating} / ${t.slope})</sl-option
        >`
    );
  }

  dateTemplate() {
    let date = new Date();
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, "0");
    let day = date.getDate().toString().padStart(2, "0");
    let strDate = year + "-" + month + "-" + day;

    return html`<sl-input
      id="date"
      name="date"
      type="date"
      value="${strDate}"
      class="col-6"
      label="Date"
      required
    ></sl-input>`;
  }

  render() {
    return html`<sl-dialog label="Add a new round"
      ><form
        action="${ADD_ROUND_URL}"
        method="POST"
        style="display:flex;flex-direction:column;gap:var(--sl-spacing-small);"
      >
        <div class="row" style="gap:var(--sl-spacing-x-small);">
          <sl-select
            id="course"
            name="course"
            label="Select a course"
            @sl-input=${this.handleCourseSelect}
            hoist
            required
            >${this.coursesOptionTemplate()}</sl-select
          >
          <sl-select
            id="teebox"
            name="teebox"
            label="Select a teebox"
            hoist
            disabled
            required
            >${this.teeboxOptionsTemplate()}</sl-select
          >
          <small>
            <span>Don't see the course you're looking for?</span>
            <a href="${ADD_COURSE_URL}">Add a course here</a>
          </small>
        </div>
        <div class="row">
          <sl-radio-group
            label="Round type"
            name="nineHoleRound"
            value="False"
            required
          >
            <sl-radio-button value="False" variant="success"
              >18 hole round</sl-radio-button
            >
            <sl-radio-button value="True" variant="success"
              >9 hole round</sl-radio-button
            >
          </sl-radio-group>
        </div>
        <div class="row">
          <sl-input
            id="score"
            name="score"
            type="number"
            class="col-6"
            label="Score"
            required
          ></sl-input
          >${this.dateTemplate()}
        </div>
        <div class="row">
          <sl-input
            id="fir"
            name="fir"
            type="number"
            class="col-4"
            label="FIR"
          ></sl-input>
          <sl-input
            id="gir"
            name="gir"
            type="number"
            class="col-4"
            label="GIR"
          ></sl-input>
          <sl-input
            id="putts"
            name="putts"
            type="number"
            class="col-4"
            label="Putts"
          ></sl-input>
        </div>
        <div class="row mt-3">
          <sl-button id="close-button" class="col-6" variant="neutral" outline
            >Cancel</sl-button
          >
          <sl-button type="submit" class="col-6" variant="success"
            >Add round</sl-button
          >
        </div>
      </form></sl-dialog
    >`;
  }
}
export default AddRound;

customElements.define("add-round", AddRound);
