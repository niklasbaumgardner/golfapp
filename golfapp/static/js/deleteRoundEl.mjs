import { NikElement } from "./customElement.mjs";
import { html } from "./imports.mjs";
import { postRequest } from "./fetch.mjs";

class DeleteRound extends NikElement {
  static properties = {
    round: { type: Object },
  };

  static get queries() {
    return {
      dialogEl: "sl-dialog",
      deleteButton: "#delete-button",
    };
  }

  show() {
    this.updateComplete.then(() => {
      this.dialogEl.updateComplete.then(() => {
        this.dialogEl.show();
      });
    });
  }

  hide() {
    this.dialogEl.hide();
  }

  async handleDelete() {
    this.deleteButton.loading = true;

    let response = await postRequest(DELETE_ROUND_URL + this.round.id, {});
    let jsonResponse = await response.json();

    document.dispatchEvent(
      new CustomEvent("UpdateRounds", {
        detail: jsonResponse,
      })
    );

    this.hide();
  }

  render() {
    return html`<wa-dialog label="Delete this round?">
      <div
        style="display:flex;flex-direction:column;gap:var(--sl-spacing-small);"
      >
        <div class="row">
          <p>Are you sure you want to delete this round?</p>
          <p>
            You shot <b>${this.round.score}</b> at
            <b>${COURSES[this.round.course_id].name}</b> on
            <wa-format-date
              month="long"
              day="numeric"
              year="numeric"
              date="${this.round.date + "T00:00:00"}"
            ></sl-format-date>
          </p>
        </div>
        <div class="row mt-3">
          <wa-button
            id="close-button"
            class="col-6"
            variant="neutral"
            outline
            @click=${this.hide}
            >Cancel</sl-button
          >
          <wa-button
            id="delete-button"
            class="col-6"
            variant="danger"
            @click=${this.handleDelete}
            >Delete round</sl-button
          >
        </div>
      </div></sl-dialog
    >`;
  }
}
export default DeleteRound;

customElements.define("delete-round", DeleteRound);
