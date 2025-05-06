import { NikElement } from "./customElement.mjs";
import { html } from "./imports.mjs";

class PlayerStrokes extends NikElement {
  static properties = {
    player: { type: Object },
    teeboxes: { type: Array },
    strokes: { type: Object },
  };

  static queries = {
    teeboxSelect: "sl-select",
  };

  handleTeeboxChange() {
    this.dispatchEvent(
      new CustomEvent("TeeboxChanged", {
        bubbles: true,
        composed: true,
        detail: {
          playerId: this.player.id,
          playerHandicap: this.player.handicap.handicap,
          teeboxId: this.teeboxSelect.value,
        },
      })
    );
  }

  teeboxOptionsTemplate() {
    return this.teeboxes.map(
      (t) =>
        html`<wa-option value="${t.id}"
          >${t.teebox} (${t.rating} / ${t.slope})</sl-option
        >`
    );
  }

  render() {
    return html`<div class="row mb-3">
        <div class="col-6"><h4>${this.player.username}</h4></div>
        <div class="col-6">
          <wa-select
            label="Select a teebox"
            hoist
            required
            value="${this.teeboxes[0].id}"
            @sl-input=${this.handleTeeboxChange}
            >${this.teeboxOptionsTemplate()}</sl-select
          >
        </div>
      </div>
      <div class="row">
        <div class="col-4 text-start">
          <div>Handicap</div>
          <div><h6>${this.player.handicap.handicap_str}</h6></div>
        </div>
        <div class="col-4 text-center">
          <div>Net strokes</div>
          <div><h6>${this.strokes.netStrokes}</h6></div>
        </div>
        <div class="col-4 text-end">
          <div>Course handicap</div>
          <div><h6>${this.strokes.strokes}</h6></div>
        </div>
      </div> `;
  }
}
export default PlayerStrokes;

customElements.define("player-strokes", PlayerStrokes);
