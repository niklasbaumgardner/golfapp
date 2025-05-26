import { NikElement } from "./customElement.mjs";
import { html } from "./imports.mjs";

export class AddCourseRating extends NikElement {
  static properties = {
    courses: { type: Object },
  };

  static get queries() {
    return {
      dialogEl: "wa-dialog",
      courseSelectEl: "#course",
      addRatingButton: "#add-rating-button",
    };
  }

  connectedCallback() {
    super.connectedCallback();

    this.init();
  }

  init() {
    this.courses.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
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

  coursesOptionTemplate() {
    return this.courses.map(
      (c) => html`<wa-option value="${c.id}">${c.name}</wa-option>`
    );
  }

  handleAddRatingClick() {
    this.addRoundButton.disabled = true;
    this.addRoundButton.loading = true;
  }

  render() {
    return html`<wa-dialog label="Add Course Rating"
      ><form
        id="add-rating-form"
        action="${ADD_COURSE_RATING_URL}"
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
        <wa-input
          id="rating"
          name="rating"
          type="number"
          label="Rating"
          min="0"
          max="10"
          step="0.01"
          placeholder="1.23"
        ></wa-input>
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
          id="add-rating-button"
          form="add-rating-form"
          type="submit"
          class="grow"
          variant="success"
          @click=${this.handleAddRatingClick}
          >Add Rating</wa-button
        >
      </div></wa-dialog
    >`;
  }
}

customElements.define("nb-add-course-rating", AddCourseRating);
