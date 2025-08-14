// Day style function for the scales
function dayStyle(date) {
  const day = date.getDay();
  if (day === 0 || day === 6) {
    return "weekend";
  }
  return "";
}

export const resourceTasks = [
  {
    id: 10,
    resourceId: "R001",
    text: "Frontend Developer",
    type: "summary",
    open: true,
    start: new Date(2023, 11, 6),
    duration: 15,
    progress: 70,
    capacity: 100 // 100% capacity (8 hours/day)
  },
  {
    id: 11,
    parent: 10,
    resourceId: "R001",
    text: "Lib-Gantt Development",
    start: new Date(2023, 11, 6),
    duration: 4,
    progress: 80,
    effort: 80 // 80% of daily capacity
  },
  {
    id: 12,
    parent: 10,
    resourceId: "R001",
    text: "UI Layer Design",
    start: new Date(2023, 11, 11),
    duration: 4,
    progress: 30,
    effort: 100 // 100% of daily capacity
  },
  {
    id: 13,
    parent: 10,
    resourceId: "R001",
    text: "Code Review Tasks",
    start: new Date(2023, 11, 8),
    duration: 8,
    progress: 50,
    effort: 30 // 30% of daily capacity - overlaps with other work!
  },

  {
    id: 20,
    resourceId: "R002",
    text: "Backend Developer",
    type: "summary",
    open: true,
    start: new Date(2023, 11, 10),
    duration: 12,
    progress: 60,
    capacity: 100
  },
  {
    id: 21,
    parent: 20,
    resourceId: "R002",
    text: "API Development",
    start: new Date(2023, 11, 10),
    duration: 6,
    progress: 70,
    effort: 90
  },
  {
    id: 22,
    parent: 20,
    resourceId: "R002",
    text: "Database Integration",
    start: new Date(2023, 11, 16),
    duration: 4,
    progress: 40,
    effort: 85
  },
  {
    id: 23,
    parent: 20,
    resourceId: "R002",
    text: "Performance Testing",
    start: new Date(2023, 11, 14),
    duration: 6,
    progress: 20,
    effort: 40 // Overlaps - potential over-capacity
  },

  {
    id: 30,
    resourceId: "R003",
    text: "Technical Writer",
    type: "summary",
    open: true,
    start: new Date(2023, 11, 15),
    duration: 10,
    progress: 25,
    capacity: 100
  },
  {
    id: 31,
    parent: 30,
    resourceId: "R003",
    text: "User Documentation",
    start: new Date(2023, 11, 15),
    duration: 2,
    progress: 30,
    effort: 100
  },
  {
    id: 32,
    parent: 30,
    resourceId: "R003",
    text: "API Documentation",
    start: new Date(2023, 11, 18),
    duration: 7,
    progress: 0,
    effort: 70
  },
  {
    id: 33,
    parent: 30,
    resourceId: "R003",
    text: "Training Materials",
    start: new Date(2023, 11, 20),
    duration: 5,
    progress: 0,
    effort: 60 // Overlaps with API docs - over-capacity!
  },

  {
    id: 40,
    resourceId: "R004",
    text: "Project Manager",
    type: "summary",
    open: true,
    start: new Date(2023, 11, 6),
    duration: 20,
    progress: 80,
    capacity: 100
  },
  {
    id: 41,
    parent: 40,
    resourceId: "R004",
    text: "Sprint Planning",
    start: new Date(2023, 11, 6),
    duration: 20,
    progress: 90,
    effort: 20 // Ongoing throughout project
  },
  {
    id: 42,
    parent: 40,
    resourceId: "R004",
    text: "Stakeholder Meetings",
    start: new Date(2023, 11, 8),
    duration: 15,
    progress: 75,
    effort: 25
  },
  {
    id: 43,
    parent: 40,
    resourceId: "R004",
    text: "Risk Management",
    start: new Date(2023, 11, 12),
    duration: 10,
    progress: 60,
    effort: 30
  }
];

export const resourceLinks = []; // No dependencies in resource view

export const resourceScales = [
  { unit: "month", step: 1, format: "MMMM yyy" },
  { unit: "day", step: 1, format: "d", css: dayStyle },
];

export const resourceColumns = [
  { id: "text", header: "Resource / Task", flexgrow: 3 },
  { id: "resourceId", header: "Resource ID", width: 100, align: "center" },
  { id: "effort", header: "Effort %", width: 80, align: "center" },
  { id: "start", header: "Start", flexgrow: 1, align: "center" },
  { id: "duration", header: "Days", width: 60, align: "center" },
  { id: "progress", header: "Done %", width: 80, align: "center" }
];

// Main resource data export function
export function getResourceData() {
  return {
    tasks: resourceTasks,
    links: resourceLinks,
    scales: resourceScales,
    columns: resourceColumns
  };
}

// Function to calculate resource over-capacity
export function calculateOverCapacity(tasks) {
  const resources = tasks.filter(t => t.type === 'summary');
  const overCapacityDays = [];

  resources.forEach(resource => {
    const assignments = tasks.filter(t => t.parent === resource.id);
    console.log(`${resource.text} assignments:`, assignments);

    // Check each day for over-capacity
    for (let day = 0; day < 30; day++) {
      const currentDate = new Date(2023, 11, 6 + day);
      let totalEffort = 0;

      assignments.forEach(task => {
        const taskStart = task.start;
        const taskEnd = new Date(taskStart.getTime() + task.duration * 24 * 60 * 60 * 1000);

        if (currentDate >= taskStart && currentDate <= taskEnd) {
          totalEffort += task.effort || 0;
        }
      });

      if (totalEffort > 100) {
        overCapacityDays.push({
          resource: resource.text,
          date: currentDate,
          capacity: totalEffort
        });
      }
    }
  });

  return overCapacityDays;
}