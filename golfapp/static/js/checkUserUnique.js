"use strict";

async function sendUsernameRequest(username) {
  return getRequest(USERNAME_UNIQUE_URL, { username });
}

async function sendEmailRequest(email) {
  return getRequest(EMAIL_UNIQUE_URL, { email });
}

function enableSubmitButton() {
  let ele = document.getElementById("submitButton");
  ele.disabled = false;
}

function disableSubmitButton() {
  let ele = document.getElementById("submitButton");
  ele.disabled = true;
}

let usernameInput = document.getElementById("username");
usernameInput.addEventListener("input", async (event) => {
  let orginalValue = event.target.getAttribute("original-value");
  let newValue = event.target.value;

  if (orginalValue === newValue) {
    // don't need to send request
    usernameInput.setAttribute("help-text", "");
    disableSubmitButton();
  } else {
    let result = await sendUsernameRequest(newValue);
    console.log("username is unique", result.isUnique);

    if (result.isUnique) {
      usernameInput.setAttribute("help-text", "");
      enableSubmitButton();
    } else {
      usernameInput.setAttribute(
        "help-text",
        "Username taken. Please choose a different username."
      );
      disableSubmitButton();
    }
  }
});

let emailInput = document.getElementById("email");
emailInput.addEventListener("input", async (event) => {
  let orginalValue = event.target.getAttribute("original-value");
  let newValue = event.target.value;

  if (orginalValue === newValue) {
    // don't need to send request
    emailInput.setAttribute("help-text", "");
    disableSubmitButton();
  } else {
    let result = await sendEmailRequest(event.target.value);
    console.log("email is unique", result.isUnique);

    if (result.isUnique) {
      emailInput.setAttribute("help-text", "");
      enableSubmitButton();
    } else {
      emailInput.setAttribute(
        "help-text",
        "Email taken. Please choose a different email."
      );
      disableSubmitButton();
    }
  }
});
