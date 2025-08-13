// Convert project day numbers to actual dates
const projectStartDate = new Date(2024, 5, 10);

function dayToDate(dayNumber) {
  const date = new Date(projectStartDate);
  date.setDate(date.getDate() + dayNumber);
  return date;
}

// Day style function for the scales
function dayStyle(date) {
  const day = date.getDay();
  if (day === 0 || day === 6) {
    return "weekend";
  }
  return "";
}

export const tasks = [
  {
    id: 1,
    open: true,
    start: new Date(2023, 11, 6),
    duration: 8,
    text: "Svelte Gantt Widget",
    progress: 60,
    type: "summary"
  },
  {
    id: 2,
    parent: 1,
    start: new Date(2023, 11, 6),
    duration: 4,
    text: "Lib-Gantt",
    progress: 80
  },
  {
    id: 3,
    parent: 1,
    start: new Date(2023, 11, 11),
    duration: 4,
    text: "UI Layer",
    progress: 30
  },
  {
    id: 4,
    open: true,
    start: new Date(2023, 11, 15),
    duration: 10,
    text: "Documentation",
    progress: 10,
    type: "summary"
  },
  {
    id: 5,
    parent: 4,
    start: new Date(2023, 11, 15),
    duration: 2,
    text: "Overview",
    progress: 30
  },
  {
    id: 6,
    parent: 4,
    start: new Date(2023, 11, 18),
    duration: 7,
    text: "API reference",
    progress: 0
  }
];

export const columns = [
  { id: "text", header: "Task name", flexgrow: 2 },
  {
    id: "start",
    header: "Start date",
    flexgrow: 1,
    align: "center",
  },
  {
    id: "duration",
    header: "Duration",
    align: "center",
    flexgrow: 1,
  },
  {
    id: "add-task",
    header: "",
    width: 50,
    align: "center",
  },
];

export const links = [
  { id: 1, source: 2, target: 3, type: "e2s" }, // Lib-Gantt → UI Layer
  { id: 2, source: 3, target: 4, type: "e2s" }, // UI Layer → Documentation
  { id: 3, source: 5, target: 6, type: "e2s" }, // Overview → API reference
];

export const scales = [
  { unit: "month", step: 1, format: "MMMM yyy" },
  { unit: "day", step: 1, format: "d", css: dayStyle },
];

// Main data export function
export function getData() {
  return {
    tasks,
    links,
    scales,
    columns
  };
}