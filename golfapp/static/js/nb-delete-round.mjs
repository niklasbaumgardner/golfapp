import { NikElement } from "./customElement.mjs";
import { html } from "./imports.mjs";
import { postRequest } from "./fetch.mjs";

export class DeleteRound extends NikElement {
  static properties = {
    round: { type: Object },
  };

  static get queries() {
    return {
      dialogEl: "wa-dialog",
      deleteButton: "#delete-button",
    };
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
    this.dialogEl.open = false;
  }

  async handleDelete() {
    this.deleteButton.loading = true;

    let response = await postRequest(this.round.delete_round_url, {});
    let jsonResponse = await response.json();

    document.dispatchEvent(
      new CustomEvent("UpdateRounds", {
        detail: jsonResponse,
      })
    );

    this.hide();
  }

  render() {
    return html`<wa-dialog label="Delete round?">
      <div class="wa-stack wa-align-items-stretch">
        <b>This action is irreversible.</b>
        <p>
          Delete round <b>${this.round.score}</b> at
          <b>${this.round.course.name}</b> on
          <wa-format-date
            month="long"
            day="numeric"
            year="numeric"
            date="${this.round.date + "T00:00:00"}"
          ></wa-format-date>
        </p>
        <div class="wa-cluster">
          <wa-button
            id="close-button"
            class="flex-grow-1"
            appearance="filled outlined"
            data-dialog="close"
            >Cancel</wa-button
          >
          <wa-button
            id="delete-button"
            class="flex-grow-1"
            appearance="accent"
            variant="danger"
            @click=${this.handleDelete}
            >Delete</wa-button
          >
        </div>
      </div>
    </wa-dialog>`;
  }
}

customElements.define("nb-delete-round", DeleteRound);
