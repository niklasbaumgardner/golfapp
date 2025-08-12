const themeStorage = window.localStorage;

export const THEME_LIST = [
  "default",
  "awesome",
  "shoelace",
  "active",
  "brutalist",
  "glossy",
  "matter",
  "mellow",
  "playful",
  "premium",
  "tailspin",
];

export const THEME_MODE_LIST = ["light", "dark"];

export const PRIMARY_COLOR_LIST = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
];

export const BACKGROUND_COLOR_LIST = [
  "niks-favorite",
  "red",
  "gray",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];

export const COLOR_PALETTE_LIST = [
  "default",
  "bright",
  "shoelace",
  "rudimentary",
  "elegant",
  "mild",
  "natural",
  "anodized",
  "vogue",
];

export class Theme {
  #theme;
  #mode;
  #primaryColor;
  #backgroundColor;
  #colorPalette;
  #initing;

  constructor(theme) {
    this.#initing = true;
    this.theme = theme.theme;
    this.mode = theme.mode;
    this.primaryColor = theme.primary_color;
    this.backgroundColor = theme.background_color;
    this.colorPalette = theme.color_palette;

    this.#initing = false;

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

  get backgroundColor() {
    return this.#backgroundColor;
  }

  get colorPalette() {
    return this.#colorPalette;
  }

  get themeLinkEl() {
    return document.getElementById("theme");
  }
  get paletteLinkEl() {
    return document.getElementById("palette");
  }

  set theme(theme) {
    if (theme === this.theme) {
      return;
    }

    document.documentElement.classList.remove(`wa-theme-${this.theme}`);

    if (THEME_LIST.includes(theme)) {
      this.#theme = theme;
    } else {
      this.#theme = THEME_LIST[0];
    }

    themeStorage.setItem("theme", this.theme);
    document.documentElement.classList.add(`wa-theme-${this.theme}`);

    this.themeLinkEl.href = `/static/css/${this.theme}.min.css`;

    if (!this.#initing) {
      fetch(SET_THEME_URL + "?" + new URLSearchParams({ theme: this.theme }));
    }
  }

  set mode(mode) {
    if (mode && mode === this.mode) {
      return;
    }

    if (THEME_MODE_LIST.includes(mode)) {
      this.#mode = mode;
    } else {
      this.#mode = "light";
    }

    themeStorage.setItem("mode", this.mode);

    // Set theme mode on document
    document.documentElement.classList.toggle("wa-dark", this.mode === "dark");
    document.documentElement.classList.toggle(
      "wa-light",
      this.mode === "light"
    );

    if (!this.#initing) {
      fetch(
        SET_THEME_MODE_URL + "?" + new URLSearchParams({ mode: this.mode })
      );
    }
  }

  /**
   * Sets the primary color
   */
  set primaryColor(primaryColor) {
    if (primaryColor === this.primaryColor) {
      return;
    }

    document.documentElement.classList.remove(`${this.primaryColor}-brand`);

    if (PRIMARY_COLOR_LIST.includes(primaryColor)) {
      this.#primaryColor = primaryColor;
    } else {
      this.#primaryColor = null;
    }

    themeStorage.setItem("primaryColor", this.primaryColor);
    if (this.primaryColor) {
      document.documentElement.classList.add(`${this.primaryColor}-brand`);
    }

    if (!this.#initing) {
      fetch(
        SET_PRIMARY_COLOR_URL +
          "?" +
          new URLSearchParams({ primary_color: this.primaryColor })
      );
    }
  }

  /**
   * Sets the background color
   */
  set backgroundColor(backgroundColor) {
    if (backgroundColor === this.backgroundColor) {
      return;
    }

    document
      .querySelector("main")
      .classList.remove(`${this.backgroundColor}-background`);
    document
      .querySelector("wa-page")
      .classList.remove(`${this.backgroundColor}-background`);

    if (BACKGROUND_COLOR_LIST.includes(backgroundColor)) {
      this.#backgroundColor = backgroundColor;
    } else {
      this.#backgroundColor = null;
    }

    themeStorage.setItem("backgroundColor", this.backgroundColor);
    if (this.backgroundColor) {
      document
        .querySelector("main")
        .classList.add(`${this.backgroundColor}-background`);
      document
        .querySelector("wa-page")
        .classList.add(`${this.backgroundColor}-background`);
    }

    if (!this.#initing) {
      fetch(
        SET_BACKGROUND_COLOR_URL +
          "?" +
          new URLSearchParams({ background_color: this.backgroundColor })
      );
    }
  }

  /**
   * Sets the color palette
   */
  set colorPalette(colorPalette) {
    if (colorPalette === this.colorPalette) {
      return;
    }

    document.documentElement.classList.remove(
      `wa-palette-${this.colorPalette}`
    );

    if (COLOR_PALETTE_LIST.includes(colorPalette)) {
      this.#colorPalette = colorPalette;
    } else {
      this.#colorPalette = null;
    }

    themeStorage.setItem("colorPalette", this.colorPalette);

    if (this.colorPalette) {
      document.documentElement.classList.add(`wa-palette-${this.colorPalette}`);
    }

    this.paletteLinkEl.href = `/static/css/${this.colorPalette}.palette.min.css`;

    if (!this.#initing) {
      fetch(
        SET_COLOR_PALETTE_URL +
          "?" +
          new URLSearchParams({ color_palette: this.colorPalette })
      );
    }
  }

  makeDefault() {
    this.theme = THEME_LIST[0];
    this.mode = "light";
  }

  migrateTheme(themeMode) {
    this.theme = THEME_LIST[0];
    this.mode = themeMode;
  }
}
