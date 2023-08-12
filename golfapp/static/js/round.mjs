import { createElement } from "./customElement.mjs";

export class Round {
  constructor(
    id,
    course_id,
    teebox_id,
    score,
    score_diff,
    fir,
    gir,
    putts,
    date,
    included,
    editUrl
  ) {
    this.id = id;
    this.course_id = course_id;
    this.teebox_id = teebox_id;
    this.score = score;
    this.score_diff = score_diff;
    this.fir = fir;
    this.gir = gir;
    this.putts = putts;
    this.date = date;
    this.isIncluded = included;
    this.editUrl = editUrl;

    this.created = false;
    this.element = null;

    this.deleteModal = new DeleteModal(this);
  }

  get dateAsString() {
    let date = new Date(this.date + "T00:00:00");
    let options = { month: "long", day: "numeric", year: "numeric" };
    return date.toLocaleDateString("en-US", options);
  }

  renderElement() {
    if (this.created) {
      return this.element;
    }

    this.element = createElement({
      type: "tr",
      classString: this.isIncluded ? "bg-success-subtle round" : "round",
    });

    this.form = createElement({
      type: "form",
      id: `round${this.id}`,
      action: this.editUrl,
      method: "POST",
    });
    this.element.appendChild(this.form);

    let c = COURSES[this.course_id];
    let t = c.teeboxes[this.teebox_id];

    let course = createElement({
      type: "td",
      content: `${c.name} - ${t.teebox} (${t.rating} / ${t.slope})`,
    });
    this.element.appendChild(course);

    let scoreTd = createElement({ type: "td", classString: "w-140p" });
    this.element.appendChild(scoreTd);

    scoreTd.appendChild(
      createElement({
        type: "span",
        classString: `show-not-edit-${this.id}`,
        content: `${this.score} / ${t.par} (${
          this.score_diff
        })`,
      })
    );

    scoreTd.appendChild(
      createElement({
        type: "input",
        classString: `form-control form-control-sm show-edit-${this.id} w-80p`,
        inputType: "number",
        name: "score",
        placeholder: "Score",
        value: this.score,
        form: `round${this.id}`,
        hidden: true,
      })
    );

    let firTd = createElement({ type: "td", classString: "w-80p" });
    this.element.appendChild(firTd);

    firTd.appendChild(
      createElement({
        type: "span",
        classString: `show-not-edit-${this.id}`,
        content: this.fir,
      })
    );

    firTd.appendChild(
      createElement({
        type: "input",
        classString: `form-control form-control-sm show-edit-${this.id} w-80p`,
        inputType: "number",
        name: "fir",
        placeholder: "FIR",
        value: this.fir,
        form: `round${this.id}`,
        hidden: true,
      })
    );

    let girTd = createElement({ type: "td", classString: "w-80p" });
    this.element.appendChild(girTd);

    girTd.appendChild(
      createElement({
        type: "span",
        classString: `show-not-edit-${this.id}`,
        content: this.gir,
      })
    );

    girTd.appendChild(
      createElement({
        type: "input",
        classString: `form-control form-control-sm show-edit-${this.id} w-80p`,
        inputType: "number",
        name: "gir",
        placeholder: "GIR",
        value: this.gir,
        form: `round${this.id}`,
        hidden: true,
      })
    );

    let puttsTd = createElement({ type: "td", classString: "w-80p" });
    this.element.appendChild(puttsTd);

    puttsTd.appendChild(
      createElement({
        type: "span",
        classString: `show-not-edit-${this.id}`,
        content: this.putts,
      })
    );

    puttsTd.appendChild(
      createElement({
        type: "input",
        classString: `form-control form-control-sm show-edit-${this.id} w-80p`,
        inputType: "number",
        name: "putts",
        placeholder: "Putts",
        value: this.putts,
        form: `round${this.id}`,
        hidden: true,
      })
    );

    let dateTd = createElement({ type: "td" });
    this.element.appendChild(dateTd);

    dateTd.appendChild(
      createElement({
        type: "span",
        classString: `show-not-edit-${this.id}`,
        content: this.dateAsString,
      })
    );

    dateTd.appendChild(
      createElement({
        type: "input",
        classString: `form-control form-control-sm show-edit-${this.id}`,
        inputType: "date",
        name: "date",
        value: this.date,
        form: `round${this.id}`,
        hidden: true,
      })
    );

    if (!IS_ME) {
      this.created = true;
      return this.element;
    }

    let editTd = createElement({ type: "td" });
    this.element.appendChild(editTd);

    this.showNotEdit = createElement({ type: "span" });
    editTd.appendChild(this.showNotEdit);

    let editButton = createElement({
      type: "button",
      classString: "btn btn-link padding-1-4",
      content: "edit",
      onclick: (event) => {
        this.handleEditRound(event);
      },
    });
    this.showNotEdit.appendChild(editButton);

    this.showNotEdit.appendChild(
      createElement({
        type: "span",
        content: "|",
      })
    );

    let deleteButton = createElement({
      type: "button",
      classString: "btn btn-link padding-1-4",
      content: "delete",
      onclick: (event) => {
        this.handleDeleteRound(event);
      },
    });
    this.showNotEdit.appendChild(deleteButton);

    this.showEdit = createElement({
      type: "span",
      hidden: true,
    });
    editTd.appendChild(this.showEdit);

    let updateButton = createElement({
      type: "button",
      classString: "btn btn-link padding-1-4",
      content: "update",
      onclick: (event) => {
        this.handleUpdateRound(event);
      },
    });
    this.showEdit.appendChild(updateButton);

    this.showEdit.appendChild(
      createElement({
        type: "span",
        content: "|",
      })
    );

    let cancelButton = createElement({
      type: "button",
      classString: "btn btn-link padding-1-4",
      content: "cancel",
      onclick: (event) => {
        this.handleCancelEditRound(event);
      },
    });
    this.showEdit.appendChild(cancelButton);

    this.deleteModal.renderElement();

    this.created = true;

    return this.element;
  }

  handleEditRound(event) {
    event.preventDefault();
    this.showNotEdit.hidden = true;
    for (let ele of this.element.getElementsByClassName(
      `show-not-edit-${this.id}`
    )) {
      ele.hidden = true;
    }

    this.showEdit.hidden = false;
    for (let ele of this.element.getElementsByClassName(
      `show-edit-${this.id}`
    )) {
      ele.hidden = false;
    }
  }

  handleDeleteRound(event) {
    event.preventDefault();
    this.deleteModal.show();
  }

  handleUpdateRound(event) {
    event.preventDefault();
    this.form.submit();
  }

  handleCancelEditRound(event) {
    event.preventDefault();
    this.showNotEdit.hidden = false;
    for (let ele of this.element.getElementsByClassName(
      `show-not-edit-${this.id}`
    )) {
      ele.hidden = false;
    }

    this.showEdit.hidden = true;
    for (let ele of this.element.getElementsByClassName(
      `show-edit-${this.id}`
    )) {
      ele.hidden = true;
    }
  }
}

class DeleteModal {
  constructor(round) {
    this.round = round;
    this.created = false;
    this.element = null;
  }

  show() {
    this.element.style.display = "block";
  }

  hide() {
    this.element.style.display = "none";
  }

  renderElement() {
    if (this.created) {
      return;
    }

    this.element = createElement({
      id: `deleteRound${this.round.id}`,
      classString: "modal",
      style: "display:none;",
    });

    let div1 = createElement({ classString: "modal-dialog" });
    this.element.appendChild(div1);

    let div2 = createElement({ classString: "modal-content" });
    div1.appendChild(div2);

    let div3 = createElement({ classString: "modal-header" });
    div2.appendChild(div3);

    div3.appendChild(
      createElement({
        type: "h5",
        classString: "modal-title",
        content: `Delete ${COURSES[this.round.course_id].name} round?`,
      })
    );

    div3.appendChild(
      createElement({
        type: "button",
        onclick: () => {
          this.hide();
        },
        classString: "btn-close",
      })
    );

    let div4 = createElement({ classString: "modal-body" });
    div2.appendChild(div4);

    div4.appendChild(
      createElement({
        type: "p",
        content: "Are you sure you want to delete this round?",
      })
    );
    div4.appendChild(
      createElement({
        type: "p",
        classString: "px3",
        content: `Course: ${COURSES[this.round.course_id].name}`,
      })
    );
    div4.appendChild(
      createElement({
        type: "p",
        classString: "px3",
        content: `Score: ${this.round.score}`,
      })
    );
    div4.appendChild(
      createElement({
        type: "p",
        classString: "px3",
        content: `Date: ${this.round.dateAsString}`,
      })
    );

    let div5 = createElement({ classString: "modal-footer" });
    div2.appendChild(div5);

    let form = createElement({
      type: "form",
      method: "POST",
      action: DELETE_ROUND_URL + this.round.id,
    });
    div5.appendChild(form);

    form.appendChild(
      createElement({
        type: "input",
        classString: "page-number",
        name: "page",
        inputType: "number",
        value: 1,
        hidden: true,
      })
    );

    form.appendChild(
      createElement({
        type: "button",
        inputType: "submit",
        classString: "btn btn-danger me-1",
        content: "Delete",
      })
    );

    form.appendChild(
      createElement({
        type: "button",
        onclick: () => {
          this.hide();
        },
        inputType: "button",
        classString: "btn btn-outline-secondary",
        content: "Cancel",
      })
    );

    this.parentElement = document.getElementById("deleteModals");
    this.parentElement.appendChild(this.element);

    this.created = true;
  }
}
