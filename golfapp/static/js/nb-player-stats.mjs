import { NikElement } from "./customElement.mjs";
import { html } from "./imports.mjs";
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
      chartEl: "#handicap-graph",
    };
  }

  connectedCallback() {
    super.connectedCallback();

    this.init();
  }

  async init() {
    let response = await fetch(STATS_URL);
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

  calculateCourseStats() {
    let coursesSet = new Set();
    let statesSet = new Set();
    let lowestRound = { score: 9999, toPar: 9999, scoreDiff: 9999 };

    for (let r of this.data.rounds) {
      coursesSet.add(r.course_id);
      let c = COURSES[r.course_id];
      if (c.address) {
        statesSet.add(c.address_dict.StateName);
      }

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
    return html`<wa-card
      ><div class="flex flex-col">
        <div class="text-start">
          <h4>Your handicap is ${this.data?.user.handicap.handicap_str}</h4>
          <p>Your handicap is the best 8 of the last 20 rounds</p>
        </div>
        <div class="text-center">
          <h4>Your averagecap is ${this.data?.averagecap}</h4>
          <p>Your averagecap is the average of the last 20 rounds</p>
        </div>
        <div class="text-end">
          <h4>Your anticap is ${this.data?.anticap}</h4>
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
          <span class="wa-heading-s">Lowest round</span>
          <div class="flex justify-between">
            <span>
              <span class="wa-heading-m" id="lowest-round"
                >${this.lowestRound?.score}</span
              >
              <span class="wa-caption-m">
                / ${this.lowestRound?.teebox.par}</span
              >
            </span>

            <span class="wa-caption-m"
              >at ${this.lowestRound?.course.name}</span
            >
          </div>
        </div>
      </wa-card>
      <wa-card>
        <div class="wa-stack">
          <span class="wa-heading-s">Rounds played</span>
          <span class="wa-heading-m" id="rounds-played"
            >${this.data.rounds.length}</span
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
    return html`<wa-card
      ><div class="min-h-20"><canvas id="handicap-graph"></canvas></div
    ></wa-card>`;
  }

  dataTemplate() {
    if (!this.data) {
      return html`<div class="flex justify-center">
        <wa-spinner class="text-6xl"></wa-spinner>
      </div>`;
    }

    return html`<div class="wa-stack">
      ${this.handicapTemplate()}${this.statsTemplate()}${this.coursesStatsTemplate()}${this.chartTemplate()}
    </div>`;
  }

  render() {
    return html`<wa-details summary="View Stats"
      >${this.dataTemplate()}</wa-details
    >`;
  }
}

customElements.define("nb-player-stats", PlayerStats);
