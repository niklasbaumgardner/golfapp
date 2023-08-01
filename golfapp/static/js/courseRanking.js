"use strict";

class CourseRanking {
  constructor(courses, courseRankingArr) {
    this.courses = courses;
    this.courseRankingArr = courseRankingArr;
    this.coursesMap = {};

    if (document.getElementById("course")) {
      this.courseHandler = new CourseHandler(courses, courseRankingArr);
    }

    this.init();
  }

  init() {
    for (let c of this.courses) {
      this.coursesMap[c.id] = c.name;
    }

    this.courseRankingArr.sort((a, b) => {
      return a.rating < b.rating;
    });

    let ranking = document.querySelector("tbody");

    let rank = 1;
    for (let [i, r] of this.courseRankingArr.entries()) {
      if (i === 0) {
        new CourseRank(
          r.course_id,
          rank,
          this.coursesMap[r.course_id],
          r.rating,
          ranking
        );
      } else if (r.rating === this.courseRankingArr.at(i - 1).rating) {
        new CourseRank(
          r.course_id,
          rank,
          this.coursesMap[r.course_id],
          r.rating,
          ranking
        );
      } else {
        rank = i + 1;
        new CourseRank(
          r.course_id,
          rank,
          this.coursesMap[r.course_id],
          r.rating,
          ranking
        );
      }
    }
  }
}

class CourseHandler {
  constructor(courses, courseRankingArr) {
    this.courses = courses;
    this.courseRankingArr = courseRankingArr;

    this.courses = this.courses.filter((c) => {
      return !this.courseRankingArr.find((rank) => rank.course_id === c.id);
    });

    this.selectCoursesEl = document.getElementById("course");

    this.init();
  }

  init() {
    this.courses.sort((a, b) => {
      return a.name > b.name;
    });
    for (let c of this.courses) {
      new CourseOption(c.id, c.name, this.selectCoursesEl);
    }
  }
}

class CourseRank extends CustomElement {
  constructor(course_id, rank, name, rating, anchor) {
    super();

    this.course_id = course_id;
    this.rank = rank;
    this.name = name;
    this.rating = rating;

    this.addToAnchor(anchor);

    this.initializeElements();

    this.addEventListenders();
  }

  querySelector(query) {
    return super.querySelector(`.course${this.course_id} ${query}`);
  }

  querySelectorAll(query) {
    return super.querySelectorAll(`.course${this.course_id} ${query}`);
  }

  handleEvent(event) {
    if (event.type === "click") {
      this.onClick(event);
    }
  }

  onClick(event) {
    switch (event.target.id) {
      case "edit-button":
        this.showEditableEls();
        this.hideNonEditableEls();
        break;
      case "cancel-button":
        this.showNonEditableEls();
        this.hideEditableEls();
        break;
    }
  }

  initializeElements() {
    this.editButton = this.querySelector("#edit-button");
    this.cancelButton = this.querySelector("#cancel-button");
    this.updateButton = this.querySelector("#update-button");

    this.nonEditableEls = this.querySelectorAll(".not-edit");
    this.editableEls = this.querySelectorAll(".edit");

    this.showNonEditableEls();
    this.hideEditableEls();
  }

  addEventListenders() {
    this.editButton?.addEventListener("click", this);
    this.cancelButton?.addEventListener("click", this);
  }

  hideEditableEls() {
    for (let el of this.editableEls) {
      el.hidden = true;
    }
  }

  showEditableEls() {
    for (let el of this.editableEls) {
      el.hidden = false;
    }
  }

  hideNonEditableEls() {
    for (let el of this.nonEditableEls) {
      el.hidden = true;
    }
  }

  showNonEditableEls() {
    for (let el of this.nonEditableEls) {
      el.hidden = false;
    }
  }

  editButtomTemplate() {
    if (IS_ME) {
      return `<td class="not-edit"><button id="edit-button" class="btn btn-outline-primary">Edit</button></td>`;
    }
    return "";
  }

  editableRowTemplate() {
    if (IS_ME) {
      return `
        <td class="edit">${this.rank}</td>
        <td class="edit">${this.name}</td>
        <td class="edit">
          <form id="courseEdit${this.course_id}" action="${COURSE_RANKING_EDIT}" method="POST">
            <input value="${this.course_id}" name="course" hidden>
            <input value="${this.rating}" class="form-control" type="number" step="0.01" name="rating" placeholder="Rating" max="10" required>
          </form>
        </td>
        <td class="edit">
          <button id="update-button" class="btn btn-primary" type="submit" form="courseEdit${this.course_id}">Update</button>
          <button id="cancel-button" class="btn btn-outline-secondary">Cancel</button>
        </td>`;
    }
    return "";
  }

  get markup() {
    return `<template>
      <tr class="course${this.course_id}">
        <td class="not-edit">${this.rank}</td>
        <td class="not-edit">${this.name}</td>
        <td class="not-edit">${this.rating}</td>
        ${this.editButtomTemplate()}
        ${this.editableRowTemplate()}
      </tr>
    </template>`;
  }
}

class CourseOption extends CustomElement {
  constructor(id, name, anchor) {
    super();

    this.id = id;
    this.name = name;

    this.addToAnchor(anchor);
  }

  get markup() {
    return `<template>
      <option value="${this.id}">${this.name}</option>
    </template>`;
  }
}
