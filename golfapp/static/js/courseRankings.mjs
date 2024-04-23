import { CustomElement } from "./customElement.mjs";

let users = null;
async function getPageData() {
  let response = await fetch(GET_ALL_RANKING_DATA_URL);
  let data = await response.json();

  users = data.users;

  rankCourses(data.courses, data.course_rankings);
}

getPageData();

function rankCourses(courses, courseRankings) {
  let courseData = getAverageCourseRating(courseRankings, courses);
  courseData.sort((a, b) => b.averageRating - a.averageRating);

  let anchor = document.querySelector("tbody");

  let rank = 1;
  for (let [i, rankData] of courseData.entries()) {
    let tableRow;
    if (i === 0) {
      tableRow = new TableRow(
        rank,
        rankData.name,
        rankData.averageRating,
        rankData.array
      );
    } else if (rankData.averageRating === courseData.at(i - 1).averageRating) {
      tableRow = new TableRow(
        rank,
        rankData.name,
        rankData.averageRating,
        rankData.array
      );
    } else {
      rank = i + 1;
      tableRow = new TableRow(
        rank,
        rankData.name,
        rankData.averageRating,
        rankData.array
      );
    }
    tableRow.addToAnchor(anchor);
  }
}

function getAverageCourseRating(courseRankings, courses) {
  let courseData = {};
  for (let [id, courseRanking] of Object.entries(courseRankings)) {
    if (courseData[courseRanking.course_id]) {
      courseData[courseRanking.course_id].array.push(courseRanking);
    } else {
      courseData[courseRanking.course_id] = { id: courseRanking.course_id };
      courseData[courseRanking.course_id].array = [courseRanking];
    }
  }

  for (let [id, obj] of Object.entries(courseData)) {
    obj.averageRating = averageRating(obj.array);
    obj.name = courses[id].name;
  }

  return Object.values(courseData);
}

function getWeight(number) {
  return Math.min(95 + number, 100) / 100;
}

function averageRating(array) {
  let averageRating =
    array.reduce(
      (acumulator, currentValue) => acumulator + currentValue.rating,
      0
    ) / array.length;

  let weight = getWeight(array.length);
  return averageRating * weight;
}

class TableRow extends CustomElement {
  constructor(rank, name, averageRating, ratingsArray) {
    super();

    this.rank = rank;
    this.name = name;
    this.averageRating = averageRating;
    this.ratingsArray = ratingsArray;
  }

  get averageRatingRounded() {
    return Math.round(this.averageRating * 100) / 100;
  }

  allRatingsTemplate() {
    this.ratingsArray.sort((a, b) => b.rating - a.rating);
    let content = "";
    for (let [i, obj] of this.ratingsArray.entries()) {
      let username = users[obj.user_id].username;
      let url = COURSE_RANKING_USER_URL.replace("0", obj.user_id);
      let ratingSpan = `<a class="rating-by-user" href="${url}" title="Rating from ${username}">${obj.rating} by ${username}</a>`;
      if (i !== this.ratingsArray.length - 1) {
        ratingSpan += '<span class="rating-by-user">,  </span>';
      }
      content += ratingSpan;
    }

    return content.slice(0, content.length - 2);
  }

  get markup() {
    return `<template>
      <tr>
        <td class="not-edit">${this.rank}</td>
        <td class="not-edit">${this.name}</td>
        <td class="not-edit">${this.averageRatingRounded}</td>
        <td>${this.allRatingsTemplate()}</td>
      </tr>
    </template>`;
  }
}
