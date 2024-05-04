import { CustomElement } from "./customElement.mjs";

function rankCourses(courseRankings) {
  let courseData = getAverageCourseRating(courseRankings);
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

function getAverageCourseRating(courseRankings) {
  let courseData = {};
  for (let courseRanking of courseRankings) {
    if (courseData[courseRanking.course.id]) {
      courseData[courseRanking.course.id].array.push(courseRanking);
    } else {
      courseData[courseRanking.course.id] = { ...courseRanking.course };
      courseData[courseRanking.course.id].array = [courseRanking];
    }
  }

  for (let [id, obj] of Object.entries(courseData)) {
    obj.averageRating = averageRating(obj.array);
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
      let { username } = obj.user;
      let url = COURSE_RANKING_USER_URL.replace("0", obj.user.id);
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

rankCourses(COURSE_RANKINGS_ARRAY);
