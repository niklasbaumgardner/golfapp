import { NikElement } from "./customElement.mjs";
import { html } from "./imports.mjs";

export class AddRound extends NikElement {
  constructor() {
    super();

    this.courses = [];
    for (let [id, course] of Object.entries(COURSES)) {
      this.courses.push(course);
    }

    this.courses.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
  }

  static properties = {
    teeboxes: { type: Array },
  };

  static get queries() {
    return {
      dialogEl: "wa-dialog",
      courseSelectEl: "#course",
      teeboxSelectEl: "#teebox",
      addRoundButton: "#add-round-button",
    };
  }

  show() {
    customElements.whenDefined("wa-dialog").then(() => {
      this.updateComplete.then(() => {
        this.dialogEl.updateComplete.then(() => {
          this.dialogEl.open = true;
        });
      });
    });
  }

  hide() {
    this.dialogEl.open = false;
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
      (c) => html`<wa-option value="${c.id}">${c.name}</wa-option>`
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
        html`<wa-option value="${t.id}"
          >${t.teebox} (${t.rating} / ${t.slope})</wa-option
        >`
    );
  }

  dateTemplate() {
    let date = new Date();
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, "0");
    let day = date.getDate().toString().padStart(2, "0");
    let strDate = year + "-" + month + "-" + day;

    return html`<wa-input
      class="grow"
      id="date"
      name="date"
      type="date"
      value="${strDate}"
      label="Date"
      required
    ></wa-input>`;
  }

  handleAddRoundClick() {
    this.addRoundButton.disabled = true;
    this.addRoundButton.loading = true;
  }

  render() {
    return html`<wa-dialog label="Add Round"
      ><form
        id="add-round-form"
        action="${ADD_ROUND_URL}"
        method="POST"
        class="wa-stack"
      >
        <wa-select
          id="course"
          name="course"
          label="Select a course"
          @input=${this.handleCourseSelect}
          hoist
          required
          >${this.coursesOptionTemplate()}</wa-select
        >
        <wa-select
          id="teebox"
          name="teebox"
          label="Select a teebox"
          hoist
          disabled
          required
          >${this.teeboxOptionsTemplate()}</wa-select
        >
        <small>
          <span>Don't see the course you're looking for?</span>
          <a href="${ADD_COURSE_URL}">Add a course here</a>
        </small>
        <div>
          <wa-radio-group
            label="Round type"
            name="nineHoleRound"
            value="False"
            orientation="horizontal"
            required
          >
            <wa-radio-button value="False" variant="success"
              >18 hole round</wa-radio-button
            >
            <wa-radio-button value="True" variant="success"
              >9 hole round</wa-radio-button
            >
          </wa-radio-group>
        </div>
        <div class="flex gap-(--wa-space-m)">
          <wa-input
            id="score"
            name="score"
            type="number"
            label="Score"
            class="grow"
            required
          ></wa-input
          >${this.dateTemplate()}
        </div>
        <div class="flex gap-(--wa-space-m) flex-nowrap">
          <wa-input
            id="fir"
            name="fir"
            type="number"
            class="min-w-0"
            label="FIR"
          ></wa-input>
          <wa-input
            id="gir"
            name="gir"
            type="number"
            class="min-w-0"
            label="GIR"
          ></wa-input>
          <wa-input
            id="putts"
            name="putts"
            type="number"
            class="min-w-0"
            label="Putts"
          ></wa-input>
        </div>
      </form>
      <div class="wa-cluster w-full" slot="footer">
        <wa-button
          id="close-button"
          class="grow"
          variant="neutral"
          appearance="outlined"
          data-dialog="close"
          >Cancel</wa-button
        >
        <wa-button
          id="add-round-button"
          form="add-round-form"
          type="submit"
          class="grow"
          variant="success"
          @click=${this.handleAddRoundClick}
          >Add round</wa-button
        >
      </div></wa-dialog
    >`;
  }
}

customElements.define("nb-add-round", AddRound);
