import { NikElement } from "./customElement.mjs";
import { html } from "./imports.mjs";

const EMAUL_UNIQUE_HELP_TEXT =
  "Email taken. Please choose a different email or login.";
const USERNAME_UNIQUE_HELP_TEXT =
  "Username taken. Please choose a different username.";

export class SignupCard extends NikElement {
  static properties = {
    email: { type: String },
    emailValid: { type: Boolean },
    usernameValid: { type: Boolean },
  };

  static queries = {
    emailInput: "#email",
    usernameInput: "#username",
    submitButton: "#submitButtn",
  };

  usernameDebouncer(callback, wait) {
    return (...args) => {
      window.clearTimeout(this.emailTimeoutId);
      this.emailTimeoutId = window.setTimeout(() => {
        callback(...args);
      }, wait);
    };
  }

  emailDebouncer(callback, wait) {
    return (...args) => {
      window.clearTimeout(this.usernameTimeoutId);
      this.usernameTimeoutId = window.setTimeout(() => {
        callback(...args);
      }, wait);
    };
  }

  async checkEmailUnique(email) {
    let response = await fetch(
      EMAIL_UNIQUE_URL +
        "?" +
        new URLSearchParams({
          email,
        })
    );
    response = await response.json();
    return response;
  }

  async checkUsernameUnique(username) {
    let response = await fetch(
      USERNAME_UNIQUE_URL +
        "?" +
        new URLSearchParams({
          username,
        })
    );
    response = await response.json();
    return response;
  }

  async handleEmailInput() {
    this.emailDebouncer(async () => {
      let email = this.emailInput.value;
      let result = await this.checkEmailUnique(email);
      console.log("email is unique", result.isUnique);

      if (result.isUnique) {
        this.emailInput.setAttribute("help-text", "");
        this.emailValid = true;
      } else {
        this.emailInput.setAttribute("help-text", EMAUL_UNIQUE_HELP_TEXT);
        this.emailValid = false;
      }
    }, 300)();
  }

  async handleUsernameInput() {
    this.usernameDebouncer(async () => {
      let username = this.usernameInput.value;
      let result = await this.checkUsernameUnique(username);
      console.log("username is unique", result.isUnique);

      if (result.isUnique) {
        this.usernameInput.setAttribute("help-text", "");
        this.usernameValid = true;
      } else {
        this.usernameInput.setAttribute("help-text", USERNAME_UNIQUE_HELP_TEXT);
        this.usernameValid = false;
      }
    }, 300)();
  }

  render() {
    return html`<wa-card>
      <form id="signup-form" action="${SIGNUP_URL}" method="POST"></form>
      <div class="wa-stack">
        <h2>Sign Up</h2>

        <wa-input
          @input=${this.handleEmailInput}
          form="signup-form"
          placeholder="Your email"
          type="email"
          label="Email"
          id="email"
          name="email"
          maxlength="60"
          required
        ></wa-input>

        <wa-input
          @input=${this.handleUsernameInput}
          form="signup-form"
          placeholder="Your username"
          label="Username"
          id="username"
          name="username"
          maxlength="60"
          required
        ></wa-input>

        <wa-input
          form="signup-form"
          type="password"
          label="Password"
          id="password1"
          name="password1"
          placeholder="Password"
          minlength="6"
          required
        ></wa-input>

        <wa-button
          form="signup-form"
          id="submitButton"
          class="w-full"
          variant="brand"
          type="submit"
          ?disabled=${!(this.emailValid && this.usernameValid)}
          >Sign Up</wa-button
        >
      </div>
    </wa-card>`;
  }
}

customElements.define("nb-signup", SignupCard);
