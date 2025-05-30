import { NikElement } from "./customElement.mjs";
import { html } from "./imports.mjs";

export class AddCourseRating extends NikElement {
  static properties = {
    courses: { type: Object },
    label: { type: String },
    formId: { type: String },
    formAction: { type: String },
  };

  static get queries() {
    return {
      dialogEl: "wa-dialog",
      courseSelectEl: "#course",
      addRatingButton: "#add-rating-button",
      form: "form",
    };
  }

  constructor() {
    super();

    this.label = "Add Course Rating";
    this.formId = "add-rating-form";
    this.formAction = ADD_COURSE_RATING_URL;
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

  courseTemplate() {
    return html`<wa-select
      id="course"
      name="course"
      label="Select a course"
      @input=${this.handleCourseSelect}
      hoist
      required
      >${this.coursesOptionTemplate()}</wa-select
    >`;
  }

  ratingTemplate() {
    return html`<wa-input
      id="rating"
      name="rating"
      type="number"
      label="Rating"
      min="0"
      max="10"
      step="0.01"
      placeholder="1.23"
      required
    ></wa-input>`;
  }

  saveButtonTemplate() {
    return html`<wa-button
      id="add-rating-button"
      form=${this.formId}
      class="grow"
      variant="brand"
      type="submit"
      @click=${this.handleAddRatingClick}
      >Save</wa-button
    >`;
  }

  handleAddRatingClick() {
    if (this.form.reportValidity()) {
      this.addRatingButton.disabled = true;
      this.addRatingButton.loading = true;
    }
  }

  render() {
    return html`<wa-dialog label=${this.label}
      ><form
        id=${this.formId}
        action=${this.formAction}
        method="POST"
        class="wa-stack"
      >
        ${this.courseTemplate()}${this.ratingTemplate()}
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
        ${this.saveButtonTemplate()}
      </div></wa-dialog
    >`;
  }
}

customElements.define("nb-add-course-rating", AddCourseRating);
