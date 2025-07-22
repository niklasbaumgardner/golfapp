import { NikElement } from "./nik-element.mjs";
import { html } from "./bundle.mjs";
import {
  THEME_LIST,
  PRIMARY_COLOR_LIST,
  BACKGROUND_COLOR_LIST,
  COLOR_PALETTE_LIST,
} from "./theme.mjs";

function toUpper(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export class PreferencesCard extends NikElement {
  static properties = {
    theme: { type: Object },
  };

  static queries = {
    themesSelect: "#themes",
    modeSelect: "#mode",
    primaryColorSelect: "#primary-color",
    // backgroundColorSelect: "#background-color",
    colorContrastSelect: "#color-contrast",
    colorPaletteSelect: "#color-palette",
  };

  connectedCallback() {
    super.connectedCallback();
    this.init();
  }

  init() {
    this.theme = THEME;
  }

  handleThemeChange() {
    let theme = this.themesSelect.value;
    console.log(theme);

    this.theme.theme = theme;
  }

  handleModeChange() {
    let mode = this.modeSelect.value;
    console.log(mode);

    this.theme.mode = mode;
  }

  handlePrimaryColorChange() {
    let primaryColor = this.primaryColorSelect.value;
    console.log(primaryColor);

    this.theme.primaryColor = primaryColor;
  }

  // handleBackgroundColorChange() {
  //   let backgroundColor = this.backgroundColorSelect.value;
  //   console.log(backgroundColor);

  //   this.theme.backgroundColor = backgroundColor;
  // }

  handleColorPaletteChange() {
    let colorPalette = this.colorPaletteSelect.value;
    console.log(colorPalette);

    this.theme.colorPalette = colorPalette;
  }

  handleColorContrastChange() {
    let colorContrast = this.colorContrastSelect.value;
    console.log(colorContrast);

    this.theme.colorContrast = colorContrast;
  }

  render() {
    if (!this.theme) {
      return null;
    }

    return html`<wa-card>
      <form id="profile-form" action="" method="POST" autocomplete="off"></form>
      <div class="wa-stack">
        <div class="wa-stack">
          <h2>Preferences</h2>

          <wa-select
            id="themes"
            label="Builtin Themes"
            @input=${this.handleThemeChange}
            >${THEME_LIST.map(
              (theme) =>
                html`<wa-option
                  ?selected=${this.theme.theme === theme}
                  value=${theme}
                  >${toUpper(theme)}</wa-option
                >`
            )}</wa-select
          >

          <wa-select id="mode" label="Mode" @input=${this.handleModeChange}
            ><wa-option value="light" ?selected=${this.theme.mode === "light"}
              >Light</wa-option
            ><wa-option value="dark" ?selected=${this.theme.mode === "dark"}
              >Dark</wa-option
            ></wa-select
          >

          <wa-divider></wa-divider>

          <p>Custom Theming Options</p>

          <wa-select
            with-clear
            id="primary-color"
            label="Primary Color"
            @input=${this.handlePrimaryColorChange}
            >${PRIMARY_COLOR_LIST.map(
              (color) =>
                html`<wa-option
                  ?selected=${this.theme.primaryColor === color}
                  value=${color}
                  >${toUpper(color)}</wa-option
                >`
            )}</wa-select
          >

          <wa-select
            with-clear
            id="color-palette"
            label="Color Palette"
            @input=${this.handleColorPaletteChange}
            >${COLOR_PALETTE_LIST.map(
              (color) =>
                html`<wa-option
                  ?selected=${this.theme.colorPalette === color}
                  value=${color}
                  >${toUpper(color)}</wa-option
                >`
            )}</wa-select
          >
        </div>
      </div>
    </wa-card>`;
  }

  backgroundTempalte() {
    return html`<wa-select
      with-clear
      id="background-color"
      label="Background Color"
      @input=${this.handleBackgroundColorChange}
      >${BACKGROUND_COLOR_LIST.map(
        (color) =>
          html`<wa-option
            ?selected=${this.theme.backgroundColor === color}
            value=${color}
            >${toUpper(color)}</wa-option
          >`
      )}</wa-select
    >`;
  }
}

customElements.define("nb-preferences", PreferencesCard);
