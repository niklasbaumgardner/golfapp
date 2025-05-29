import { NikElement } from "./customElement.mjs";
import { html } from "./imports.mjs";

export class PreferencesCard extends NikElement {
  static properties = {
    theme: { type: Object },
  };

  static queries = {
    themesSelect: "#themes",
    modeSelect: "#mode",
    primaryColorSelect: "#primary-color",
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
        <h2>Preferences</h2>

        <wa-select
          id="themes"
          label="Builtin Themes"
          value=${this.theme.theme}
          @input=${this.handleThemeChange}
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

        <wa-select
          id="mode"
          label="Mode"
          value=${this.theme.mode}
          @input=${this.handleModeChange}
          ><wa-option value="light">Light</wa-option
          ><wa-option value="dark">Dark</wa-option></wa-select
        >

        <wa-divider></wa-divider>

        <p>Custom Theming Options</p>

        <wa-select
          clearable
          id="primary-color"
          label="Primary Color"
          value=${this.theme.primaryColor}
          @input=${this.handlePrimaryColorChange}
          ><wa-option value="red">Red</wa-option
          ><wa-option value="orange">Orange</wa-option
          ><wa-option value="yellow">Yellow</wa-option
          ><wa-option value="green">Green</wa-option
          ><wa-option value="cyan">Cyan</wa-option
          ><wa-option value="blue">Blue</wa-option
          ><wa-option value="indigo">Indigo</wa-option
          ><wa-option value="purple">Purple</wa-option
          ><wa-option value="pink">Pink</wa-option
          ><wa-option value="gray">Gray</wa-option></wa-select
        >

        <wa-select
          clearable
          id="color-palette"
          label="Color Palette"
          value=${this.theme.colorPalette}
          @input=${this.handleColorPaletteChange}
          ><wa-option value="default">Default</wa-option
          ><wa-option value="anodized">Anodized</wa-option
          ><wa-option value="bright">Bright</wa-option
          ><wa-option value="classic">Classic</wa-option
          ><wa-option value="elegant">Elegant</wa-option
          ><wa-option value="mild">Mild</wa-option
          ><wa-option value="natural">Natural</wa-option
          ><wa-option value="rudimentary">Rudimentary</wa-option
          ><wa-option value="vogue">Vouge</wa-option></wa-select
        >

        <wa-select
          clearable
          id="color-contrast"
          label="Color Contrast"
          value=${this.theme.colorContrast}
          @input=${this.handleColorContrastChange}
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
      </div>
    </wa-card>`;
  }
}

customElements.define("nb-preferences", PreferencesCard);
