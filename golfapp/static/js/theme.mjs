const themeStorage = window.localStorage;

export class Theme {
  #theme;
  #mode;
  #primaryColor;
  #colorContrast;
  #colorPalette;

  constructor(theme) {
    this.theme = theme.theme;
    this.mode = theme.mode;
    this.primaryColor = theme.primary_color;
    this.colorContrast = theme.color_contrast;
    this.colorPalette = theme.color_palette;

    if (!this.theme) {
      this.makeDefault();
    }
  }

  get theme() {
    return this.#theme;
  }

  get mode() {
    return this.#mode;
  }

  get primaryColor() {
    return this.#primaryColor;
  }

  get colorContrast() {
    return this.#colorContrast;
  }

  get colorPalette() {
    return this.#colorPalette;
  }

  set theme(theme) {
    if (theme === this.theme) {
      return;
    }

    switch (theme) {
      case "default":
      case "classic":
      case "awesome":
      case "mellow":
      case "active":
      case "brutalist":
      case "glossy":
      case "matter":
      case "playful":
      case "premium":
      case "tailspin":
        this.#theme = theme;
        break;
      default: {
        this.#theme = null;
        break;
      }
    }

    themeStorage.setItem("theme", this.theme);
    document.getElementById("theme-stylesheet").href = this.theme
      ? `https://early.webawesome.com/webawesome@3.0.0-alpha.13/dist/styles/themes/${this.theme}.css`
      : "";
    fetch(SET_THEME_URL + "?" + new URLSearchParams({ theme: this.theme }));
  }

  set mode(mode) {
    if (mode === this.mode) {
      return;
    }

    switch (mode) {
      case "light":
      case "dark":
        this.#mode = mode;
        break;
      default: {
        this.#mode = null;
        break;
      }
    }

    themeStorage.setItem("mode", this.mode);

    // Set theme mode on document
    document.documentElement.classList.toggle("wa-dark", this.mode === "dark");
    document.documentElement.classList.toggle(
      "wa-light",
      this.mode === "light"
    );

    fetch(SET_THEME_MODE_URL + "?" + new URLSearchParams({ mode: this.mode }));
  }

  set primaryColor(primaryColor) {
    if (primaryColor === this.primaryColor) {
      return;
    }

    switch (primaryColor) {
      case "red":
      case "orange":
      case "yellow":
      case "green":
      case "cyan":
      case "blue":
      case "indigo":
      case "purple":
      case "pink":
      case "gray":
        this.#primaryColor = primaryColor;
        break;
      default: {
        this.#primaryColor = null;
        break;
      }
    }

    themeStorage.setItem("primaryColor", this.primaryColor);
    document.getElementById("primary-color-stylesheet").href = this.primaryColor
      ? `https://early.webawesome.com/webawesome@3.0.0-alpha.13/dist/styles/brand/${this.primaryColor}.css`
      : "";
    fetch(
      SET_PRIMARY_COLOR_URL +
        "?" +
        new URLSearchParams({ primary_color: this.primaryColor })
    );
  }

  set colorContrast(colorContrast) {
    if (colorContrast === this.colorContrast) {
      return;
    }

    switch (colorContrast) {
      case "default":
      case "classic":
      case "awesome":
      case "mellow":
      case "active":
      case "brutalist":
      case "glossy":
      case "matter":
      case "playful":
      case "premium":
      case "tailspin":
        this.#colorContrast = colorContrast;
        break;
      default: {
        this.#colorContrast = null;
        break;
      }
    }

    themeStorage.setItem("colorContrast", this.colorContrast);
    document.getElementById("color-contrast-stylesheet").href = this
      .colorContrast
      ? `https://early.webawesome.com/webawesome@3.0.0-alpha.13/dist/styles/themes/${this.colorContrast}/color.css`
      : "";
    fetch(
      SET_COLOR_CONTRAST_URL +
        "?" +
        new URLSearchParams({ color_contrast: this.colorContrast })
    );
  }

  set colorPalette(colorPalette) {
    if (colorPalette === this.colorPalete) {
      return;
    }

    switch (colorPalette) {
      case "default":
      case "anodized":
      case "bright":
      case "classic":
      case "elegant":
      case "mild":
      case "natural":
      case "rudimentary":
      case "vogue":
        this.#colorPalette = colorPalette;
        break;
      default: {
        this.#colorPalette = null;
        break;
      }
    }

    themeStorage.setItem("colorPalette", this.colorPalette);
    document.getElementById("color-pallete-stylesheet").href = this.colorPalette
      ? `https://early.webawesome.com/webawesome@3.0.0-alpha.13/dist/styles/color/${this.colorPalette}.css`
      : "";
    fetch(
      SET_COLOR_PALETTE_URL +
        "?" +
        new URLSearchParams({ color_palette: this.colorPalette })
    );
  }

  makeDefault() {
    this.theme = "classic";
    this.mode = "light";
  }

  migrateTheme(themeMode) {
    this.theme = "classic";
    this.mode = themeMode;
  }
}
