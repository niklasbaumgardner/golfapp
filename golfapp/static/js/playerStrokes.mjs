import { NikElement } from "./customElement.mjs";
import { html } from "./imports.mjs";

class PlayerStrokes extends NikElement {
  static properties = {
    player: { type: Object },
    teeboxes: { type: Array },
  };

  render() {
    return html`<div class="col-12">
      <div class="d-flex justify-content-evenly">
        <h4>${p.username}</h4>
        <sl-select
          label="Select a teebox"
          hoist
          required
          value="${this.teeboxes[0].id}"
          @sl-input=${this.handleTeeboxChange}
          >${this.teeboxOptionsTemplate()}</sl-select
        >
      </div>
      <div class="d-flex">${p.username} (${p.handicap.handicap_str})</div>
    </div>`;
  }
}
export default PlayerStrokes;

customElements.define("player-strokes", PlayerStrokes);
