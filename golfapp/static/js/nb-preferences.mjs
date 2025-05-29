import { html } from "./imports.mjs";
import { SignupCard } from "./nb-signup.mjs";

export class ProfileCard extends SignupCard {
  static properties = {
    username: { type: String },
  };

  async handleEmailInput() {
    if (this.emailInput.value === this.email) {
      this.emailInput.helpText = "";
      this.emailValid = false;
      return;
    }

    super.handleEmailInput();
  }

  async handleUsernameInput() {
    if (this.usernameInput.value === this.username) {
      this.usernameInput.helpText = "";
      this.usernameValid = false;
      return;
    }

    super.handleUsernameInput();
  }

  render() {
    return html`<wa-card>
      <form id="profile-form" action="" method="POST" autocomplete="off"></form>
      <div class="wa-stack">
        <h2>Preferences</h2>

        <wa-select label="Themes"
          ><wa-option value="default">Default</wa-option
          ><wa-option value="classic">Classic</wa-option
          ><wa-option value="awesome">Awesome</wa-option
          ><wa-option value="mellow">Mellow</wa-option
          ><wa-option value="active">Actvie</wa-option
          ><wa-option value="brutalist">Brutalist</wa-option
          ><wa-option value="glossy">Glossy</wa-option
          ><wa-option value="matter">Matter</wa-option
          ><wa-option value="playful">Playful</wa-option
          ><wa-option value="premium">Premium</wa-option
          ><wa-option value="tailspin">Tailspin</wa-option></wa-select
        >

        <wa-divider></wa-divider>

        <wa-select label="Theme palette"
          ><wa-option value="default">Default</wa-option
          ><wa-option value="anodized">Anodized</wa-option
          ><wa-option value="bright">Bright</wa-option
          ><wa-option value="classic">Classic</wa-option
          ><wa-option value="elegant">Elegant</wa-option
          ><wa-option value="mild">Mild</wa-option
          ><wa-option value="natural">Natural</wa-option
          ><wa-option value="rudimentary">Rudimentary</wa-option
          ><wa-option value="">Vouge</wa-option></wa-select
        >
      </div>
    </wa-card>`;
  }
}

customElements.define("nb-profile", ProfileCard);
