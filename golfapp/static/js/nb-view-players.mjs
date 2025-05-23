import { NikElement } from "./customElement.mjs";
import { html } from "./imports.mjs";
import "./nb-players-grid.mjs";

export class ViewPlayers extends NikElement {
  static properties = {
    players: { type: Object },
    theme: { type: String },
    gridReady: { type: Boolean },
  };

  static queries = { card: "wa-card" };

  constructor() {
    super();

    this.gridReady = false;
  }

  async firstUpdated() {
    await this.updateComplete;

    await this.card.updateComplete;
    this.gridReady = true;
  }

  playersTemplate() {
    if (!this.gridReady) {
      return null;
    }

    return html`<nb-players-grid
      .players=${this.players}
      theme=${this.theme}
    ></nb-players-grid>`;
  }

  render() {
    return html`<wa-card>
      <h2>All Players</h2>
      ${this.playersTemplate()}
    </wa-card>`;
  }
}
customElements.define("nb-view-players", ViewPlayers);
