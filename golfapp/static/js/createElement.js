"use strict";

function createElement(options) {
  if (!options.type) {
    options.type = "div";
  }

  let ele = document.createElement(options.type);

  if (options.id) {
    ele.id = options.id;
  }

  if (options.classString) {
    ele.classList.add(...options.classString.split(" "));
  }

  if (options.href) {
    ele.href = options.href;
  }

  if (options.onclick) {
    ele.onclick = options.onclick;
  }

  if (options.content) {
    ele.textContent = options.content;
  }

  if (options.action) {
    ele.action = options.action;
  }

  if (options.name) {
    ele.name = options.name;
  }

  if (options.hidden) {
    ele.hidden = true;
  }

  if (options.selected) {
    ele.selected = true;
  }

  if (options.disabled) {
    ele.disabled = true;
  }

  if (options.value !== undefined) {
    ele.value = options.value;
  }

  if (options.autocomplete) {
    ele.autocomplete = options.autocomplete;
  }

  if (options.step) {
    ele.step = options.step;
  }

  if (options.innerHTML) {
    ele.innerHTML = options.innerHTML;
  }

  if (options.inputType) {
    ele.type = options.inputType;
  }

  if (options.method) {
    ele.method = options.method;
  }

  if (options.required) {
    ele.required = options.required;
  }

  if (options.for) {
    ele.for = options.for;
  }

  if (options.onpointerdown) {
    ele.onpointerdown = options.onpointerdown;
  }

  if (options.onpointerup) {
    ele.onpointerup = options.onpointerup;
  }

  if (options.onpointercancel) {
    ele.onpointercancel = options.onpointercancel;
  }

  if (options.placeholder) {
    ele.placeholder = options.placeholder;
  }

  if (options.form) {
    ele.setAttribute("form", options.form);
  }

  return ele;
}

class CustomElement {
  get markup() {
    return `<template><p>Hello world</p></template>`;
  }

  get fragment() {
    if (!this.template) {
      let parser = new DOMParser();
      let doc = parser.parseFromString(this.markup, "text/html");
      this.template = document.importNode(doc.querySelector("template"), true);
    }
    let fragment = this.template.content.cloneNode(true);
    return fragment;
  }

  addToAnchor(anchor) {
    this.anchor = anchor;
    this.anchor.appendChild(this.fragment);
  }

  querySelector(query) {
    return this.anchor?.querySelector(query);
  }
  querySelectorAll(query) {
    return this.anchor?.querySelectorAll(query);
  }
}
