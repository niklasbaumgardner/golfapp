import { NikElement } from "./customElement.mjs";
import { html } from "./imports.mjs";
import "./playerStrokes.mjs";

class StrokesCard extends NikElement {
  static properties = {
    courses: { type: Object },
    teeboxes: { type: Array },
    players: { type: Object },
    nextButtonEnabled: { type: Boolean },
    strokes: { type: Object },
    state: { type: String },
  };

  static get queries() {
    return {
      dialogEl: "sl-dialog",
      courseSelectEl: "#course",
      teeboxSelectEl: "#teebox",
      checkboxes: { all: "sl-checkbox" },
      playerStrokes: { all: "player-strokes" },
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

  handleTeeboxChangedForPlayer(event) {
    let { playerId, playerHandicap, teeboxId } = event.detail;
    let teebox = this.teeboxes.find((t) => t.id == teeboxId);
    let newStrokes = this.calculateStrokesForPlayer(playerHandicap, teebox);

    this.strokes[playerId].strokes = newStrokes;
    this.calculateNetStrokes();
  }

  teeboxSelectionTemplate() {
    return html`<div
      class="row mb-5"
      @TeeboxChanged=${this.handleTeeboxChangedForPlayer}
    >
      ${this.selectedPlayers
        .flatMap((p) => [
          html`<player-strokes
            .player=${p}
            .teeboxes=${this.teeboxes}
            .strokes=${this.strokes[p.id]}
          ></player-strokes>`,
          html`<div><sl-divider></sl-divider></div>`,
        ])
        .slice(0, -1)}
    </div>`;
  }

  handleNextButtonClick() {
    this.selectedPlayers = this.selectedCheckboxes.map(
      (c) => this.players[c.value]
    );

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
        <div class="row">
          <sl-button
            variant="success"
            outline
            @click=${this.handleBackButtonClick}
            >Go back</sl-button
          >
        </div>`;
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
  }
}
export default StrokesCard;

customElements.define("strokes-card", StrokesCard);
