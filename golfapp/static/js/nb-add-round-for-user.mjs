import { html, ifDefined } from "./imports.mjs";
import { AddRound } from "./nb-add-round.mjs";

export class AddRounndForUser extends AddRound {
  static properties = {
    users: { type: Object },
  };

  constructor() {
    super();

    this.label = "Add Round For User";
    this.formId = "add-round-from";
    this.formAction = ADD_ROUND_FOR_USER;
  }

  userOptionsTemplate() {
    return this.users.map(
      (u) => html`<wa-option value="${u.id}">${u.username}</wa-option>`
    );
  }

  usersTemplate() {
    return html`<wa-select
      id="user"
      name="user"
      label="Select user"
      hoist
      required
      >${this.userOptionsTemplate()}</wa-select
    >`;
  }

  courseAndTeeboxTemplate() {
    return html`${this.usersTemplate()}${super.courseAndTeeboxTemplate()}`;
  }
}
customElements.define("nb-add-round-for-user", AddRounndForUser);
