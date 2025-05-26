import { NikElement } from "./customElement.mjs";
import { html } from "./imports.mjs";
import "./nb-players-course-rating-grid.mjs";
import "./nb-add-course-rating.mjs";

class ViewCourseRating extends NikElement {
  static properties = {
    isMe: { type: Boolean },
    ratings: { type: Object },
    courses: { type: Object },
    theme: { type: String },
  };

  connectedCallback() {
    super.connectedCallback();

    document.addEventListener("UpdateRatings", this);
  }

  handleEvent(event) {
    switch (event.type) {
      case "UpdateRatings":
        this.handleUpdateRatings(event);
        break;
    }
  }

  handleUpdateRatings(event) {
    this.ratings = event.detail;
    this.addCourseRatingModal?.remove();
    delete this.addCourseRatingModal;
  }

  titleTemplate() {
    if (IS_ME) {
      return html`<h2>My Course Ratings</h2>`;
    }
    return html`<h2>${USER.username}'s Course Ratings</h2>`;
  }

  ratingsTemplate() {
    return html`<nb-players-course-rating-grid
      .ratings=${this.ratings}
      .courses=${this.courses}
      theme=${this.theme}
    ></nb-players-course-rating-grid>`;
  }

  addRatingButtonTemplate() {
    return html`<wa-button
      variant="success"
      appearance="filled outlined"
      @click=${this.handleAddRatingClick}
      >Add Rating</wa-button
    >`;
  }

  handleAddRatingClick() {
    if (!this.addCourseRatingModal) {
      this.addCourseRatingModal = document.createElement(
        "nb-add-course-rating"
      );

      this.addCourseRatingModal.courses = Array.from(
        this.courses.filter(
          (c) => !this.ratings.find((cr) => cr.course.id === c.id)
        )
      );
      document.body.appendChild(this.addCourseRatingModal);
    }

    this.addCourseRatingModal.show();
  }

  render() {
    return html`<wa-card
      ><div class="wa-stack">
        ${this.titleTemplate()}${this.addRatingButtonTemplate()}
        ${this.ratingsTemplate()}
      </div></wa-card
    >`;
  }
}
customElements.define("nb-view-course-rating", ViewCourseRating);
