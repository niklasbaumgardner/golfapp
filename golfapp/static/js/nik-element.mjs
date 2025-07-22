import { LitElement } from "./bundle.mjs";

function query(el, selector) {
  return () => el.querySelector(selector);
}

function queryAll(el, selector) {
  return () => el.querySelectorAll(selector);
}

export class NikElement extends LitElement {
  constructor() {
    super();
    let { queries } = this.constructor;
    if (queries) {
      for (let [selectorName, selector] of Object.entries(queries)) {
        if (selector.all) {
          Object.defineProperty(this, selectorName, {
            get: queryAll(this, selector.all),
          });
        } else {
          Object.defineProperty(this, selectorName, {
            get: query(this, selector),
          });
        }
      }
    }
  }

  createRenderRoot() {
    return this;
  }
}
