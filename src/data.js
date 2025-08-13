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
    start: new Date(2023, 11, 12),
    duration: 8,
    text: "Documentation",
    progress: 10,
    type: "summary"
  },
  {
    id: 5,
    parent: 4,
    start: new Date(2023, 11, 10),
    duration: 1,
    text: "Overview",
    progress: 30
  },
  {
    id: 6,
    parent: 4,
    start: new Date(2023, 12, 11),
    duration: 8,
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
  { id: 1, source: 3, target: 4, type: "e2s" },
  { id: 2, source: 1, target: 2, type: "e2s" },
  { id: 21, source: 8, target: 1, type: "s2s" },
  { id: 22, source: 1, target: 6, type: "s2s" },
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