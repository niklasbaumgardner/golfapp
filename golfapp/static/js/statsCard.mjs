import { NikElement } from "./customElement.mjs";
import { html } from "./imports.mjs";
import { getRequest } from "./fetch.mjs";
import * as chartJs from "https://cdn.jsdelivr.net/npm/chart.js@3.6.2/+esm";

function average(array) {
  array = array.filter((val) => val != null);

  let average = round(
    array.reduce((a, b) => {
      return a + b;
    }, 0) / array.length,
    2
  );

  return { average, numRounds: array.length };
}

function round(number, decimals) {
  return (
    Math.round((number + Number.EPSILON) * 10 ** decimals) / 10 ** decimals
  );
}

const COLORS = {
  light: {
    labelColor: "rgb(33, 37, 41)",
    gridColor: "rgba(0, 0, 0, .11)",
    tickColor: "rgb(33, 37, 41)",
  },
  dark: {
    labelColor: "rgb(173, 181, 189)",
    gridColor: "rgba(255, 255, 255, .11)",
    tickColor: "rgb(173, 181, 189)",
  },
};

class StatsCard extends NikElement {
  static properties = {
    data: { type: Object },
    averageRound: { type: Number },
    numStatsRounds: { type: Number },
    firAverage: { type: Number },
    firPercent: { type: Number },
    girAverage: { type: Number },
    girPercent: { type: Number },
    puttsPerHole: { type: Number },
    puttsPerRound: { type: Number },

    coursesPlayed: { type: Number },
    statesPlayed: { type: Number },
    lowestRound: { type: Object },
  };

  static get queries() {
    return {
      sliderEl: "#slider",
      chartEl: "#handicap-graph",
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.usingSlider = false;

    this.init();
  }

  async init() {
    let response = await getRequest(STATS_URL);
    this.data = await response.json();
    console.log(this.data);

    await this.updateComplete;

    this.calculateStats();
    this.calculateCourseStats();
    this.initChart();
  }

  calculateStats() {
    let last20Rounds = this.data.rounds.slice(-20);

    let avgRoundArr = [];
    let fir = [];
    let gir = [];
    let putts = [];
    for (let round of last20Rounds) {
      avgRoundArr.push(round.score);
      fir.push(round.fir);
      gir.push(round.gir);
      putts.push(round.putts);
    }

    let avgRoundObj = average(avgRoundArr);
    let avgFirObj = average(fir);
    let avgGirObj = average(gir);
    let avgPuttsObj = average(putts);

    this.averageRound = avgRoundObj.average;
    this.numStatsRounds = avgRoundObj.numRounds;

    this.firAverage = avgFirObj.average;
    this.firPercent = round((100 * avgFirObj.average) / 14, 2);

    this.girAverage = avgGirObj.average;
    this.girPercent = round((100 * avgGirObj.average) / 18, 2);

    this.puttsPerHole = round(avgPuttsObj.average / 18, 2);
    this.puttsPerRound = avgPuttsObj.average;
  }

  initChart() {
    chartJs.Chart.register(...chartJs.registerables);

    const ctx = this.chartEl.getContext("2d");
    this.lineChart = this.createLineChart(ctx);

    let observer = new MutationObserver((mutations) => {
      if (this.lineChart) {
        this.lineChart.destroy();
      }
      this.lineChart = this.createLineChart(ctx);
    });

    observer.observe(document.documentElement, { attributes: true });
  }

  createLineChart(ctx) {
    let theme = document.documentElement.dataset.bsTheme;
    return new chartJs.Chart(ctx, {
      type: "line",
      data: {
        labels: this.data.chart_data.dates,
        datasets: [
          {
            id: "handicap",
            label: "Handicap",
            data: this.data.chart_data.handicaps,
            backgroundColor: "rgb(0, 184, 148)",
            borderColor: "rgb(0, 184, 148)",
            borderWidth: 2,
            color: COLORS[theme].labelColor,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: "Handicap Over Time",
            color: COLORS[theme].labelColor,
          },
          legend: {
            labels: {
              color: COLORS[theme].labelColor,
            },
          },
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            labels: {
              color: COLORS[theme].labelColor,
            },
            grid: {
              color: COLORS[theme].gridColor,
            },
            ticks: {
              color: COLORS[theme].tickColor,
            },
          },
          x: {
            grid: {
              color: COLORS[theme].gridColor,
            },
            ticks: {
              color: COLORS[theme].tickColor,
            },
          },
        },
      },
    });
  }

  calculateCourseStats() {
    let coursesSet = new Set();
    let statesSet = new Set();
    let lowestRound = { score: 9999, toPar: 9999, scoreDiff: 9999 };

    for (let r of this.data.rounds) {
      coursesSet.add(r.course_id);
      let c = COURSES[r.course_id];
      statesSet.add(c.address_dict.StateName);

      if (r.nine_hole_round) {
        continue;
      }

      let t = c.teeboxes.find((t) => t.id === r.teebox_id);
      let toPar = r.score - t.par;
      if (
        toPar < lowestRound.toPar ||
        (toPar === lowestRound.toPar && r.scoreDiff < lowestRound.scoreDiff)
      ) {
        lowestRound = {
          score: r.score,
          toPar,
          scoreDiff: r.scoreDiff,
          course: c,
          teebox: t,
        };
      }
    }

    this.coursesPlayed = coursesSet.size;
    this.statesPlayed = statesSet.size;
    this.lowestRound = lowestRound;
  }

  handicapTemplate() {
    return html`<sl-card class="w-100 mb-3"
      ><div class="row gy-3">
        <div class="col-12 col-lg-4 text-start">
          <h3>Your handicap is ${this.data?.user.handicap.handicap_str}</h3>
          <p>Your handicap is the best 8 of the last 20 rounds</p>
        </div>
        <div class="col-12 col-lg-4 text-center">
          <h3>Your averagecap is ${this.data?.averagecap}</h3>
          <p>Your averagecap is the average of the last 20 rounds</p>
        </div>
        <div class="col-12 col-lg-4 text-end">
          <h3>Your anticap is ${this.data?.anticap}</h3>
          <p>Your anticap is the worst 8 of the last 20 rounds</p>
        </div>
      </div></sl-card
    >`;
  }

  statsTemplate() {
    return html`<sl-card class="w-100 mb-3">
      <div class="row g-3">
        <div class="col-12 col-md-6 col-xxl-3">
          <sl-card class="w-100">
            <h6>Average round</h6>
            <h4 id="avg-round">${this.averageRound}</h4>
            <small
              >last
              <span class="num-rounds">${this.numStatsRounds}</span>
              rounds</small
            >
          </sl-card>
        </div>
        <div class="col-12 col-md-6 col-xxl-3">
          <sl-card class="w-100">
            <h6>FIR</h6>
            <div class="d-flex">
              <span class="w-50">
                <h4>${this.firPercent}%</h4>
              </span>
              <span class="w-50 inline-stat">
                <h4 id="fir">${this.firAverage}</h4>
                <small> / round</small>
              </span>
            </div>
            <small
              >last
              <span class="num-rounds">${this.numStatsRounds}</span>
              rounds</small
            >
          </sl-card>
        </div>
        <div class="col-12 col-md-6 col-xxl-3">
          <sl-card class="w-100">
            <h6>GIR</h6>
            <div class="d-flex">
              <span class="w-50">
                <h4>${this.girPercent}%</h4>
              </span>
              <span class="w-50 inline-stat">
                <h4 id="gir">${this.girAverage}</h4>
                <small> / round</small>
              </span>
            </div>
            <small
              >last
              <span class="num-rounds">${this.numStatsRounds}</span>
              rounds</small
            >
          </sl-card>
        </div>
        <div class="col-12 col-md-6 col-xxl-3">
          <sl-card class="w-100">
            <h6>Putts</h6>
            <div class="d-flex">
              <span class="w-50 inline-stat">
                <h4 id="putts-hole">${this.puttsPerHole}</h4>
                <small> / hole</small>
              </span>
              <span class="w-50 inline-stat">
                <h4 id="putts">${this.puttsPerRound}</h4>
                <small> / round</small>
              </span>
            </div>
            <small
              >last
              <span class="num-rounds">${this.numStatsRounds}</span>
              rounds</small
            >
          </sl-card>
        </div>
      </div></sl-card
    >`;
  }

  coursesStatsTemplate() {
    return html`<sl-card class="w-100 mb-3"
      ><div class="row g-3">
        <div class="col-12 col-md-6 col-xxl-3">
          <sl-card class="w-100">
            <h6>Lowest round</h6>
            <span class="w-50 inline-stat">
              <h4 id="lowest-round">${this.lowestRound?.score}</h4>
              <small> / ${this.lowestRound?.teebox.par}</small>
            </span>
            <span>at ${this.lowestRound?.course.name}</span>
          </sl-card>
        </div>
        <div class="col-12 col-md-6 col-xxl-3">
          <sl-card class="w-100">
            <h6>Rounds played</h6>
            <h4 id="rounds-played">${this.data.rounds.length}</h4>
          </sl-card>
        </div>
        <div class="col-12 col-md-6 col-xxl-3">
          <sl-card class="w-100">
            <h6>Courses played</h6>
            <h4 id="courses-played">${this.coursesPlayed}</h4>
          </sl-card>
        </div>
        <div class="col-12 col-md-6 col-xxl-3">
          <sl-card class="w-100">
            <h6>States played in</h6>
            <h4 id="states-played">${this.statesPlayed}</h4>
          </sl-card>
        </div>
      </div></sl-card
    >`;
  }

  chartTemplate() {
    return html`<sl-card class="w-100">
      <div class="row"><canvas id="handicap-graph"></canvas></div>
    </sl-card>`;
  }

  dataTemplate() {
    if (!this.data) {
      return html`<div class="d-flex justify-content-center">
        <div class="loader"></div>
      </div>`;
    }

    return html`${this.handicapTemplate()}${this.statsTemplate()}${this.coursesStatsTemplate()}${this.chartTemplate()}`;
  }

  render() {
    return html`<sl-details summary="View Stats"
      >${this.dataTemplate()}</sl-details
    >`;
  }
}
export default StatsCard;

customElements.define("stats-card", StatsCard);
