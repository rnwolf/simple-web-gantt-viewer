<script>

import {
  isTemporaryId,
  generateUniqueId,
  createIdMapping,
  applyIdMapping,
  getTemporaryIdSummary,
  validateProjectForImport
} from './utils/idValidation.js';

import {
  flattenProjectData,
  cleanupTemporaryIds,
  cleanupLinksIds
} from './flattenProjectData.js';

  import { getData, updateTaskAPI, saveProjectData, clearSavedData } from "./data.js";
  import { Gantt, Willow, Tooltip, ContextMenu, Editor, defaultEditorItems, Fullscreen   } from "wx-svelte-gantt";
  import { Toolbar } from "wx-svelte-toolbar";
  import { DatePicker, Field, Locale, Switch } from "wx-svelte-core";
  import CustomTaskForm from "./CustomTaskForm.svelte";

  import "./gantt-styles.css";
  import MyTooltipContent from "./MyTooltipContent.svelte";

  // Reactive data state
  let currentData = $state(getData());
  const initialDates = initializeDatesFromMarkers(currentData.markers);
  let api = $state();


let start = $state(initialDates.start),
    end = $state(initialDates.end),
    today = $state(initialDates.today),
		autoScale = $state(false);

  console.log("Latest start date:", start);

  // Add logging for task state changes
  let task = $state(null);
  console.log("Task state changed:", task);

// More robust initialization with fallbacks
function initializeDatesFromMarkers(markers) {
  const startMarker = markers.find(m => m.text === "Start Project");
  const endMarker = markers.find(m => m.text === "End Project");
  const todayMarker = markers.find(m => m.text === "Today");

  return {
    start: startMarker?.start || new Date(2023, 11, 1),
    end: endMarker?.start || new Date(2023, 11, 29),
    today: todayMarker?.start || new Date(2023, 11, 12)
  };
}

// Initialize function to set up the custom editor intercept
// Fixed init function that properly handles temporary IDs
function init(api) {
  console.log("=== GANTT INIT - Setting up custom editor ===");
  console.log("API object received:", !!api);

  try {
    // Intercept the default editor and use our custom form instead
    api.intercept("show-editor", data => {
      console.log("show-editor intercepted with data:", data);

      // Expose the API globally for debugging
      window.ganttApi = api;
      console.log("Gantt API exposed globally as window.ganttApi");

      try {
        // Try multiple methods to get the task data
        let foundTask = null;

        // Method 1: Try using the store (if available)
        try {
          const store = api.getState().tasks;
          if (store && store.byId) {
            foundTask = store.byId(data.id);
            console.log("Found task via store.byId:", !!foundTask);
          }
        } catch (storeError) {
          console.log("Store method failed:", storeError.message);
        }

        // Method 2: Try using api.getTask method (if available)
        if (!foundTask && api.getTask) {
          try {
            foundTask = api.getTask(data.id);
            console.log("Found task via api.getTask:", !!foundTask);
          } catch (getTaskError) {
            console.log("getTask method failed:", getTaskError.message);
          }
        }

        // Method 3: Search through serialized tasks
        if (!foundTask) {
          try {
            const allTasks = api.serialize();
            foundTask = allTasks.find(t => t.id === data.id);
            console.log("Found task via serialize search:", !!foundTask);
          } catch (serializeError) {
            console.log("Serialize search failed:", serializeError.message);
          }
        }

        // Method 4: Search through currentData (fallback)
        if (!foundTask && currentData.tasks) {
          foundTask = currentData.tasks.find(t => t.id === data.id);
          console.log("Found task via currentData search:", !!foundTask);
        }

        if (foundTask) {
          // Set the task for editing
          task = foundTask;
          console.log("Task set for editing:", {
            id: foundTask.id,
            text: foundTask.text,
            type: foundTask.type,
            isTemporary: typeof foundTask.id === 'string' && foundTask.id.startsWith('temp://')
          });

          return false; // Prevent default editor from opening
        } else {
          console.error("Could not find task with ID:", data.id);
          console.log("Available task IDs:", currentData.tasks?.map(t => t.id) || 'No tasks in currentData');

          // Show error to user
          alert(`Error: Could not find task with ID: ${data.id}\n\nThis might be a temporary ID issue. Try refreshing the page.`);

          return true; // Allow default editor as fallback
        }

      } catch (error) {
        console.error("Error in show-editor intercept:", error);
        console.error("Error stack:", error.stack);

        // Show error to user
        alert(`Error opening task editor: ${error.message}`);

        return true; // Allow default editor if there's an error
      }
    });

    console.log("Custom editor intercept set up successfully");

  } catch (error) {
    console.error("Error setting up custom editor:", error);
    console.error("Error stack:", error.stack);
  }
}

// Function to create a fresh project (clears temporary IDs)
function createFreshProject() {
  const confirmed = confirm(
    "Create a fresh project?\n\n" +
    "This will:\n" +
    "• Clear all current tasks and data\n" +
    "• Remove any temporary IDs\n" +
    "• Start with a clean project\n\n" +
    "Continue?"
  );

  if (!confirmed) return;

  try {
    // Create completely fresh data using the same structure as your original data
    const freshData = {
      tasks: [
        {
          id: 1,
          open: true,
          start: new Date(2023, 11, 6),
          duration: 8,
          text: "New Gantt Project",
          progress: 0,
          type: "summary"
        },
        {
          id: 2,
          parent: 1,
          start: new Date(2023, 11, 6),
          duration: 4,
          text: "Phase 1",
          progress: 0,
          type: "task"
        },
        {
          id: 3,
          parent: 1,
          start: new Date(2023, 11, 11),
          duration: 4,
          text: "Phase 2",
          progress: 0,
          type: "task"
        }
      ],
      links: [
        { id: 1, source: 2, target: 3, type: "e2s" }
      ],
      scales: currentData.scales || [
        { unit: "month", step: 1, format: "MMMM yyy" },
        { unit: "day", step: 1, format: "d" }
      ],
      columns: currentData.columns || [
        { id: "text", header: "Task name", flexgrow: 2 },
        { id: "start", header: "Start date", flexgrow: 1, align: "center" },
        { id: "duration", header: "Duration", align: "center", flexgrow: 1 }
      ],
      taskTypes: currentData.taskTypes || [
        { id: "task", label: "Task" },
        { id: "summary", label: "Summary task" },
        { id: "milestone", label: "Milestone" }
      ],
      markers: [
        {
          start: new Date(),
          text: "Today",
          css: "myMiddleClass",
        }
      ]
    };

    console.log("Creating fresh project with data:", freshData);

    // Update currentData - this should trigger Gantt to reload
    currentData = freshData;

    console.log("Fresh project data applied successfully");

    alert("Fresh project created!\n\nAll temporary IDs have been cleared.");

  } catch (error) {
    console.error("Error creating fresh project:", error);
    console.error("Error stack:", error.stack);
    alert(`Error creating fresh project: ${error.message}`);

    // Try to restore previous state if there's an error
    try {
      console.log("Attempting to restore previous state...");
      // Don't change currentData if there was an error
    } catch (restoreError) {
      console.error("Could not restore previous state:", restoreError);
    }
  }
}


// Gantt event handlers to sync changes back to currentData and API
async function handleTaskUpdate(event) {
  console.log("=== TASK UPDATE EVENT ===", event);
  const { id, task: updatedTask } = event;

  try {
    // Find and update the task in currentData
    const taskIndex = currentData.tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
      // Update currentData with the new task properties
      currentData.tasks[taskIndex] = { 
        ...currentData.tasks[taskIndex], 
        ...updatedTask, 
        // Ensure we preserve the ID
        id: id 
      };
      console.log(`✅ Updated task ${id} in currentData:`, updatedTask);
    } else {
      console.warn(`⚠️ Task ${id} not found in currentData.tasks`);
    }

    // Save to "backend" (localStorage simulation)
    try {
      const result = await updateTaskAPI(id, updatedTask, currentData);
      console.log(`🔄 Task ${id} synced to backend:`, result);
    } catch (apiError) {
      console.error(`❌ Failed to sync task ${id} to backend:`, apiError);
      // Optionally show user error notification
    }

  } catch (error) {
    console.error('❌ Error handling task update:', error);
  }
}

async function handleTaskMove(event) {
  console.log("=== TASK MOVE EVENT ===", event);
  const { id, start, duration } = event;

  try {
    // Find and update the task in currentData  
    const taskIndex = currentData.tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
      currentData.tasks[taskIndex] = { 
        ...currentData.tasks[taskIndex], 
        start: new Date(start),
        duration: duration
      };
      console.log(`✅ Moved task ${id} in currentData: start=${start}, duration=${duration}`);
    } else {
      console.warn(`⚠️ Task ${id} not found in currentData.tasks for move`);
    }

    // Save to "backend" (localStorage simulation)
    try {
      const result = await updateTaskAPI(id, { start: new Date(start), duration }, currentData);
      console.log(`🔄 Task move ${id} synced to backend:`, result);
    } catch (apiError) {
      console.error(`❌ Failed to sync task move ${id} to backend:`, apiError);
      // Optionally show user error notification
    }

  } catch (error) {
    console.error('❌ Error handling task move:', error);
  }
}

async function handleTaskResize(event) {
  console.log("=== TASK RESIZE EVENT ===", event);
  const { id, duration, start } = event;

  try {
    // Find and update the task in currentData
    const taskIndex = currentData.tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
      currentData.tasks[taskIndex] = { 
        ...currentData.tasks[taskIndex], 
        duration: duration,
        // Also update start if provided (some resize events might change start)
        ...(start && { start: new Date(start) })
      };
      console.log(`✅ Resized task ${id} in currentData: duration=${duration}`);
    } else {
      console.warn(`⚠️ Task ${id} not found in currentData.tasks for resize`);
    }

    // Save to "backend" (localStorage simulation)
    try {
      const updates = { duration };
      if (start) updates.start = new Date(start);
      const result = await updateTaskAPI(id, updates, currentData);
      console.log(`🔄 Task resize ${id} synced to backend:`, result);
    } catch (apiError) {
      console.error(`❌ Failed to sync task resize ${id} to backend:`, apiError);
      // Optionally show user error notification
    }

  } catch (error) {
    console.error('❌ Error handling task resize:', error);
  }
}

// Handle task updates from the custom form
async function handleTaskUpdateFromForm(data) {
  console.log("=== TASK UPDATE FROM FORM ===", data);
  const { id, task: updatedTask } = data;

  try {
    // Step 1: Update the visual Gantt via the API
    if (api && api.exec) {
      console.log(`🎨 Updating Gantt visual for task ${id}`);
      api.exec("update-task", { id, task: updatedTask });
    }

    // Step 2: Update currentData 
    const taskIndex = currentData.tasks.findIndex(t => t.id === id);
    if (taskIndex !== -1) {
      currentData.tasks[taskIndex] = { 
        ...currentData.tasks[taskIndex], 
        ...updatedTask, 
        id: id 
      };
      console.log(`✅ Updated task ${id} in currentData:`, currentData.tasks[taskIndex]);
    } else {
      console.warn(`⚠️ Task ${id} not found in currentData.tasks`);
    }

    // Step 3: Persist to localStorage (simulate backend API)
    try {
      const result = await updateTaskAPI(id, updatedTask, currentData);
      console.log(`🔄 Task ${id} synced to localStorage:`, result);
    } catch (apiError) {
      console.error(`❌ Failed to sync task ${id} to localStorage:`, apiError);
    }

    // Step 4: Update the form task state so it stays in sync
    if (task && task.id === id) {
      task = { ...task, ...updatedTask, id };
      console.log(`📝 Updated form task state for ${id}`);
    }

  } catch (error) {
    console.error('❌ Error handling task update from form:', error);
  }
}

// Handle link updates from the custom form (following SVAR pattern)
function handleLinkUpdate(data) {
  console.log("=== LINK UPDATE ===", data);
  
  // Handle both old format { id, type } and new SVAR format { id, link: { type } }
  const { id } = data;
  const linkUpdate = data.link || { type: data.type };
  
  if (!linkUpdate.type) {
    console.error("Invalid link update data - no type provided:", data);
    return;
  }

  try {
    // Step 1: Update the visual Gantt via the API
    if (api && api.exec) {
      console.log(`🔗 Updating Gantt link ${id} to type ${linkUpdate.type}`);
      api.exec("update-link", { id, link: linkUpdate });
    }

    // Step 2: Update currentData
    const linkIndex = currentData.links.findIndex(l => l.id === id);
    if (linkIndex !== -1) {
      currentData.links[linkIndex] = {
        ...currentData.links[linkIndex],
        ...linkUpdate
      };
      console.log(`✅ Updated link ${id} in currentData:`, currentData.links[linkIndex]);
    } else {
      console.warn(`⚠️ Link ${id} not found in currentData.links`);
    }

    // Step 3: Persist to localStorage
    // Note: We could add a linkAPI function similar to updateTaskAPI if needed
    // For now, the changes will be saved when the project is saved

  } catch (error) {
    console.error('❌ Error handling link update:', error);
  }
}

// Handle link deletion from the custom form
function handleLinkDelete(data) {
  console.log("=== LINK DELETE ===", data);
  const { id } = data;

  try {
    // Step 1: Delete from visual Gantt via the API
    if (api && api.exec) {
      console.log(`🗑️ Deleting Gantt link ${id}`);
      api.exec("delete-link", { id });
    }

    // Step 2: Update currentData
    const linkIndex = currentData.links.findIndex(l => l.id === id);
    if (linkIndex !== -1) {
      currentData.links.splice(linkIndex, 1);
      console.log(`✅ Deleted link ${id} from currentData`);
    } else {
      console.warn(`⚠️ Link ${id} not found in currentData.links`);
    }

    // Step 3: Persist to localStorage
    // Note: Changes will be saved when the project is saved

  } catch (error) {
    console.error('❌ Error handling link delete:', error);
  }
}

// Enhanced form action with comprehensive ID management
async function formAction(ev) {
  console.log("=== FORM ACTION ===", ev);
  const { action, data } = ev;

  switch (action) {
    case "close-form":
      console.log("Closing form");
      task = null;
      break;

    case "update-task":
      console.log("Updating task from form:", data);
      await handleTaskUpdateFromForm(data);
      break;

    case "update-task-id":
      console.log("Updating task ID:", data);
      handleTaskIdUpdate(data);
      break;

    case "batch-cleanup-ids":
      console.log("Batch cleanup temporary IDs");
      handleBatchIdCleanup();
      break;

    case "update-link":
      console.log("Updating link:", data);
      handleLinkUpdate(data);
      break;

    case "delete-link":
      console.log("Deleting link:", data);
      handleLinkDelete(data);
      break;

    default:
      console.log("Executing action through API:", action, data);
      if (api && api.exec) {
        api.exec(action, data);
      } else {
        console.error("API not available for action:", action);
      }
      break;
  }
}

// Enhanced ID update with better error handling
function handleTaskIdUpdate({ oldId, newId, task: updatedTask }) {
  console.log(`=== UPDATING TASK ID: ${oldId} → ${newId} ===`);

  try {
    if (!api) {
      throw new Error("API not available for ID update");
    }

    // Validate new ID
    if (!newId || newId === oldId) {
      console.log("No ID change needed");
      return;
    }

    const store = api.getState();
    const allTasks = store.tasks.list();
    const allLinks = store.links.list();

    // Check if new ID already exists
    const existingTask = allTasks.find(t => t.id === newId && t.id !== oldId);
    if (existingTask) {
      alert(`Task with ID "${newId}" already exists. Please choose a different ID.`);
      return;
    }

    // Validate the new ID format
    if (typeof newId === 'string' && newId.trim() === '') {
      alert("Task ID cannot be empty.");
      return;
    }

    // Begin transaction-like operations
    console.log("Starting ID update transaction...");

    // Step 1: Collect all affected items
    const childTasks = allTasks.filter(t => t.parent === oldId);
    const affectedLinks = allLinks.filter(link =>
      link.source === oldId || link.target === oldId
    );

    console.log(`Found ${childTasks.length} child tasks and ${affectedLinks.length} links to update`);

    // Step 2: Remove old task
    api.exec("delete-task", { id: oldId });

    // Step 3: Add task with new ID
    api.exec("add-task", {
      task: {
        ...updatedTask,
        id: newId
      }
    });

    // Step 4: Update child tasks
    childTasks.forEach(childTask => {
      api.exec("update-task", {
        id: childTask.id,
        task: {
          ...childTask,
          parent: newId
        }
      });
    });

    // Step 5: Update links
    affectedLinks.forEach(link => {
      const updatedLink = { ...link };

      if (link.source === oldId) {
        updatedLink.source = newId;
      }
      if (link.target === oldId) {
        updatedLink.target = newId;
      }

      // Remove old link and add updated one
      api.exec("delete-link", { id: link.id });
      api.exec("add-link", { link: updatedLink });
    });

    // Step 6: Update the form task state
    task = {
      ...updatedTask,
      id: newId
    };

    console.log("✅ ID update transaction completed successfully");

    // Show success message
    setTimeout(() => {
      alert(`Task ID successfully updated from "${oldId}" to "${newId}"`);
    }, 100);

  } catch (error) {
    console.error("❌ Error updating task ID:", error);
    alert(`Error updating task ID: ${error.message}`);

    // Attempt to restore data consistency if possible
    try {
      if (api) {
        // Force refresh from current data
        api.parse(currentData);
      }
    } catch (restoreError) {
      console.error("Failed to restore data after ID update error:", restoreError);
    }
  }
}

// Remove the problematic batch cleanup function and replace with save/load handling
function handleBatchIdCleanup() {
  alert(
    "Direct ID changes are not supported by the SVAR Gantt API.\n\n" +
    "Instead, use these options:\n\n" +
    "1. Save project with ID cleanup (converts temp IDs during export)\n" +
    "2. Load a project file with clean IDs\n" +
    "3. Restart with clean data (creates new project)\n\n" +
    "Would you like to save the current project with cleaned IDs?"
  );

  // Automatically trigger the save with cleanup
  downloadProjectDataWithCleanup();
}

// Enhanced download function with actual ID replacement (not just mapping)
function downloadProjectDataWithCleanup() {
  console.log("downloadProjectData with temp ID cleanup called");

  try {
    // Use currentData.tasks directly (clean structure, no nested data arrays)
    const currentTasks = currentData.tasks;
    console.log("Using currentData.tasks (clean structure):", currentTasks.length, "tasks");

    console.log("api:", api);
    console.log("api.serialize:", api && api.serialize);

    let allTasks;
    allTasks = api.serialize();

    // Make a deep copy so we don't mutate live data
    let allTasksCopy = JSON.parse(JSON.stringify(allTasks));

    // Make a deep copy of links to avoid mutating original data
    let linksCopy = JSON.parse(JSON.stringify(currentData.links));

    console.log("All tasks (flat list):", allTasksCopy);

    // ...after you have allTasks... remove any duplicates in the nested data
    allTasksCopy.forEach(task => {
        delete task.data;
        delete task["$x"];
        delete task["$y"];
        delete task["$w"];
        delete task["$h"];
    });
    console.log("All tasks less nested data elements:", allTasksCopy);


    // Find all temporary task IDs (corrected prefix)
    const tempTasks = allTasksCopy.filter(
      task => typeof task.id === 'string' && task.id.startsWith('temp://')
    );
    console.log("All temp tasks (flat list):", tempTasks);
    
    // Find all temporary link IDs
    const tempLinks = linksCopy.filter(
      link => typeof link.id === 'string' && link.id.startsWith('temp://')
    );
    console.log("All temp links:", tempLinks);

    // Create project data
    let projectData = {
      metadata: {
        projectName: "Simple Gantt Project",
        exportDate: new Date().toISOString(),
        version: "1.0.0",
        cleanedIds: false
      },
      tasks: currentTasks,
      links: linksCopy, // Use deep copy here
      scales: currentData.scales,
      columns: currentData.columns,
      taskTypes: currentData.taskTypes,
      markers: currentData.markers,
    };

    console.log(`Found ${tempTasks.length} temporary task IDs:`, tempTasks.map(t => `${t.id} (${t.text})`));
    console.log(`Found ${tempLinks.length} temporary link IDs:`, tempLinks.map(l => `${l.id} (${l.source}->${l.target})`));

    if (tempTasks.length > 0 || tempLinks.length > 0) {
      console.log(`Found ${tempTasks.length} temporary task IDs and ${tempLinks.length} temporary link IDs, cleaning up...`);

      // Create ID mapping
      const existingNonTempIds = projectData.tasks
        .filter(t => !(typeof t.id === 'string' && t.id.startsWith('temp://')))
        .map(t => t.id);

      const numericIds = existingNonTempIds
        .filter(id => typeof id === 'number' || /^\d+$/.test(id))
        .map(id => parseInt(id))
        .filter(id => !isNaN(id));

      let nextId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;

      const idMapping = new Map();
      tempTasks.forEach(task => {
        idMapping.set(task.id, nextId++);
      });

      console.log("ID mapping for export:", Array.from(idMapping.entries()));

      // ACTUALLY REPLACE the IDs in tasks (not just create mapping)
      // This function recursively processes nested task data
      function replaceIdsInTasksRecursively(tasks, idMapping, depth = 0) {
        const indent = '  '.repeat(depth);
        console.log(`${indent}=== PROCESSING TASKS AT DEPTH ${depth} ===`);

        return tasks.map(task => {
          const updatedTask = { ...task };

          // Replace task ID if it's temporary
          if (idMapping.has(task.id)) {
            const oldId = task.id;
            updatedTask.id = idMapping.get(task.id);
            console.log(`${indent}✅ Replaced task ID: ${oldId} → ${updatedTask.id} (${task.text})`);
          } else {
            console.log(`${indent}⏭️  Keeping task ID: ${task.id} (${task.text})`);
          }

          // Replace parent reference if it's temporary
          if (task.parent && idMapping.has(task.parent)) {
            const oldParent = task.parent;
            updatedTask.parent = idMapping.get(task.parent);
            console.log(`${indent}✅ Replaced parent reference: ${oldParent} → ${updatedTask.parent} for task ${task.text}`);
          }

          // RECURSIVELY process nested data array if it exists
          if (task.data && Array.isArray(task.data) && task.data.length > 0) {
            console.log(`${indent}🔄 Processing ${task.data.length} nested tasks in ${task.text}`);
            updatedTask.data = replaceIdsInTasksRecursively(task.data, idMapping, depth + 1);
          }

          return updatedTask;
        });
      }

      console.log("=== BEFORE TASK ID REPLACEMENT ===");
      console.log("Original top-level tasks:", projectData.tasks.map(t => `${t.id} (${t.text})`));
      console.log("ID mapping:", Array.from(idMapping.entries()));
      console.log("=== STARTING RECURSIVE REPLACEMENT ===");

      projectData.tasks = replaceIdsInTasksRecursively(allTasksCopy, idMapping);

      // ACTUALLY REPLACE IDs in links (not just create mapping)
      if (projectData.links) {
        projectData.links = projectData.links.map(link => {
          const updatedLink = { ...link };


          // if (idMapping.has(link.id)) {
          //   updatedLink.id = idMapping.get(link.id);
          //   console.log(`Replaced link id: ${link.id} → ${updatedLink.id}`);
          // }

          if (idMapping.has(link.source)) {
            updatedLink.source = idMapping.get(link.source);
            console.log(`Replaced link source: ${link.source} → ${updatedLink.source}`);
          }

          if (idMapping.has(link.target)) {
            updatedLink.target = idMapping.get(link.target);
            console.log(`Replaced link target: ${link.target} → ${updatedLink.target}`);
          }

          return updatedLink;
        });
      }

      // Clean up temporary link IDs - assign sequential integer IDs starting from 1
      if (projectData.links) {
        console.log("=== CLEANING UP LINK IDS ===");
        console.log("Links before cleanup:", projectData.links.map(l => `${l.id} (${l.source}->${l.target})`));
        
        projectData.links = projectData.links.map((link, idx) => {
          const oldId = link.id;
          const newId = idx + 1;
          
          if (typeof oldId === 'string' && oldId.startsWith('temp://')) {
            console.log(`✅ Replaced temp link ID: ${oldId} → ${newId}`);
          } else {
            console.log(`📝 Reassigned link ID: ${oldId} → ${newId}`);
          }
          
          return { ...link, id: newId };
        });
        
        console.log("Links after cleanup:", projectData.links.map(l => `${l.id} (${l.source}->${l.target})`));
        console.log("=== END LINK ID CLEANUP ===");
      }

      projectData.metadata.cleanedIds = true;
      // DO NOT store the mapping in the exported file - 3rd party systems don't need it

      // Show mapping details
      let mappingMessage = `Cleaned ${tempTasks.length} temporary task IDs and ${tempLinks.length} temporary link IDs:\n\n`;
      
      if (tempTasks.length > 0) {
        mappingMessage += "Task ID changes:\n";
        for (const [oldId, newId] of idMapping.entries()) {
          const taskName = tempTasks.find(t => t.id === oldId)?.text || 'Unknown';
          mappingMessage += `• ${taskName}: ${oldId} → ${newId}\n`;
        }
      }
      
      if (tempLinks.length > 0) {
        mappingMessage += `\nLink ID changes:\n`;
        tempLinks.forEach((link, idx) => {
          mappingMessage += `• Link ${link.source}→${link.target}: ${link.id} → ${idx + 1}\n`;
        });
      }
      
      console.log("ID replacement completed:", mappingMessage);

      // Verify that no temporary IDs remain (simple check for flat structure)
      const remainingTempIds = projectData.tasks.filter(task =>
        typeof task.id === 'string' && task.id.startsWith('temp://')
      );

      console.log("=== VERIFICATION AFTER ID REPLACEMENT ===");
      console.log("Original temp tasks:", tempTasks.map(t => `${t.id} (${t.text})`));
      console.log("Updated task IDs:", projectData.tasks.map(t => `${t.id} (${t.text})`));
      console.log("Remaining temp IDs:", remainingTempIds.map(t => t.id));
      console.log("=== END VERIFICATION ===");

      if (remainingTempIds.length > 0) {
        console.error("ERROR: Temporary IDs still remain after cleanup:", remainingTempIds.map(t => t.id));
        throw new Error(`Failed to clean all temporary IDs. ${remainingTempIds.length} remain.`);
      } else {
        console.log("✅ All temporary IDs successfully replaced");
      }
    }

    // Create and download file
    const jsonString = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;

    const hasCleanedIds = projectData.metadata.cleanedIds;
    link.download = hasCleanedIds
      ? `gantt-project-cleaned-${new Date().toISOString().split('T')[0]}.json`
      : `gantt-project-${new Date().toISOString().split('T')[0]}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const successMessage = hasCleanedIds
      ? `Project saved with ${tempTasks.length} temporary IDs converted to permanent IDs!\n\nThe saved file contains clean numeric IDs - no temporary IDs remain.\n\nSafe for 3rd party systems to process.`
      : 'Project saved successfully!';

    alert(successMessage);

    // Convert date strings back to Date objects
    const processedData = processLoadedData(projectData);

    // Update the current data - this will cause Gantt to reloaded with updated ids
    currentData = processedData;

  } catch (error) {
    console.error('Error downloading project data:', error);
    alert(`Error saving project data: ${error.message}`);
  }
}



// Helper function to update a specific marker in currentData
function updateMarkerByText(markerText, newDate) {
  const markerIndex = currentData.markers.findIndex(m => m.text === markerText);
  if (markerIndex !== -1) {
    currentData.markers[markerIndex] = {
      ...currentData.markers[markerIndex],
      start: newDate
    };
  }
}

// DatePicker change handlers
function handleStartChange({value}) {
  console.log("Start date changed:", value);
  start = value;
  updateMarkerByText("Start Project", value);
}

function handleEndChange({value}) {
  console.log("End date changed:", value);
  end = value;
  updateMarkerByText("End Project", value);
}

function handleTodayChange({value}) {
  console.log("Today date changed:", value);
  today = value;
  updateMarkerByText("Today", value);
}


  // Hidden file input reference
  let fileInput;


// Enhanced download with better temporary ID handling
function downloadProjectData() {
  console.log("downloadProjectData function called");

  try {
    // Get current data
    let currentTasks;
    if (api && api.serialize) {
      currentTasks = api.serialize();
    } else {
      currentTasks = currentData.tasks;
    }

    // Create project data
    let projectData = {
      metadata: {
        projectName: "Simple Gantt Project",
        exportDate: new Date().toISOString(),
        version: "1.0.0"
      },
      tasks: currentTasks,
      links: currentData.links,
      scales: currentData.scales,
      columns: currentData.columns,
      taskTypes: currentData.taskTypes,
      markers: currentData.markers,
    };

    // Check for temporary IDs
    const tempSummary = getTemporaryIdSummary(projectData);

    if (tempSummary.hasTemporaryIds) {
      const options = [
        "Export with temporary IDs (may cause import issues)",
        "Convert temporary IDs to sequential numbers",
        "Cancel export"
      ];

      const choice = prompt(
        `Warning: Found ${tempSummary.count} temporary task IDs.\n\n` +
        `Choose an option:\n` +
        `1 - ${options[0]}\n` +
        `2 - ${options[1]}\n` +
        `3 - ${options[2]}\n\n` +
        `Enter choice (1, 2, or 3):`,
        "2"
      );

      switch (choice) {
        case "1":
          // Export as-is
          break;
        case "2":
          // Clean up IDs
          const tempIds = tempSummary.temporaryTasks.map(t => t.id);
          const existingIds = projectData.tasks.map(t => t.id);
          const idMapping = createIdMapping(tempIds, existingIds);
          projectData = applyIdMapping(projectData, idMapping);

          // Show mapping
          let mappingMessage = "ID conversion completed:\n\n";
          for (const [oldId, newId] of idMapping.entries()) {
            mappingMessage += `${oldId} → ${newId}\n`;
          }
          alert(mappingMessage);
          break;
        case "3":
        default:
          console.log("Export cancelled by user");
          return;
      }
    }

    // Create and download file
    const jsonString = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;

    const hasCleanedIds = tempSummary.hasTemporaryIds &&
      !getTemporaryIdSummary(projectData).hasTemporaryIds;

    link.download = hasCleanedIds
      ? `gantt-project-cleaned-${new Date().toISOString().split('T')[0]}.json`
      : `gantt-project-${new Date().toISOString().split('T')[0]}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log('Project data downloaded successfully');
    alert(`Project saved successfully!${hasCleanedIds ? ' (with cleaned IDs)' : ''}`);

  } catch (error) {
    console.error('Error downloading project data:', error);
    alert(`Error saving project data: ${error.message}`);
  }
}


  // Function to trigger file input
  function triggerFileLoad() {
    fileInput.click();
  }

// Enhanced load function with better temporary ID handling
function loadProjectData(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.name.endsWith('.json')) {
    alert('Please select a valid JSON file.');
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const jsonData = JSON.parse(e.target.result);

      // Enhanced validation
      if (!validateProjectForImport(jsonData)) {
        return; // Validation already shows error messages
      }

      // Check for temporary IDs in the imported data
      const tempTasks = jsonData.tasks.filter(task =>
        typeof task.id === 'string' && task.id.startsWith('temp://')
      );

      if (tempTasks.length > 0) {
        const choice = confirm(
          `Warning: This file contains ${tempTasks.length} temporary task IDs.\n\n` +
          `Temporary IDs may cause issues. Options:\n\n` +
          `OK - Load anyway (not recommended)\n` +
          `Cancel - Don't load this file\n\n` +
          `Recommendation: Use a file exported with "Save project" which automatically cleans IDs.`
        );

        if (!choice) {
          console.log("Load cancelled by user due to temporary IDs");
          return;
        }
      }

      // Convert date strings back to Date objects
      const processedData = processLoadedData(jsonData);

      // Update the current data - this will cause Gantt to reload
      currentData = processedData;

      const message = jsonData.metadata?.cleanedIds
        ? `Project "${jsonData.metadata?.projectName || 'Unnamed Project'}" loaded successfully!\n\nThis project has cleaned IDs (no temporary IDs).`
        : `Project "${jsonData.metadata?.projectName || 'Unnamed Project'}" loaded successfully!`;

      console.log('Project loaded:', processedData);
      alert(message);

    } catch (error) {
      console.error('Error loading project data:', error);
      alert('Error loading project file. Please ensure the file is valid JSON.');
    }
  };

  reader.readAsText(file);
  event.target.value = '';
}




// Enhanced project validation with detailed feedback
function validateProjectData(data) {
  const validation = validateProjectForImport(data);

  if (!validation.isValid) {
    console.error("❌ Project validation failed:", validation.errors);
    alert(`Project validation failed:\n\n${validation.errors.join('\n')}`);
    return false;
  }

  // Show warnings if any
  if (validation.warnings.length > 0) {
    console.warn("⚠️ Project validation warnings:", validation.warnings);
    const proceedWithWarnings = confirm(
      `Project loaded with warnings:\n\n${validation.warnings.join('\n')}\n\nProceed anyway?`
    );
    if (!proceedWithWarnings) {
      return false;
    }
  }

  return true;
}

  // Function to process loaded data and convert date strings to Date objects
  function processLoadedData(jsonData) {
    const processedTasks = jsonData.tasks.map(task => ({
      ...task,
      start: new Date(task.start),
      end: task.end ? new Date(task.end) : undefined
    }));

    const processedLinks = jsonData.links?.map(link => ({
      ...link
    })) || [];

    // Process markers if they exist
    const processedMarkers = jsonData.markers?.map(marker => ({
      ...marker,
      start: new Date(marker.start)
    })) || markers;

    return {
      tasks: processedTasks,
      links: processedLinks,
      scales: jsonData.scales || currentData.scales,
      columns: jsonData.columns || currentData.columns,
      taskTypes: jsonData.taskTypes || currentData.taskTypes,
      markers: processedMarkers
    };
  }

// Test function to create a task with temporary ID for testing
function createTestTaskWithTempId() {
  try {
    if (!api) {
      alert("Gantt API not available");
      return;
    }

    const tempId = `temp://${Date.now()}`;
    const testTask = {
      id: tempId,
      text: "Test Task with Temp ID",
      start: new Date(),
      duration: 3,
      type: "task",
      progress: 0
    };

    console.log("Creating test task with temporary ID:", tempId);

    // Add the task using the API
    api.exec("add-task", { task: testTask });

    alert(`Created test task with temporary ID: ${tempId}\n\nNow you can test the cleanup function!`);

  } catch (error) {
    console.error("Error creating test task:", error);
    alert(`Error creating test task: ${error.message}`);
  }
}


// Debug function to clear localStorage and reload
function resetToDefaults() {
  const confirmed = confirm(
    "Reset to default data?\n\n" +
    "This will:\n" +
    "• Clear all saved data from localStorage\n" +
    "• Reload with original default tasks\n" +
    "• Lose any current changes\n\n" +
    "Continue?"
  );
  
  if (confirmed) {
    clearSavedData();
    // Force reload of data from defaults
    currentData = getData();
    alert("✅ Reset to default data complete!\n\nAll localStorage data cleared.");
  }
}

// Toolbar items
const items = [
  {
    id: "save-project",
    comp: "button",
    icon: "wxi-download",
    text: "Save project",
    type: "primary",
    handler: downloadProjectDataWithCleanup,
  },
  {
    id: "load-project",
    comp: "button",
    icon: "wxi-upload",
    text: "Load project",
    type: "primary",
    handler: triggerFileLoad,
  },
  {
    id: "fresh-project",
    comp: "button",
    icon: "wxi-file",
    text: "New project",
    type: "secondary",
    handler: createFreshProject,
  },
  {
    id: "reset-data",
    comp: "button",
    icon: "wxi-delete",
    text: "Reset to defaults",
    type: "secondary",
    handler: resetToDefaults,
  },
  {
    id: "cleanup-ids",
    comp: "button",
    icon: "wxi-refresh",
    text: "About temp IDs",
    type: "secondary",
    handler: handleBatchIdCleanup,
  },
];

// Debug function that works with Svelte 5 $state - NO console.log of reactive objects
function debugGanttAPI() {
  console.log("=== GANTT API DEBUG ===");
  console.log("API exists:", !!api);
  console.log("API type:", typeof api);

  if (api) {
    try {
      const apiMethods = Object.getOwnPropertyNames(api);
      console.log("API methods:", apiMethods);
    } catch (e) {
      console.log("Could not get API methods:", e.message);
    }

    try {
      const serialized = api.serialize();
      console.log("Serialized data type:", typeof serialized);
      console.log("Is array?", Array.isArray(serialized));

      if (serialized && typeof serialized === 'object') {
        console.log("Serialized keys:", Object.keys(serialized));

        // If it's an array, show first few items
        if (Array.isArray(serialized)) {
          console.log("First task structure:", serialized[0] ? Object.keys(serialized[0]) : "No tasks");
          console.log("Task count:", serialized.length);

          // Show some sample task data without logging the whole object
          if (serialized[0]) {
            console.log("First task ID:", serialized[0].id);
            console.log("First task text:", serialized[0].text);
            console.log("First task type:", serialized[0].type);
          }
        } else {
          // Not an array, might be an object with tasks property
          console.log("Serialized structure keys:", Object.keys(serialized));
          if (serialized.tasks) {
            console.log("Tasks array length:", serialized.tasks.length);
          }
        }
      }
    } catch (e) {
      console.error("Serialize error:", e.message);
    }

    try {
      const state = api.getState();
      console.log("State exists:", !!state);
      if (state) {
        console.log("State type:", typeof state);
        try {
          const stateKeys = Object.keys(state);
          console.log("State keys:", stateKeys);

          // Try to access tasks from state
          if (state.tasks) {
            console.log("State.tasks exists:", !!state.tasks);
            console.log("State.tasks type:", typeof state.tasks);
            try {
              const taskMethods = Object.getOwnPropertyNames(state.tasks);
              console.log("State.tasks methods:", taskMethods);
            } catch (methodError) {
              console.log("Could not get state.tasks methods:", methodError.message);
            }
          }
        } catch (stateError) {
          console.log("Error accessing state properties:", stateError.message);
        }
      }
    } catch (e) {
      console.error("GetState error:", e.message);
    }
  } else {
    console.log("API is not available");
  }

  // Safely access currentData without snapshot to avoid function cloning issues
  console.log("Current data structure:");
  console.log("- Tasks count:", currentData.tasks?.length || 0);
  console.log("- Links count:", currentData.links?.length || 0);
  console.log("- Has markers:", !!currentData.markers);
  console.log("- Has scales:", !!currentData.scales);

  // Show some task info without logging the whole objects
  if (currentData.tasks && currentData.tasks.length > 0) {
    try {
      const taskIds = currentData.tasks.slice(0, 3).map(t => t.id);
      console.log("Sample task IDs:", taskIds);

      const tempTasks = currentData.tasks.filter(t =>
        typeof t.id === 'string' && t.id.startsWith('temp://')
      );
      console.log("Temporary task count:", tempTasks.length);

      if (tempTasks.length > 0) {
        const tempIds = tempTasks.map(t => t.id);
        console.log("Temporary task IDs:", tempIds);

        // Show task names for temp IDs
        const tempTaskInfo = tempTasks.map(t => ({ id: t.id, text: t.text }));
        console.log("Temporary tasks:", tempTaskInfo);
      }
    } catch (taskError) {
      console.log("Error accessing task data:", taskError.message);
    }
  }

  console.log("=== END DEBUG ===");
}

// Add this to your App.svelte temporarily
function debugApiMethods() {
  console.log("=== API METHODS DEBUG ===");

  if (!api) {
    console.log("API not available");
    return;
  }

  const methods = Object.getOwnPropertyNames(api);
  console.log("Available API methods:", methods);

  const methodsToTest = ['exec', 'serialize', 'parse', 'getState'];
  methodsToTest.forEach(method => {
    console.log(`${method}: ${typeof api[method]} (available: ${method in api})`);
  });

  console.log("=== END API METHODS DEBUG ===");
}


	function isDayOff(date) {
		const d = date.getDay();
		return d == 0 || d == 6;
	}
	function isHourOff(date) {
		const h = date.getHours();
		return h < 8 || h == 12 || h > 17;
	}
	function highlightTime(d, u) {
		if (u == "day" && isDayOff(d)) return "wx-weekend";
		if (u == "hour" && (isDayOff(d) || isHourOff(d))) return "wx-weekend";
		return "";
	}

  const dayStyle = a => {
      const day = a.getDay() == 5 || a.getDay() == 6;
      return day ? "sday" : "";
  };

      function hoursTemplate(a, b) {
      return `${format(a, "HH:mm")} - ${format(b, "HH:mm")}`;
  }

  const zoomConfig = {
      level: 3,
      levels: [
          {
              minCellWidth: 200,
              maxCellWidth: 400,
              scales: [{ unit: "year", step: 1, format: "yyyy" }],
          },
          {
              minCellWidth: 150,
              maxCellWidth: 400,
              scales: [
                  { unit: "year", step: 1, format: "yyyy" },
                  { unit: "quarter", step: 1, format: "QQQQ" },
              ],
          },
          {
              minCellWidth: 250,
              maxCellWidth: 350,
              scales: [
                  { unit: "quarter", step: 1, format: "QQQQ" },
                  { unit: "month", step: 1, format: "MMMM yyy" },
              ],
          },
          {
              minCellWidth: 100,
              scales: [
                  { unit: "month", step: 1, format: "MMMM yyy" },
                  { unit: "week", step: 1, format: "'week' w" },
              ],
          },
          {
              maxCellWidth: 200,
              scales: [
                  { unit: "month", step: 1, format: "MMMM yyy" },
                  { unit: "day", step: 1, format: "d", css: dayStyle },
              ],
          },
          {
              minCellWidth: 25,
              maxCellWidth: 100,
              scales: [
                  { unit: "day", step: 1, format: "MMM d", css: dayStyle },
                  { unit: "hour", step: 6, format: hoursTemplate },
              ],
          },
          {
              maxCellWidth: 120,
              scales: [
                  { unit: "day", step: 1, format: "MMM d", css: dayStyle },
                  { unit: "hour", step: 1, format: "HH:mm" },
              ],
          },
      ],
  };

  // Add some debugging using $inspect for Svelte 5
  $inspect("Gantt data:", currentData);
  $inspect("Tasks:", currentData.tasks);
  $inspect("Links:", currentData.links);
</script>

<main>
  <h1>Simple Gantt Viewer</h1>


  <!-- Hidden file input -->
  <input
    type="file"
    accept=".json"
    bind:this={fileInput}
    onchange={loadProjectData}
    style="display: none;"
  />



  <div class="gantt-container">
    <Willow>

    <Locale>
        <div class="bar">
          <Field label="Project Start (YYYY/MM/DD)" position="left">
            {#snippet children({ id })}
              <DatePicker bind:value={start} {id} format={"%Y/%m/%d"} onchange={handleStartChange}/>
            {/snippet}
          </Field>
          <Field label="End" position="left">
            {#snippet children({ id })}
              <DatePicker bind:value={end} {id} format={"%Y/%m/%d"} onchange={handleEndChange}/>
            {/snippet}
          </Field>
          <Field label="Today" position="left">
            {#snippet children({ id })}
              <DatePicker bind:value={today} {id} format={"%Y/%m/%d"} onchange={handleTodayChange}/>
            {/snippet}
          </Field>
          <Field label="autoScale" position="left">
            {#snippet children({ id })}
              <div class="input">
                <Switch bind:value={autoScale} {id} />
              </div>
            {/snippet}
          </Field>
        </div>
    </Locale>

    <ContextMenu {api}>
    <Tooltip {api}  content={MyTooltipContent}>
    <Toolbar {items} />
    <Fullscreen hotkey="ctrl+shift+f">
    <Gantt
      bind:this={api}
      {init}
      markers={currentData.markers}
      tasks={currentData.tasks}
      links={currentData.links}
      scales={currentData.scales}
      columns={currentData.columns}
      taskTypes={currentData.taskTypes}
      {highlightTime}
      {autoScale}
			zoom={zoomConfig}
			{start}
			{end}
      on:update-task={handleTaskUpdate}
      on:move-task={handleTaskMove}
      on:resize-task={handleTaskResize}
      on:after-task-drag={handleTaskMove}
    />

    {#if task}
    <CustomTaskForm
      {task}
      taskTypes={currentData.taskTypes}
      allTasks={currentData.tasks}
      allLinks={currentData.links}
      onaction={formAction}
    />
    {/if}

    </Fullscreen>
    <!-- <Editor {api} /> -->
    </Tooltip>
    </ContextMenu>
    </Willow>
  </div>
</main>

<style>

  	.main {
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.bar {
		display: flex;
		padding: 12px;
		border-bottom: var(--wx-gantt-border);
	}

  .input {
		margin: 4px;
	}

   :global(.wx-gantt .wx-bar.wx-task.urgent) {
        background-color: #f49a82;
        border: 1px solid #f45e36;
    }
    :global(.wx-gantt .wx-bar.wx-task.urgent .wx-progress-percent) {
        background-color: #f45e36;
    }

	:global(.wx-gantt .myMiddleClass) {
		background-color: rgba(255, 84, 84, 0.77);
	}
	:global(.wx-gantt .myEndClass) {
		background-color: rgba(54, 206, 124, 0.77);
	}

</style>