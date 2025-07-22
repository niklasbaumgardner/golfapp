import { html } from "./bundle.mjs";
import { AddCourseRating } from "./nb-add-course-rating.mjs";

export class EditCourseRating extends AddCourseRating {
  static properties = {
    rating: { type: Object },
  };

  static get queries() {
    return {
      dialogEl: "wa-dialog",
      form: "form",
      editRatingButton: "#edit-rating-button",
    };
  }

  init() {}

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
    this.editRatingButton.disabled = false;
    this.editRatingButton.loading = false;

    this.dialogEl.open = false;
  }

  courseTemplate() {
    return html`<div>
      <div class="wa-heading-">Course:</div>
      <div class="wa-heading-m">${this.rating.course.name}</div>
      <input
        name="course"
        type="text"
        value=${this.rating.course.id}
        class="hidden"
        hidden
      />
    </div>`;
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
      required
      value=${this.rating.rating}
    ></wa-input>`;
  }

  saveButtonTemplate() {
    return html`<wa-button
      id="edit-rating-button"
      class="grow"
      variant="brand"
      @click=${this.handleEditRatingClick}
      >Save</wa-button
    >`;
  }

  async handleEditRatingClick() {
    if (!this.form.reportValidity()) {
      return;
    }

    this.editRatingButton.disabled = true;
    this.editRatingButton.loading = true;

    let formData = new FormData(this.form);

    let response = await fetch(this.rating.edit_rating_url, {
      method: "POST",
      body: formData,
    });

    let jsonResponse = await response.json();

    document.dispatchEvent(
      new CustomEvent("UpdateRatings", {
        detail: jsonResponse.ratings,
        bubbles: true,
      })
    );

    this.hide();
  }
}

customElements.define("nb-edit-course-rating", EditCourseRating);
