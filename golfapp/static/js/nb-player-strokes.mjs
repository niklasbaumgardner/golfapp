import { NikElement } from "./nik-element.mjs";
import { html } from "./bundle.mjs";

export class PlayerStrokes extends NikElement {
  static properties = {
    player: { type: Object },
    teeboxes: { type: Array },
    strokes: { type: Object },
  };

  static queries = {
    teeboxSelect: "wa-select",
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
          >${t.teebox} (${t.rating} / ${t.slope})</wa-option
        >`
    );
  }

  render() {
    return html`<div class="wa-stack">
      <div class="wa-grid">
        <h4 class="grow">${this.player.username}</h4>

        <wa-select
          class="grow"
          label="Select a teebox"
          hoist
          required
          value="${this.teeboxes[0].id}"
          @input=${this.handleTeeboxChange}
          >${this.teeboxOptionsTemplate()}</wa-select
        >
      </div>
      <div class="flex">
        <div class="grow text-start">
          <div>Handicap</div>
          <span class="wa-heading-m">${this.player.handicap.handicap_str}</span>
        </div>
        <div class="grow text-center">
          <div>Net strokes</div>
          <span class="wa-heading-m">${this.strokes.netStrokes}</span>
        </div>
        <div class="grow text-end">
          <div>Course handicap</div>
          <span class="wa-heading-m">${this.strokes.strokes}</span>
        </div>
      </div>
    </div>`;
  }
}

customElements.define("nb-player-strokes", PlayerStrokes);
