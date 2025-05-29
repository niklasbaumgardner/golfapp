import { html } from "./imports.mjs";
import { NikElement } from "./customElement.mjs";

export class ThemeSelector extends NikElement {
  static properties = {
    theme: { type: Object },
  };

  static queries = {
    dropdown: "wa-dropdown",
    icon: "#icon",
    themeItems: { all: "wa-menu-item" },
  };

  get currentThemeIcon() {
    if (this.theme?.mode === "dark") {
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

    this.theme = THEME;

    this.setupThemeWatcher();
  }

  setupThemeWatcher() {
    this.mutationObserver = new MutationObserver((params) =>
      this.handleThemeChange(params)
    );

    this.mutationObserver.observe(document.documentElement, {
      attributes: true,
    });

    this.handleThemeChange();
  }

  handleThemeChange() {
    for (let button of this.themeItems) {
      button.checked = button.id === this.theme.mode;
    }

    this.icon.name =
      this.theme.mode === "dark" ? "moon-outline" : "sunny-outline";
  }

  setTheme(themeMode) {
    this.theme.mode = themeMode;

    console.log("setting theme mode", this.theme.mode);
  }

  handleThemeSelect(event) {
    const selectedTheme = event.detail.item;
    this.setTheme(selectedTheme.value);
  }

  getThemeIconName() {
    return this.theme?.mode === "dark" ? "moon-outline" : "sunny-outline";
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
