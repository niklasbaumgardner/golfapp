import * as chartJs from "https://cdn.jsdelivr.net/npm/chart.js@3.6.2/+esm";
// import * as chartjsPluginDatalabels from "https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/+esm";

let ROUNDS;

const AVG_ROUND = document.getElementById("avg-round");
const FIR = document.getElementById("fir");
const GIR = document.getElementById("gir");
const PUTTS = document.getElementById("putts");

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
let theme = document.documentElement.dataset.bsTheme;

chartJs.Chart.register(...chartJs.registerables);

const ctx = document.getElementById("handicap-graph").getContext("2d");
let lineChart = createLineChart(ctx);

let observer = new MutationObserver((mutations) => {
  theme = document.documentElement.dataset.bsTheme;
  if (lineChart) {
    lineChart.destroy();
  }
  lineChart = createLineChart(ctx);
});

observer.observe(document.documentElement, { attributes: true });

async function getPageData() {
  let respone = await fetch(GET_ROUNDS_URL);
  let data = await respone.json();

  ROUNDS = data.rounds;

  let start = ROUNDS.length > 20 ? ROUNDS.length - 20 : 0;
  let end = ROUNDS.length;
  calculateStats(start - 1, end - 1);

  let numTicks = Math.round(window.innerWidth / 50);

  let slider = document.getElementById("slider");
  noUiSlider.create(slider, {
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

  slider.noUiSlider.on("set", handleSliderDraggingDone);
}

getPageData();

function calculateStats(start, end) {
  let tempRounds = ROUNDS.slice(start, end + 1);
  console.log(tempRounds);

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

  AVG_ROUND.textContent = avgRound.average;
  AVG_ROUND.parentElement.parentElement.querySelector(
    ".num-rounds"
  ).textContent = avgRound.numRounds;

  FIR.textContent = avgFir.average;
  FIR.parentElement.parentElement.querySelector(".num-rounds").textContent =
    avgFir.numRounds;

  GIR.textContent = avgGir.average;
  GIR.parentElement.parentElement.querySelector(".num-rounds").textContent =
    avgGir.numRounds;

  PUTTS.textContent = avgPutts.average;
  PUTTS.parentElement.parentElement.querySelector(".num-rounds").textContent =
    avgPutts.numRounds;

  console.log(avgFir, fir, gir, putts);
}

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

function handleSliderDraggingDone(
  values,
  handle,
  unencoded,
  tap,
  positions,
  noUiSlider
) {
  let [start, end] = unencoded;
  calculateStats(start - 1, end - 1);
}

function createLineChart(ctx) {
  return new chartJs.Chart(ctx, {
    type: "line",
    data: {
      labels: LINE_GRAPH_DATA.dates,
      datasets: [
        {
          id: "handicap",
          label: "Handicap over time",
          data: LINE_GRAPH_DATA.handicaps,
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
