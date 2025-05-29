import { NikElement } from "./customElement.mjs";
import { html } from "./imports.mjs";
import "./nb-rounds-grid.mjs";
import "./nb-player-stats.mjs";
import "./nb-add-round.mjs";
import "./nb-edit-round.mjs";

class ViewPlayer extends NikElement {
  static properties = {
    user: { type: Object },
    rounds: { type: Object },
    handicap: { type: Number },
    theme: { type: String },
  };

  get hasHandicap() {
    return this.user.handicap && this.user.handicap.handicap;
  }

  get handicapString() {
    return this.user.handicap.handicap_str ?? "no handicap";
  }

  connectedCallback() {
    super.connectedCallback();

    document.addEventListener("UpdateHandicap", (e) => {
      console.log(e.detail);
      this.handicap = e.detail;
    });
  }

  titleTemplate() {
    if (this.hasHandicap) {
      if (IS_ME) {
        return html`<h2>Your handicap is ${this.handicapString}</h2>`;
      }
      return html`<h2>
        ${this.user.username}'s handicap is ${this.handicapString}
      </h2>`;
    } else {
      if (IS_ME) {
        return html`<h2>You have ${this.handicapString}</h2>`;
      }
      return html`<h2>${this.user.username} has ${this.handicapString}</h2>`;
    }
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
            >${IS_ME ? "My" : USER.username} course ratings</a
          >
          <wa-button
            variant="brand"
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
