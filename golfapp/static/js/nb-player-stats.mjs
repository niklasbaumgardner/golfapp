import { NikElement } from "./nik-element.mjs";
import { html } from "./bundle.mjs";
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

class PlayerStats extends NikElement {
  static properties = {
    rounds: { type: Array },
    user: { type: Object },

    data: { type: Object },
    averagecap: { type: String },
    anticap: { type: String },
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
    highLowRound: { type: Object },
  };

  static get queries() {
    return {
      chartEl: "#handicap-graph",
    };
  }

  connectedCallback() {
    super.connectedCallback();

    this.init();
  }

  async init() {
    this.calculateStats();
    this.getHighLowRounds();
    this.calculateCourseStats();
    // this.initChart();
  }

  calculate_handicap(rounds) {
    let count = rounds.length;
    let score_diffs = rounds.map((r) => r.score_diff);
    let handicap;

    if (count <= 3) {
      handicap = score_diffs[0] - 2;
    } else if (count === 4) {
      handicap = score_diffs[0] - 1;
    } else if (count === 5) {
      handicap = score_diffs[0];
    } else if (count === 6) {
      handicap = sum(score_diffs.silce(0, 2)) / 2 - 1;
    } else if (count > 6) {
      let numberOfRounds = 0;
      if (count === 7 || count === 8) {
        numberOfRounds = 2;
      } else if (9 <= count && count <= 11) {
        numberOfRounds = 3;
      } else if (12 <= count && count <= 14) {
        numberOfRounds = 4;
      } else if (count === 15 || count === 16) {
        numberOfRounds = 5;
      } else if (count === 17 || count === 18) {
        numberOfRounds = 6;
      } else if (count === 19) {
        numberOfRounds = 7;
      } else if (count >= 20) {
        numberOfRounds = 8;
      }

      handicap =
        score_diffs
          .slice(0, numberOfRounds)
          .reduce((currentSum, sd) => currentSum + sd, 0) / numberOfRounds;
    }

    return round(handicap, 2);
  }

  handicapString(number) {
    if (number < 0) {
      return `+${-1 * number}`;
    }
    return `${number}`;
  }

  calculateAveragecap(rounds) {
    if (!rounds.length) {
      return null;
    }

    let averagecap = round(
      rounds.reduce((currentSum, r) => currentSum + r.score_diff, 0) /
        rounds.length,
      2
    );

    return this.handicapString(averagecap);
  }

  calculateAnticap(rounds) {
    if (!rounds.length) {
      return null;
    }

    rounds.sort((a, b) => b.score_diff - a.score_diff);

    let anticap = this.calculate_handicap(rounds);

    return this.handicapString(anticap);
  }

  calculateStats() {
    let recent20Rounds = this.rounds.slice(0, 20);

    this.averagecap = this.calculateAveragecap([...recent20Rounds]);
    this.anticap = this.calculateAnticap([...recent20Rounds]);

    let avgRoundArr = [];
    let fir = [];
    let gir = [];
    let putts = [];
    for (let round of recent20Rounds) {
      let multiplier = 1;
      if (round.nine_hole_round) {
        multiplier = 2;
      }
      avgRoundArr.push(round.score * multiplier);
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
    let theme = document.documentElement.classList.contains("wa-dark")
      ? "dark"
      : "light";
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

  getHighLowRounds() {
    let recent20Rounds = this.rounds.slice(0, 20);

    let lowestRound = { score: 9999, toPar: 9999, scoreDiff: 9999 };
    let highestRound = { score: -9999, toPar: -9999, scoreDiff: -9999 };

    for (let r of recent20Rounds) {
      if (r.nine_hole_round) {
        continue;
      }

      let c = r.course;
      let t = c.teeboxes.find((t) => t.id === r.teebox_id);
      let toPar = r.score - t.par;
      if (
        toPar < lowestRound.toPar ||
        (toPar === lowestRound.toPar && r.score_diff < lowestRound.scoreDiff)
      ) {
        lowestRound = {
          score: r.score,
          toPar,
          scoreDiff: r.score_diff,
          course: c,
          teebox: t,
        };
      }

      if (
        toPar > highestRound.toPar ||
        (toPar === highestRound && r.score_diff > highestRound.scoreDiff)
      ) {
        highestRound = {
          score: r.score,
          toPar,
          scoreDiff: r.score_diff,
          course: c,
          teebox: t,
        };
      }
    }

    this.highLowRound = { low: lowestRound, high: highestRound };
  }

  calculateCourseStats() {
    this.coursesPlayed = new Set(this.rounds.map((r) => r.course_id)).size;

    let statesPlayed = new Set(
      this.rounds.map((r) => r.course.address_dict?.StateName)
    );
    let nullState = 0;
    if (statesPlayed.has(undefined)) {
      nullState = 1;
    }
    this.statesPlayed = statesPlayed.size - nullState;
  }

  handicapTemplate() {
    return html`<wa-card
      ><div class="flex flex-col">
        <div class="text-start">
          <h4>Your handicap is ${this.user.handicap.handicap_str}</h4>
          <p>Your handicap is the best 8 of the last 20 rounds</p>
        </div>
        <div class="text-center">
          <h4>Your averagecap is ${this.averagecap}</h4>
          <p>Your averagecap is the average of the last 20 rounds</p>
        </div>
        <div class="text-end">
          <h4>Your anticap is ${this.anticap}</h4>
          <p>Your anticap is the worst 8 of the last 20 rounds</p>
        </div>
      </div>
    </wa-card>`;
  }

  statsTemplate() {
    return html`<div class="wa-grid">
      <wa-card>
        <div class="wa-stack">
          <span class="wa-heading-s">Average round</span>
          <span id="avg-round" class="wa-heading-m">${this.averageRound}</span>
          <span class="wa-caption-m">last ${this.numStatsRounds} rounds</span>
        </div></wa-card
      ><wa-card>
        <div class="wa-stack">
          <span class="wa-heading-s">FIR</span>
          <div class="flex justify-between">
            <span class="wa-heading-m">${this.firPercent}%</span>

            <div>
              <span id="fir" class="wa-heading-m">${this.firAverage}</span>
              <span class="wa-caption-m"> / round</span>
            </div>
          </div>
          <span class="wa-caption-m">last ${this.numStatsRounds} rounds</span>
        </div>
      </wa-card>
      <wa-card>
        <div class="wa-stack">
          <span class="wa-heading-s">GIR</span>
          <div class="flex justify-between">
            <span class="wa-heading-m">${this.girPercent}%</span>

            <div>
              <span id="gir" class="wa-heading-m">${this.girAverage}</span>
              <span class="wa-caption-m"> / round</span>
            </div>
          </div>
          <span class="wa-caption-m">last ${this.numStatsRounds} rounds</span>
        </div>
      </wa-card>
      <wa-card>
        <div class="wa-stack">
          <span class="wa-heading-s">Putts</span>
          <div class="flex justify-between">
            <div>
              <span id="putts-hole" class="wa-heading-m"
                >${this.puttsPerHole}</span
              >
              <span class="wa-caption-m"> / hole</span>
            </div>
            <div>
              <span id="putts" class="wa-heading-m">${this.puttsPerRound}</span>
              <span class="wa-caption-m"> / round</span>
            </div>
          </div>
          <span class="wa-caption-m">last ${this.numStatsRounds} rounds</span>
        </div>
      </wa-card>
    </div>`;
  }

  coursesStatsTemplate() {
    return html`<div class="wa-grid">
      <wa-card>
        <div class="wa-stack">
          <div class="flex justify-between items-end">
            <span>
              <span class="wa-heading-s">Low: </span>
              <span class="wa-heading-m" id="lowest-round"
                >${this.highLowRound?.low.score}</span
              >
              <span class="wa-caption-m">
                / ${this.highLowRound?.low.teebox.par}</span
              >
            </span>
            <span class="wa-caption-m"
              >at ${this.highLowRound?.low.course.name}</span
            >
          </div>

          <div class="flex justify-between items-end">
            <span>
              <span class="wa-heading-s">High: </span>
              <span class="wa-heading-m" id="lowest-round"
                >${this.highLowRound?.high.score}</span
              >
              <span class="wa-caption-m">
                / ${this.highLowRound?.high.teebox.par}</span
              >
            </span>
            <span class="wa-caption-m"
              >at ${this.highLowRound?.high.course.name}</span
            >
          </div>
        </div>
      </wa-card>
      <wa-card>
        <div class="wa-stack">
          <span class="wa-heading-s">Rounds played</span>
          <span class="wa-heading-m" id="rounds-played"
            >${this.rounds.length}</span
          >
        </div>
      </wa-card>
      <wa-card>
        <div class="wa-stack">
          <span class="wa-heading-s">Courses played</span>
          <span class="wa-heading-m" id="courses-played"
            >${this.coursesPlayed}</span
          >
        </div>
      </wa-card>
      <wa-card>
        <div class="wa-stack">
          <span class="wa-heading-s">States played in</span>
          <span class="wa-heading-m" id="states-played"
            >${this.statesPlayed}</span
          >
        </div>
      </wa-card>
    </div>`;
  }

  chartTemplate() {
    return null;
    return html`<wa-card
      ><div class="min-h-20"><canvas id="handicap-graph"></canvas></div
    ></wa-card>`;
  }

  render() {
    return html`<wa-details summary="View Stats"
      ><div class="wa-stack">
        ${this.handicapTemplate()}${this.statsTemplate()}${this.coursesStatsTemplate()}${this.chartTemplate()}
      </div></wa-details
    >`;
  }
}

customElements.define("nb-player-stats", PlayerStats);
