import { html } from "./imports.mjs";
import { NikElement } from "./customElement.mjs";

const themeStorage = window["localStorage"];

export class ThemeSelector extends NikElement {
  static properties = {
    theme: { type: String, reflect: true },
  };

  static queries = {
    dropdown: "wa-dropdown",
    icon: "#icon",
    themeItems: { all: "wa-menu-item" },
  };

  get currentThemeIcon() {
    if (this.theme === "dark") {
      return this.darkIcon;
    }
    return this.lightIcon;
  }

  connectedCallback() {
    super.connectedCallback();

    this.init();
  }

  async init() {
    await this.updateComplete;

    if (THEME === "") {
      let storedTheme = themeStorage.getItem("theme");
      this.setTheme(storedTheme);
    } else {
      this.setTheme(THEME, { dontSend: true });
    }
  }

  setTheme(theme, options) {
    this.theme = theme === "dark" ? "dark" : "light";

    console.log("setting theme", this.theme);

    themeStorage.setItem("theme", this.theme);
    // Set theme on document
    document.documentElement.classList.toggle("wa-dark", this.theme === "dark");
    document.documentElement.classList.toggle(
      "wa-light",
      this.theme === "light"
    );

    for (let button of this.themeItems) {
      button.checked = button.id === this.theme;
    }

    this.icon.name = this.theme === "dark" ? "moon-outline" : "sunny-outline";

    if (!(options?.dontSend === true)) {
      fetch(THEME_URL + "?" + new URLSearchParams({ theme: this.theme }));
    }
  }

  handleThemeSelect(event) {
    const selectedTheme = event.detail.item;
    this.setTheme(selectedTheme.value);
  }

  getThemeIconName() {
    return this.theme === "dark" ? "moon-outline" : "sunny-outline";
  }

  render() {
    return html`<wa-dropdown @wa-select=${this.handleThemeSelect}>
      <wa-button
        id="theme-button"
        variant="brand"
        appearance="plain"
        slot="trigger"
        caret
      >
        <wa-icon
          id="icon"
          library="ion"
          name="${this.getThemeIconName()}"
        ></wa-icon>
      </wa-button>

      <wa-menu id="theme-selector">
        <wa-menu-item id="light" type="checkbox" value="light"
          >Light</wa-menu-item
        >
        <wa-menu-item id="dark" type="checkbox" value="dark">Dark</wa-menu-item>
      </wa-menu>
    </wa-dropdown>`;
  }
}

customElements.define("nb-theme-selector", ThemeSelector);
