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
    data: {
      type: Object,
    },
  };

  static get queries() {
    return {
      sliderEl: "#slider",
      avgRoundEl: "#avg-round",
      firEl: "#fir",
      firPercentEl: "#fir-percent",
      girEl: "#gir",
      girPercentEl: "#gir-percent",
      puttsEl: "#putts",
      puttsPerHoleEl: "#putts-hole",
      chartEl: "#handicap-graph",
    };
  }

  connectedCallback() {
    super.connectedCallback();

    this.init();
  }

  async init() {
    let response = await getRequest(STATS_URL);
    this.data = await response.json();
    console.log(this.data);

    await this.updateComplete;

    this.initSlider();
    this.initChart();
  }

  initSlider() {
    let start = this.data.rounds.length > 20 ? this.data.rounds.length - 20 : 0;
    let end = this.data.rounds.length;
    this.calculateStats(start, end - 1);

    let numTicks = Math.round(window.innerWidth / 50);

    noUiSlider.create(this.sliderEl, {
      start: [start, end],
      step: 1,
      margin: 1,
      connect: true,
      range: { min: 1, max: end },
      tooltips: true,
      pips: {
        mode: "count",
        values: numTicks,
        density: 100 / numTicks,
        filter: () => {
          return 1;
        },
      },
    });

    this.sliderEl.noUiSlider.on(
      "set",
      (values, handle, unencoded, tap, positions, noUiSlider) =>
        this.handleSliderDraggingDone(unencoded)
    );
  }

  handleSliderDraggingDone(unencoded) {
    let [start, end] = unencoded;
    this.calculateStats(start - 1, end - 1);
  }

  calculateStats(start, end) {
    let tempRounds = this.data.rounds.slice(start, end + 1);

    let avgRoundArr = [];
    let fir = [];
    let gir = [];
    let putts = [];
    for (let round of tempRounds) {
      avgRoundArr.push(round.score);
      fir.push(round.fir);
      gir.push(round.gir);
      putts.push(round.putts);
    }

    let avgRound = average(avgRoundArr);
    let avgFir = average(fir);
    let avgGir = average(gir);
    let avgPutts = average(putts);

    this.avgRoundEl.textContent = avgRound.average;
    this.avgRoundEl.parentElement.parentElement.querySelector(
      ".num-rounds"
    ).textContent = avgRound.numRounds;

    this.firPercentEl.textContent = round((100 * avgFir.average) / 14, 2);
    this.firEl.textContent = avgFir.average;
    this.firEl.parentElement.parentElement.querySelector(
      ".num-rounds"
    ).textContent = avgFir.numRounds;

    this.girPercentEl.textContent = round((100 * avgGir.average) / 18, 2);
    this.girEl.textContent = avgGir.average;
    this.girEl.parentElement.parentElement.querySelector(
      ".num-rounds"
    ).textContent = avgGir.numRounds;

    this.puttsPerHoleEl.textContent = round(avgPutts.average / 18, 2);
    this.puttsEl.textContent = avgPutts.average;
    this.puttsEl.parentElement.parentElement.querySelector(
      ".num-rounds"
    ).textContent = avgPutts.numRounds;
  }

  initChart() {
    chartJs.Chart.register(...chartJs.registerables);

    const ctx = this.chartEl.getContext("2d");
    this.lineChart = this.createLineChart(ctx);

    let observer = new MutationObserver((mutations) => {
      let theme = document.documentElement.dataset.bsTheme;
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

  handicapTemplate() {
    return html`<sl-card class="w-100 mb-3"
      ><div class="row gy-3">
        <div class="col-12 col-lg-4">
          <div class="row fs-2">
            <div class="text-start">
              Your handicap is ${this.data?.user.handicap.handicap_str}
            </div>
          </div>
          <div class="row">
            <div class="text-start">
              Your handicap is the best 8 of the last 20 rounds
            </div>
          </div>
        </div>
        <div class="col-12 col-lg-4">
          <div class="row fs-2">
            <div class="text-center">
              Your averagecap is ${this.data?.averagecap}
            </div>
          </div>
          <div class="row">
            <div class="text-center">
              Your averagecap is the average of the last 20 rounds
            </div>
          </div>
        </div>
        <div class="col-12 col-lg-4">
          <div class="row fs-2">
            <div class="text-end">Your anticap is ${this.data?.anticap}</div>
          </div>
          <div class="row">
            <div class="text-end">
              Your anticap is the worst 8 of the last 20 rounds
            </div>
          </div>
        </div>
      </div></sl-card
    >`;
  }

  sliderStatsTemplate() {
    return html`<sl-card class="w-100 mb-3"
      ><div class="d-flex flex-column gy-3">
        <span class="fs-3 mb-4">Select a range of rounds:</span>
        <div id="slider"></div>
        <div class="row mt-5 pt-5">
          <div class="col">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Average round</h5>
                <p class="card-text"><span id="avg-round"></span></p>
                <p class="card-text">
                  <small class="text-body-secondary"
                    >out of <span class="num-rounds"></span> rounds</small
                  >
                </p>
              </div>
            </div>
          </div>
          <div class="col">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Fairways in regulation</h5>
                <p class="card-text">
                  <span id="fir"></span> fairways per round
                </p>
                <p class="card-text">
                  <span id="fir-percent"></span>% of fairways
                </p>
                <p class="card-text">
                  <small class="text-body-secondary"
                    >out of <span class="num-rounds"></span> rounds</small
                  >
                </p>
              </div>
            </div>
          </div>
          <div class="col">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Greens in regulation</h5>
                <p class="card-text"><span id="gir"></span> greens per round</p>
                <p class="card-text">
                  <span id="gir-percent"></span>% of greens
                </p>
                <p class="card-text">
                  <small class="text-body-secondary"
                    >out of <span class="num-rounds"></span> rounds</small
                  >
                </p>
              </div>
            </div>
          </div>
          <div class="col">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">Average putts</h5>
                <p class="card-text"><span id="putts"></span> per round</p>
                <p class="card-text"><span id="putts-hole"></span> per hole</p>
                <p class="card-text">
                  <small class="text-body-secondary"
                    >out of <span class="num-rounds"></span> rounds</small
                  >
                </p>
              </div>
            </div>
          </div>
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

    return html`${this.handicapTemplate()}${this.sliderStatsTemplate()}
    ${this.chartTemplate()}`;
  }

  render() {
    return html`<sl-details summary="View Stats"
      >${this.dataTemplate()}</sl-details
    >`;
  }
}
export default StatsCard;

customElements.define("stats-card", StatsCard);
