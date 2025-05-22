import { NikElement } from "./customElement.mjs";
import { html } from "./imports.mjs";
import "./nb-rounds-grid.mjs";
import "./nb-player-stats.mjs";
import "./nb-add-round.mjs";
// import "https://early.webawesome.com/webawesome@3.0.0-alpha.13/dist/components/dialog/dialog.js";

class ViewPlayer extends NikElement {
  static properties = {
    user: { type: Object },
    isMe: { type: Boolean },
    rounds: { type: Object },
    handicap: { type: Number },
    theme: { type: String },
  };

  static queries = {
    input: "sl-input",
    popup: "sl-popup",
    menu: "sl-menu",
  };

  connectedCallback() {
    super.connectedCallback();

    document.addEventListener("UpdateHandicap", (e) => {
      this.handicap = e.detail.handicap;
    });
  }

  titleTemplate() {
    if (this.isMe) {
      return html`<h2>Your handicap is ${this.handicap}</h2>`;
    }
    return html`<h2>${this.user.username}'s handicap is ${this.handicap}</h2>`;
  }

  statsTemplate() {
    return html`<nb-player-stats></nb-player-stats>`;
  }

  roundsTemplate() {
    return html`<nb-rounds-grid
      .rounds=${this.rounds}
      theme=${this.theme}
    ></nb-rounds-grid>`;
  }

  handleAddRoundClick() {
    if (!this.addRoundModal) {
      this.addRoundModal = document.createElement("nb-add-round");
      document.body.appendChild(this.addRoundModal);
    }

    this.addRoundModal.show();
  }

  render() {
    return html`<wa-card
      ><div class="wa-stack">
        ${this.titleTemplate()}${this.statsTemplate()}
        <div class="wa-split">
          <a href=${USER.course_ranking_url}
            >${IS_ME ? "My" : USER.username}course rankings</a
          >
          <wa-button
            variant="success"
            appearance="filled outlined"
            @click=${this.handleAddRoundClick}
            >Add Round</wa-button
          >
        </div>
        ${this.roundsTemplate()}
      </div></wa-card
    >`;
  }
}
customElements.define("nb-view-player", ViewPlayer);
