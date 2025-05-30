import { html, ifDefined } from "./imports.mjs";
import { AddRound } from "./nb-add-round.mjs";

export class EditRound extends AddRound {
  static properties = {
    round: { type: Object },
  };

  static get queries() {
    return {
      dialogEl: "wa-dialog",
      form: "form",
      saveRoundButton: "#save-round-button",
    };
  }

  constructor() {
    super();

    this.label = "Edit Round";
    this.formId = "edit-round-from";
    this.formAction = "";
  }

  show() {
    customElements.whenDefined("wa-dialog").then(() => {
      this.updateComplete.then(() => {
        this.dialogEl.updateComplete.then(() => {
          this.dialogEl.open = true;
        });
      });
    });
  }

  hide() {
    this.saveRoundButton.disabled = false;
    this.saveRoundButton.loading = false;
    this.dialogEl.open = false;
  }

  courseAndTeeboxTemplate() {
    return html`<div>
        <div class="wa-heading-">Course:</div>
        <div class="wa-heading-m">${this.round.course.name}</div>
      </div>
      <div>
        <div class="wa-heading-">Teebox:</div>
        <div class="wa-heading-m">
          ${this.round.teebox.teebox} - (${this.round.teebox.rating} /
          ${this.round.teebox.slope})
        </div>
      </div>`;
  }

  roundTypeTemplate() {
    return html`<div>
      <wa-radio-group
        label="Round type"
        name="nineHoleRound"
        value=${this.round.nine_hole_round ? "True" : "False"}
        orientation="horizontal"
        required
      >
        <wa-radio-button value="False" variant="brand"
          >18 hole round</wa-radio-button
        >
        <wa-radio-button value="True" variant="brand"
          >9 hole round</wa-radio-button
        >
      </wa-radio-group>
    </div>`;
  }

  scoreTemplate() {
    return html`<wa-input
      id="score"
      name="score"
      type="number"
      label="Score"
      class="grow min-w-0"
      value=${this.round.score}
      required
    ></wa-input>`;
  }

  dateTemplate() {
    return html`<wa-input
      class="grow"
      id="date"
      name="date"
      type="date"
      value="${this.round.date}"
      label="Date"
      required
    ></wa-input>`;
  }

  statsTemplate() {
    return html`<wa-input
        id="fir"
        name="fir"
        type="number"
        class="min-w-0"
        label="FIR"
        value=${ifDefined(this.round.fir)}
      ></wa-input>
      <wa-input
        id="gir"
        name="gir"
        type="number"
        class="min-w-0"
        label="GIR"
        value=${ifDefined(this.round.gir)}
      ></wa-input>
      <wa-input
        id="putts"
        name="putts"
        type="number"
        class="min-w-0"
        label="Putts"
        value=${ifDefined(this.round.putts)}
      ></wa-input>`;
  }

  saveButtonTemplate() {
    return html`<wa-button
      id="save-round-button"
      class="grow"
      variant="brand"
      @click=${this.handleSaveRoundClick}
      >Save</wa-button
    >`;
  }

  async handleSaveRoundClick() {
    if (!this.form.reportValidity()) {
      return;
    }

    this.saveRoundButton.disabled = true;
    this.saveRoundButton.loading = true;

    let formData = new FormData(this.form);

    let response = await fetch(this.round.edit_round_url, {
      method: "POST",
      body: formData,
    });

    let jsonResponse = await response.json();

    document.dispatchEvent(
      new CustomEvent("UpdateRounds", {
        detail: { ...jsonResponse },
        bubbles: true,
      })
    );

    this.hide();
  }
}

customElements.define("nb-edit-round", EditRound);
