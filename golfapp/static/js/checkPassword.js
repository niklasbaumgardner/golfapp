"use strict";

function checkPasswordsEqual() {
  let password1 = document.getElementById("password1").value;
  let password2El = document.getElementById("password2");
  let password2 = password2El.value;

  if (password2.length < password1.length) {
    password2El.setAttribute("help-text", "");
  } else {
    if (password1 === password2) {
      password2El.setAttribute("help-text", "");
    } else {
      password2El.setAttribute("help-text", "Password does not match");
    }
  }
}

let password1 = document.getElementById("password1");
let password2 = document.getElementById("password2");

password1.addEventListener("sl-input", checkPasswordsEqual);
password2.addEventListener("sl-input", checkPasswordsEqual);
