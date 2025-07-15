import { NikElement } from "./customElement.mjs";
import { html } from "./imports.mjs";

export class Alert extends NikElement {
  static properties = {
    message: { type: String },
    category: { type: String },
  };

  connectedCallback() {
    super.connectedCallback();

    this.timeoutId = setTimeout(() => this.removeSelf(), 5000);
  }

  removeSelf() {
    clearTimeout(this.timeoutId);
    this.remove();
  }

  render() {
    return html`<wa-callout variant=${this.category}>
      ${this.message}
      <wa-button
        class="icon-button"
        appearance="plain"
        @click=${this.removeSelf}
        ><wa-icon
          label="Remove"
          name="system/close-large-line"
          library="remix"
        ></wa-icon
      ></wa-button>
    </wa-callout>`;
  }
}

customElements.define("nb-alert", Alert);
