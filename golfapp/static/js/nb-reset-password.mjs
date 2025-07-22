import { NikElement } from "./nik-element.mjs";
import { html } from "./bundle.mjs";

const PASSWORD_MATCH_HELP_TEXT = "Passwords do not match.";

export class ResetPasswordCard extends NikElement {
  static properties = { passwordsMatch: { type: Boolean } };

  static queries = { password1: "#password1", password2: "#password2" };

  checkPasswordsMatch() {
    let p1Val = this.password1.value;
    let p2Val = this.password2.value;

    if (p1Val === p2Val) {
      this.passwordsMatch = true;
      this.password2.helpText = "";
    } else if (p2Val.length < p1Val.length) {
      this.passwordsMatch = false;
      let p1Substr = p1Val.substring(0, p2Val.length);
      if (p1Substr === p2Val) {
        this.password2.helpText = "";
      } else {
        this.password2.helpText = PASSWORD_MATCH_HELP_TEXT;
      }
    } else {
      this.passwordsMatch = false;
      this.password2.helpText = PASSWORD_MATCH_HELP_TEXT;
    }
  }

  render() {
    return html`<wa-card @input=${this.checkPasswordsMatch}>
      <form id="password-reset-form" action="" method="POST"></form>
      <div class="wa-stack">
        <h2>Reset Password</h2>

        <wa-input
          form="password-reset-form"
          type="password"
          label="New Password"
          id="password1"
          name="password1"
          placeholder="Password"
          required
        ></wa-input>

        <wa-input
          form="password-reset-form"
          type="password"
          label="Confirm New Password"
          id="password2"
          name="password2"
          placeholder="Password"
          required
        ></wa-input>

        <wa-button
          form="password-reset-form"
          class="w-full"
          type="submit"
          variant="brand"
          ?disabled=${!this.passwordsMatch}
          >Reset Password</wa-button
        >
      </div>
    </wa-card>`;
  }
}

customElements.define("nb-reset-password", ResetPasswordCard);
