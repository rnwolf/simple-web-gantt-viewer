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
    progress: 80,
    type: "urgent",
    resources: "R001, R002",
    optimistic: 4,
    pessimistic: 6
   },
 {
    id: 3,
    parent: 1,
    start: new Date(2023, 11, 11),
    duration: 4,
    text: "UI Layer",
    progress: 30,
    resources: "R001, R002",
    optimistic: 4,
    pessimistic: 6
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
    progress: 30,
    resources: "R001, R002",
    optimistic: 4,
    pessimistic: 6
  },
  {
    id: 6,
    parent: 4,
    start: new Date(2023, 11, 18),
    duration: 7,
    text: "API reference",
    progress: 0,
    resources: "R001, R002"
  }
];

export const columns = [
    { id: "id",
      header: "Task ID",
      flexgrow: 1 ,
      align: "center",
    },
    { id: "text",
      header: "Task name",
      flexgrow: 2 },
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
      id: "resources",
      header: "Resources",
      flexgrow: 1,
      align: "center",
    },
    {
      id: "type",
      header: "TaskType",
      flexgrow: 1,
      align: "left",
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

export const taskTypes = [
    { id: "task", label: "Task" },
    { id: "summary", label: "Summary task" },
    { id: "milestone", label: "Milestone" },
    { id: "urgent", label: "Urgent" },
    { id: "narrow", label: "Narrow" },
    { id: "progress", label: "Progress" },
]

export const markers = [
		{
			start: new Date(2023, 11, 4),
			text: "Start Project",
		},
		{
			start: new Date(2023, 11, 12),
			text: "Today",
			css: "myMiddleClass",
		},
		{
			start: new Date(2023, 11, 29),
			text: "End Project",
			css: "myEndClass",
		},
	];


// API simulation using localStorage for persistence
const STORAGE_KEY = 'gantt_project_data';

// Save data to localStorage (simulates API call)
export function saveProjectData(projectData) {
  try {
    // Convert dates to ISO strings for storage
    const storageData = {
      ...projectData,
      tasks: projectData.tasks.map(task => ({
        ...task,
        start: task.start instanceof Date ? task.start.toISOString() : task.start,
        end: task.end instanceof Date ? task.end.toISOString() : task.end
      })),
      markers: projectData.markers?.map(marker => ({
        ...marker,
        start: marker.start instanceof Date ? marker.start.toISOString() : marker.start
      })) || markers,
      lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    console.log('✅ Project data saved to localStorage');
    return Promise.resolve({ success: true, timestamp: storageData.lastSaved });
  } catch (error) {
    console.error('❌ Failed to save project data:', error);
    return Promise.reject(error);
  }
}

// Load data from localStorage (simulates API call)
function loadProjectData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Convert date strings back to Date objects
      return {
        ...data,
        tasks: data.tasks.map(task => ({
          ...task,
          start: new Date(task.start),
          end: task.end ? new Date(task.end) : undefined
        })),
        markers: data.markers?.map(marker => ({
          ...marker,
          start: new Date(marker.start)
        })) || markers
      };
    }
  } catch (error) {
    console.warn('⚠️ Failed to load saved data, using defaults:', error);
  }
  return null;
}

// API simulation: Update a specific task
export async function updateTaskAPI(taskId, updates, currentAppData = null) {
  try {
    console.log(`🔄 Updating task ${taskId} via API:`, updates);
    
    // Load current data - prefer app data over localStorage to handle new tasks
    let currentData;
    if (currentAppData && currentAppData.tasks) {
      // Use the current app state passed from the caller
      currentData = JSON.parse(JSON.stringify(currentAppData)); // Deep copy
      console.log(`📱 Using current app data (${currentData.tasks.length} tasks)`);
    } else {
      // Fallback to localStorage
      currentData = loadProjectData() || getDefaultData();
      console.log(`💾 Using localStorage data (${currentData.tasks.length} tasks)`);
    }
    
    // Find and update the task
    const taskIndex = currentData.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      // Update existing task
      currentData.tasks[taskIndex] = {
        ...currentData.tasks[taskIndex],
        ...updates,
        // Ensure dates are Date objects
        start: updates.start ? new Date(updates.start) : currentData.tasks[taskIndex].start,
        end: updates.end ? new Date(updates.end) : currentData.tasks[taskIndex].end
      };
      
      console.log(`✅ Updated existing task ${taskId}`);
    } else {
      // Task not found - add it as a new task (this handles newly created tasks)
      const newTask = {
        id: taskId,
        ...updates,
        // Ensure dates are Date objects
        start: updates.start ? new Date(updates.start) : new Date(),
        end: updates.end ? new Date(updates.end) : undefined
      };
      
      currentData.tasks.push(newTask);
      console.log(`➕ Added new task ${taskId} to data`);
    }
      
    // Save updated data to localStorage
    await saveProjectData(currentData);
    
    const updatedTask = currentData.tasks.find(t => t.id === taskId);
    console.log(`✅ Task ${taskId} synchronized to localStorage`);
    return { success: true, task: updatedTask };
    
  } catch (error) {
    console.error(`❌ Failed to update task ${taskId}:`, error);
    throw error;
  }
}

// Clear saved data (for testing/reset)
export function clearSavedData() {
  localStorage.removeItem(STORAGE_KEY);
  console.log('🗑️ Cleared saved project data');
}

// Get default data structure
function getDefaultData() {
  return {
    tasks,
    links,
    scales,
    columns,
    taskTypes,
    markers,
  };
}

// Main data export function - now loads from localStorage if available
export function getData() {
  const savedData = loadProjectData();
  if (savedData) {
    console.log('📂 Loaded project data from localStorage (last saved:', savedData.lastSaved, ')');
    return savedData;
  } else {
    console.log('🆕 Using default project data');
    return getDefaultData();
  }
}
