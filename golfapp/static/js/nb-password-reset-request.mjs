import { NikElement } from "./nik-element.mjs";
import { html } from "./bundle.mjs";

const EMAUL_UNIQUE_HELP_TEXT =
  "This email already exists. Please login or reset the password.";

export class PasswordResetRequestCard extends NikElement {
  static properties = {
    email: { type: String },
  };

  static queries = {};

  render() {
    return html`<wa-card>
      <form id="password-reset-request-form" action="" method="POST"></form>
      <div class="wa-stack">
        <h2>Reset Password</h2>

        <wa-input
          form="password-reset-request-form"
          type="email"
          name="email"
          label="Email"
          placeholder="Your email"
          required
        ></wa-input>

        <wa-button
          form="password-reset-request-form"
          type="submit"
          variant="brand"
          class="w-full"
          >Request Link To Reset Password</wa-button
        >
      </div>
    </wa-card>`;
  }
}

customElements.define("nb-password-reset-request", PasswordResetRequestCard);
