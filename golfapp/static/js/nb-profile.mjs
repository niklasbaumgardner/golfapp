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
        <h2>Profile</h2>

        <wa-input
          form="profile-form"
          @input=${this.handleEmailInput}
          value=${this.email}
          original-value=${this.email}
          type="email"
          label="Email"
          id="email"
          name="email"
          maxlength="60"
          required
        ></wa-input>

        <wa-input
          form="profile-form"
          @input=${this.handleUsernameInput}
          value=${this.username}
          original-value=${this.username}
          label="Username"
          id="username"
          name="username"
          maxlength="60"
          required
        ></wa-input>

        <wa-button
          form="profile-form"
          id="submitButton"
          class="w-full"
          variant="brand"
          type="submit"
          ?disabled=${!(this.emailValid || this.usernameValid)}
          >Update</wa-button
        >
        <small>
          <a href="${PASSWORD_RESET_REQUEST_URL}">Reset password</a>
        </small>
      </div>
    </wa-card>`;
  }
}

customElements.define("nb-profile", ProfileCard);
