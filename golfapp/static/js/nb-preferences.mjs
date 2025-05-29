import { NikElement } from "./customElement.mjs";
import { html } from "./imports.mjs";

export class PreferencesCard extends NikElement {
  static properties = {
    theme: { type: Object },
  };

  static queries = { themesSelect: "#themes" };

  handleThemeChange() {
    let theme = this.themesSelect.value;
    console.log(theme);
    let themeStylesheet = document.getElementById("themes-stylesheet");
    themeStylesheet.href = `https://early.webawesome.com/webawesome@3.0.0-alpha.13/dist/styles/themes/${theme}.css`;
  }

  render() {
    return html`<wa-card>
      <form id="profile-form" action="" method="POST" autocomplete="off"></form>
      <div class="wa-stack">
        <h2>Preferences</h2>

        <wa-select id="themes" label="Themes" @input=${this.handleThemeChange}
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

        <wa-divider></wa-divider>

        <wa-select label="Theme palette"
          ><wa-option value="default">Default</wa-option
          ><wa-option value="anodized">Anodized</wa-option
          ><wa-option value="bright">Bright</wa-option
          ><wa-option value="classic">Classic</wa-option
          ><wa-option value="elegant">Elegant</wa-option
          ><wa-option value="mild">Mild</wa-option
          ><wa-option value="natural">Natural</wa-option
          ><wa-option value="rudimentary">Rudimentary</wa-option
          ><wa-option value="">Vouge</wa-option></wa-select
        >
      </div>
    </wa-card>`;
  }
}

customElements.define("nb-preferences", PreferencesCard);
