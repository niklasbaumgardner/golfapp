import { NikElement } from "./nik-element.mjs";
import { html } from "./bundle.mjs";
import "./nb-course-ratings-grid.mjs";

class CourseRatings extends NikElement {
  static properties = {
    ratings: { type: Object },
    theme: { type: String },
  };

  ratingsTemplate() {
    return html`<nb-course-ratings-grid
      .ratings=${this.ratings}
      theme=${this.theme}
    ></nb-course-ratings-grid>`;
  }

  render() {
    return html`<div class="wa-stack">
      <h2>Course Ratings</h2>
      ${this.ratingsTemplate()}
    </div>`;
  }
}
customElements.define("nb-course-ratings", CourseRatings);
