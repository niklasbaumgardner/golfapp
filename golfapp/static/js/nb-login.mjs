import { NikElement } from "./customElement.mjs";
import { html } from "./imports.mjs";

export class LoginCard extends NikElement {
  static properties = {
    email: { type: String },
  };

  connectedCallback() {
    super.connectedCallback();

    const params = new URLSearchParams(window.location.search);
    const nextURL = params.get("next");

    if (nextURL) {
      const localStorage = window.localStorage;
      localStorage.setItem("next", nextURL);
    }
  }

  nativeTemplate() {
    return html`<wa-card>
      <form id="login-form" action="${LOGIN_URL}" method="POST"></form>
      <div class="wa-stack">
        <h2>Login</h2>

        <label
          >Email *
          <input
            form="login-form"
            type="email"
            name="email"
            label="Email"
            placeholder="Your email"
            maxlength="60"
            ?value=${this.email}
            required
        /></label>

        <label
          >Password *
          <input
            form="login-form"
            type="password"
            name="password"
            label="Password"
            placeholder="Your password"
            required
        /></label>

        <small
          ><a href="${PASSWORD_RESET_REQUEST_URL}">Forgot password?</a></small
        >

        <wa-checkbox form="login-form" name="remember" value="True" checked
          >Remember me?</wa-checkbox
        >

        <div>
          <!-- This submit button is hidden so "Enter" will submit the form -->
          <button form="login-form" type="submit" hidden></button>
          <wa-button
            class="w-full"
            type="submit"
            variant="brand"
            form="login-form"
            >Login</wa-button
          >
        </div>

        <p>
          Don't have an account?
          <a href="${SIGNUP_URL}">Sign Up</a>
        </p>
      </div>
    </wa-card>`;
  }

  waTmeplate() {
    return html`<wa-card>
      <form id="login-form" action="${LOGIN_URL}" method="POST"></form>
      <div class="wa-stack">
        <h2>Login</h2>

        <wa-input
          label="Email"
          form="login-form"
          type="email"
          name="email"
          label="Email"
          placeholder="Your email"
          maxlength="60"
          ?value=${this.email}
          required
        ></wa-input>

        <wa-input
          label="Password"
          form="login-form"
          type="password"
          name="password"
          placeholder="Your password"
          required
        ></wa-input>

        <small
          ><a href="${PASSWORD_RESET_REQUEST_URL}">Forgot password?</a></small
        >

        <wa-checkbox form="login-form" name="remember" value="True" checked
          >Remember me?</wa-checkbox
        >

        <div>
          <!-- This submit button is hidden so "Enter" will submit the form -->
          <button form="login-form" type="submit" class="hidden!"></button>
          <wa-button
            class="w-full"
            type="submit"
            variant="brand"
            form="login-form"
            >Login</wa-button
          >
        </div>

        <p>
          Don't have an account?
          <a href="${SIGNUP_URL}">Sign Up</a>
        </p>
      </div>
    </wa-card>`;
  }

  render() {
    return this.waTmeplate();
  }
}

customElements.define("nb-login", LoginCard);
