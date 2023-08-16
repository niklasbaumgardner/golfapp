import * as chartJs from "https://cdn.jsdelivr.net/npm/chart.js@3.6.2/+esm";
// import * as chartjsPluginDatalabels from "https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.2.0/+esm";

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
