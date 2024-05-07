import { createElement } from "./customElement.mjs";

createSubcriptionOptions();
addSubscriptionsToTable();

function createSubcriptionOptions() {
  let selectEl = document.getElementById("user_id");
  for (let [id, user] of Object.entries(USERS)) {
    if (SUBSCRIBERS[id]) {
      continue;
    }

    let option = createElement({
      type: "option",
      value: id,
      content: user.username,
    });
    selectEl.appendChild(option);
  }
}

function addSubscriptionsToTable() {
  let anchor = document.querySelector("tbody");
  for (let [user_id, sub] of Object.entries(SUBSCRIBERS)) {
    let tr = createElement({ type: "tr" });

    let subscription = createElement({
      type: "td",
      content: `${user_id}: ${USERS[sub.subscribed_to].username}`,
    });
    tr.appendChild(subscription);
    let subscribersTd = createElement({
      type: "td",
      classString: "subscribers",
    });
    for (let s of sub.subscribers) {
      let span = createElement({
        type: "span",
        content: `${s.user_id}: ${USERS[s.user_id].username}`,
      });
      subscribersTd.appendChild(span);
    }

    let form = createElement({
      type: "form",
      action: CREATE_SUBSCRIBER_URL.replace("0", sub.id),
      method: "POST",
    });
    subscribersTd.appendChild(form);
    let select = createElement({ type: "select", name: "user_id" });
    form.appendChild(select);

    let defaultOption = createElement({
      type: "option",
      selected: true,
      disabled: true,
      hidden: true,
      content: "Select here",
    });
    select.appendChild(defaultOption);

    for (let [id, user] of Object.entries(USERS)) {
      if (sub.subscribers.find((obj) => obj.user_id == id)) {
        continue;
      }

      let option = createElement({
        type: "option",
        value: id,
        content: user.username,
      });
      select.appendChild(option);
    }

    let submitButton = createElement({
      type: "button",
      inputType: "submit",
      content: "Add subscriber",
      classString: "btn btn-outline-primary",
    });
    form.appendChild(submitButton);

    tr.appendChild(subscribersTd);
    anchor.appendChild(tr);
  }
}
