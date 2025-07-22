import { NikElement } from "./nik-element.mjs";
import { html } from "./bundle.mjs";
import "./nb-player-strokes.mjs";

export class CalculateStrokes extends NikElement {
  static properties = {
    courses: { type: Object },
    teeboxes: { type: Array },
    players: { type: Object },
    nextButtonEnabled: { type: Boolean },
    strokes: { type: Object },
    state: { type: String },
    selectedCourse: { type: Number },
  };

  static get queries() {
    return {
      dialogEl: "wa-dialog",
      courseSelectEl: "#course",
      teeboxSelectEl: "#teebox",
      checkboxes: { all: "wa-checkbox" },
      playerStrokes: { all: "nb-player-strokes" },
    };
  }

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

  get selectedCheckboxes() {
    return Array.from(this.checkboxes).filter((checkbox) => checkbox.checked);
  }

  calculateStrokesForPlayer(handicap, teebox) {
    return Math.round(
      handicap * (teebox.slope / 113) + (teebox.rating - teebox.par)
    );
  }

  calculateStrokes() {
    let strokes = {};
    let teebox = this.teeboxes[0];
    for (let player of this.selectedPlayers) {
      let numStrokes = this.calculateStrokesForPlayer(
        player.handicap.handicap,
        teebox
      );
      strokes[player.id] = {
        id: player.id,
        username: player.username,
        strokes: numStrokes,
      };
    }
    this.strokes = strokes;

    this.calculateNetStrokes();
  }

  calculateNetStrokes() {
    let minStrokes = Object.values(this.strokes).reduce(
      (currentMin, currentPlayer) =>
        currentMin < currentPlayer.strokes ? currentMin : currentPlayer.strokes,
      99
    );
    for (let [_, obj] of Object.entries(this.strokes)) {
      obj.netStrokes = obj.strokes - minStrokes;
    }

    this.requestUpdate();
    for (let p of this.playerStrokes) {
      p.requestUpdate();
    }
  }

  playersTemplate() {
    return this.playersArray.map(
      (p) =>
        html`<wa-checkbox
          value="${p.id}"
          ?checked=${this.selectedPlayers?.find((sp) => sp.id == p.id)}
          >${p.username} (${p.handicap.handicap_str})</wa-checkbox
        >`
    );
  }

  coursesOptionTemplate() {
    return this.coursesArray.map(
      (c) => html`<wa-option value="${c.id}">${c.name}</wa-option>`
    );
  }

  handleTeeboxChangedForPlayer(event) {
    let { playerId, playerHandicap, teeboxId } = event.detail;
    let teebox = this.teeboxes.find((t) => t.id == teeboxId);
    let newStrokes = this.calculateStrokesForPlayer(playerHandicap, teebox);

    this.strokes[playerId].strokes = newStrokes;
    this.calculateNetStrokes();
  }

  teeboxSelectionTemplate() {
    return html`<div
      class="wa-stack"
      @TeeboxChanged=${this.handleTeeboxChangedForPlayer}
    >
      ${this.selectedPlayers
        .flatMap((p) => [
          html`<nb-player-strokes
            .player=${p}
            .teeboxes=${this.teeboxes}
            .strokes=${this.strokes[p.id]}
          ></nb-player-strokes>`,
          html`<div><wa-divider></wa-divider></div>`,
        ])
        .slice(0, -1)}
    </div>`;
  }

  handleNextButtonClick() {
    this.selectedPlayers = this.selectedCheckboxes.map(
      (c) => this.players[c.value]
    );

    this.selectedCourse = this.courseSelectEl.value;

    this.teeboxes = Object.values(
      this.courses[this.courseSelectEl.value].teeboxes
    );

    this.teeboxes.sort((a, b) => {
      return b.slope - a.slope;
    });

    this.state = "TEEBOX_SELECTION";

    this.calculateStrokes();
  }

  maybeEnabledNextButton() {
    this.nextButtonEnabled =
      !!this.selectedCheckboxes.length && !!this.courseSelectEl.value;
  }

  handleBackButtonClick() {
    this.state = "";
  }

  render() {
    let content;
    if (this.state === "TEEBOX_SELECTION") {
      content = html`${this.teeboxSelectionTemplate()}
        <wa-button
          class="w-full mt-(--wa-space-m)!"
          variant="neutral"
          appearance="outlined"
          @click=${this.handleBackButtonClick}
          >Go back</wa-button
        >`;
    } else {
      content = html`<div
          class="wa-cluster"
          @input=${this.maybeEnabledNextButton}
        >
          <div class="grow self-start">
            <wa-select
              id="course"
              name="course"
              label="Select a course"
              value="${this.selectedCourse}"
              hoist
              required
              >${this.coursesOptionTemplate()}</wa-select
            >
          </div>
          <div class="flex flex-col gap-(--wa-space-s) grow">
            <label>Select players:</label>${this.playersTemplate()}
          </div>
        </div>
        <wa-button
          class="w-full mt-(--wa-space-m)!"
          variant="brand"
          ?disabled=${!this.nextButtonEnabled}
          @click=${this.handleNextButtonClick}
          >Next</wa-button
        >`;
    }

    return html`<wa-card
      ><div class="wa-stack">
        <h2>Calculate Strokes</h2>
        ${content}
      </div></wa-card
    >`;
  }
}

customElements.define("nb-calculate-strokes", CalculateStrokes);
