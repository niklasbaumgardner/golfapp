import { NikElement } from "./customElement.mjs";
import { html } from "./imports.mjs";
import "./playerStrokes.mjs";

class StrokesCard extends NikElement {
  constructor() {
    super();

    this.nextButtonEnabled = false;
  }

  connectedCallback() {
    super.connectedCallback();

    this.coursesArray = Object.values(this.courses);
    this.coursesArray.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    for (let [id, c] of Object.entries(this.courses)) {
      c.teeboxes.sort((a, b) => b.rating - a.rating);
    }

    this.playersArray = Object.values(this.players);
    this.playersArray.sort(
      (p1, p2) => p1.handicap.handicap - p2.handicap.handicap
    );
  }

  static properties = {
    courses: { type: Object },
    teeboxes: { type: Array },
    players: { type: Object },
    nextButtonEnabled: { type: Boolean },
    strokes: { type: Array },
    state: { type: String },
  };

  static get queries() {
    return {
      dialogEl: "sl-dialog",
      courseSelectEl: "#course",
      teeboxSelectEl: "#teebox",
      checkboxes: { all: "sl-checkbox" },
    };
  }

  get selectedCheckboxes() {
    return Array.from(this.checkboxes).filter((checkbox) => checkbox.checked);
  }

  get selectedPlayers() {
    return this.selectedCheckboxes.map((c) => this.players[c.value]);
  }

  maybeEnabledNextButton() {
    this.nextButtonEnabled =
      !!this.selectedCheckboxes.length && !!this.courseSelectEl.value;
  }

  calculateStrokesForPlayer(handicap, par, rating, slope) {
    return Math.round(handicap * (slope / 113) + (rating - par));
  }

  calculateStrokes(teebox = null) {
    let strokes = [];
    let { par, rating, slope } = teebox ?? this.teeboxes[0];
    for (let player of this.selectedPlayers) {
      let numStrokes = this.calculateStrokesForPlayer(
        player.handicap.handicap,
        par,
        rating,
        slope
      );
      strokes.push({
        id: player.id,
        username: player.username,
        strokes: numStrokes,
      });
    }

    strokes.sort((a, b) => a.strokes - b.strokes);
    let minStrokes = strokes[0].strokes;
    for (let obj of strokes) {
      obj.netStrokes = obj.strokes - minStrokes;
    }
    console.log(strokes);
    this.strokes = strokes;
  }

  playersStrokesTemplate() {
    return this.strokes.map(
      (x) =>
        html`<p>
          ${x.username} gets <b>${x.strokes}</b>
          ${x.strokes === 1 ? "stroke" : "strokes"} (net ${x.netStrokes}
          ${x.netStrokes === 1 ? "stroke" : "strokes"})
        </p>`
    );
  }

  playersTemplate() {
    return this.playersArray.map(
      (p) =>
        html`<sl-checkbox value="${p.id}"
          >${p.username} (${p.handicap.handicap_str})</sl-checkbox
        >`
    );
  }

  coursesOptionTemplate() {
    return this.coursesArray.map(
      (c) => html`<sl-option value="${c.id}">${c.name}</sl-option>`
    );
  }

  teeboxOptionsTemplate() {
    return this.teeboxes.map(
      (t) =>
        html`<sl-option value="${t.id}"
          >${t.teebox} (${t.rating} / ${t.slope})</sl-option
        >`
    );
  }

  reset() {
    this.strokes = [];
    this.calculated = false;
  }

  handleTeeboxChange(event) {
    console.log(event);
  }

  teeboxSelectionTemplate() {
    return html`<div class="row">
      ${this.selectedPlayers
        .flatMap((p) => [
          html`<player-strokes></player-strokes>`,
          html`<div><sl-divider></sl-divider></div>`,
        ])
        .slice(0, -1)}
    </div>`;
  }

  handleNextButtonClick() {
    this.teeboxes = Object.values(
      this.courses[this.courseSelectEl.value].teeboxes
    );

    this.teeboxes.sort((a, b) => {
      return b.slope - a.slope;
    });

    this.state = "TEEBOX_SELECTION";

    this.calculateStrokes();
  }

  render() {
    let content;
    if (this.state === "TEEBOX_SELECTION") {
      content = html`${this.teeboxSelectionTemplate()}`;
    } else {
      content = html`<div class="row" @sl-input=${this.maybeEnabledNextButton}>
          <div class="col-12 col-md-6 mb-5">
            <div class="d-flex flex-column">
              <sl-select
                id="course"
                name="course"
                label="Select a course"
                hoist
                required
                >${this.coursesOptionTemplate()}</sl-select
              >
            </div>
          </div>
          <div class="col-12 col-md-6 mb-5">
            <div class="d-flex flex-column">
              <label>Select players:</label>${this.playersTemplate()}
            </div>
          </div>
        </div>
        <div class="row">
          <sl-button
            variant="success"
            ?disabled=${!this.nextButtonEnabled}
            @click=${this.handleNextButtonClick}
            >Next</sl-button
          >
        </div>`;
    }

    return html`<sl-card
      ><h2 slot="header">Calculate strokes</h2>
      ${content}</sl-card
    >`;

    if (this.calculated) {
      return html`<sl-card>
        <h2 slot="header">Calculate strokes</h2>
        <div class="row mb-5">${this.playersStrokesTemplate()}</div>
        <div class="row">
          <sl-button variant="success" outline @click=${this.reset}
            >Try again</sl-button
          >
        </div>
      </sl-card>`;
    }

    return html`<sl-card @sl-input=${this.maybeEnabledButton}
      ><h2 slot="header">Calculate strokes</h2>
      <div class="row">
        <div class="col-12 col-md-6 mb-5">
          <div class="d-flex flex-column">
            <label>Select players:</label>${this.playersTemplate()}
          </div>
        </div>
        <div
          class="col-12 col-md-6 mb-5"
          style="gap:var(--sl-spacing-x-small);"
        >
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
      </div>
      <div class="row">
        <sl-button
          variant="success"
          ?disabled=${!this.buttonEnabled}
          @click=${this.handleCalculateStrokes}
          >Calculate strokes</sl-button
        >
      </div></sl-card
    >`;
  }
}
export default StrokesCard;

customElements.define("strokes-card", StrokesCard);
