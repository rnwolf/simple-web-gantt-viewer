<script>
  import { Gantt, Willow, Tooltip, ContextMenu, Fullscreen, Toolbar, Editor, registerEditorItem } from "wx-svelte-gantt";
  import { DatePicker, Field, Locale, Switch } from "wx-svelte-core";
  import { Comments } from "wx-svelte-comments";
  import SimpleCustomTaskForm from "./SimpleCustomTaskForm.svelte";
  import Links from "./Links.svelte";
  import "./gantt-styles.css";
  import MyTooltipContent from "./MyTooltipContent.svelte";
  import urlCell from "./urlCell.svelte";
  import MarkerManager from "./MarkerManager.svelte";

  // Register the Comments component with the Editor
  registerEditorItem("comments", Comments);
  // Register the official Links component
  registerEditorItem("links", Links);

  // Simple initial data - let Gantt manage everything
  let currentProjectData = $state({
    tasks: [
      {
        id: 1,
        open: true,
        start: new Date(2023, 11, 6),
        duration: 8,
        text: "Project Root",
        progress: 60,
        type: "summary",
        details: "Main project container with all tasks",
        comments: [
          {
            id: 1,
            user: 1,
            content: "This is the main project container. All tasks should be organized under this.",
            date: new Date(),
          }
        ]
      },
      {
        id: 2,
        parent: 1,
        start: new Date(2023, 11, 6),
        base_start: new Date(2023, 11, 5),
			  base_end: new Date(2023, 11, 9),
        duration: 4,
        text: "Task 1",
        progress: 80,
        type: "task",
        resources: "R001, R002",
        details: "First phase of the project work",
        comments: []
      },
      {
        id: 3,
        parent: 1,
        start: new Date(2023, 11, 11),
        base_start: new Date(2023, 11, 11),
			  base_end: new Date(2023, 11, 15),
        duration: 4,
        optimistic: 10,
        pessimistic: 15,
        text: "Task 2",
        url: "https://example.com/task2",
        progress: 40,
        type: "task",
        resources: "R003",
        details: "Second phase following Task 1",
        comments: []
      }
    ],
    links: [
      { id: 1, source: 2, target: 3, type: "e2s" }
    ],
    markers: [
      {
        id: 1,
        start: new Date(2023, 11, 2),
        text: "Start Project",
      },
      {
        id: 2,
        start: new Date(2023, 11, 8),
        text: "Today",
        css: "myMiddleClass",
      },
      {
        id: 3,
        start: new Date(2023, 11, 25),
        text: "End Project",
        css: "myEndClass",
      }
    ]
  });

  // Simple state
  let api = $state();
  let task = $state(null);
  let selectedTaskId = $state(null);
  let fileInput;
  let showMarkerManager = $state(false);

  // Create users for the comments (following official demo pattern)
  const users = [
    { id: 1, name: "Alex" },
    { id: 2, name: "John" },
    { id: 3, name: "Bob" },
    { id: 4, name: "Mary" },
    { id: 5, name: "Kate" },
  ];
  const activeUser = 1;

  // Task types definition - moved up to be available for editor config
  const taskTypes = [
    { id: "task", label: "Task" },
    { id: "summary", label: "Summary task" },
    { id: "milestone", label: "Milestone" },
    { id: "critical", label: "Critical" },
    { id: "narrow", label: "Narrow" },
    { id: "progress", label: "Progress" },
    { id: "buffer", label: "Buffer" },
  ];

  // Zoom configuration
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
  // End of zoom configuration

  // Configure editor items following the official demo pattern
  import { defaultEditorItems } from "wx-svelte-gantt";

  // Use consistent YYYY-MM-DD date format for all date controls
  const standardDateConfig = {
    format: "%Y-%m-%d",
    editable: true
  };

  // Create comprehensive editor configuration with two-column layout
  const editorItems = [
    // Left column - basic task information
    { comp: "text", key: "text", label: "Task Name", column: "left" },
    { comp: "textarea", key: "details", label: "Description", column: "left" },
    {
      comp: "select",
      key: "type",
      label: "Task Type",
      column: "left",
      options: taskTypes
    },
    { comp: "text", key: "resources", label: "Resources", column: "left", placeholder: "e.g., R001, R002" },

    { comp: "text", key: "url", label: "URL", column: "left", placeholder: "https://www.example.com/task" },

    // Right column - dates, duration, and progress
    { comp: "date", key: "start", label: "Start Date", column: "right", config: standardDateConfig },
    { comp: "number", key: "duration", label: "Duration (days)", column: "right", min: 0 },
    { comp: "date", key: "end", label: "End Date", column: "right", config: standardDateConfig },
    { comp: "number", key: "optimistic", label: "Optimistic Duration (days)", column: "right", min: 0 },
    { comp: "number", key: "pessimistic", label: "Pessimistic Duration (days)", column: "right", min: 0 },
    { comp: "slider", key: "progress", label: "Progress (%)", column: "right", min: 0, max: 100 },

    // Right column - base dates
    { comp: "date", key: "base_start", label: "Baseline Start Date", column: "right", config: standardDateConfig },
    { comp: "date", key: "base_end", label: "Baseline End Date", column: "right", config: standardDateConfig },

    // Links (Predecessors and Successors combined)
    { comp: "links", key: "links", label: "Task Dependencies" },

    // Comments section (can span full width)
    {
      key: "comments",
      comp: "comments",
      label: "Comments",
      users,
      activeUser,
    }
  ];

  // Editor configuration with events handler to fix date/duration calculations
  const editorConfig = {
    placement: "sidebar", // or "modal" for popup
    layout: "columns",
    autoSave: false, // Set to false to handle updates in the onChange event
    items: editorItems
  };

  // Date controls
  let start = $state(new Date(2023, 11, 1));
  let end = $state(new Date(2023, 11, 29));
  let autoScale = $state(false);
  let baseline = $state(false);
  let normalizeIdsOnSave = $state(true);


  // Gantt configuration
  const scales = [
    { unit: "month", step: 1, format: "MMMM yyy" },
    { unit: "day", step: 1, format: "d" }
  ];

  const columns = [
    { id: "text", header: "Task name", flexgrow: 2, editor: "text" },
    { id: "url", header: "Url", flexgrow: 1, align: "left", cell: urlCell },
    { id: "start", header: "Start date", flexgrow: 1, align: "center" },
    { id: "duration", header: "Duration", align: "center", flexgrow: 1 },
    { id: "resources", header: "Resources", flexgrow: 1, align: "center", editor: "text" }
  ];

  // Task types already defined above for editor configuration

  // Function to add a new task
  function addNewTask(parentId = null) {
    if (!api) {
      alert("Gantt not ready");
      return;
    }

    try {
      // Generate a temporary ID
      const tempId = `temp://${Date.now()}`;

      // Create a new task
      const newTask = {
        id: tempId,
        text: "New Task",
        start: new Date(),
        duration: 1,
        progress: 0,
        type: "task",
        parent: parentId
      };

      // Add the task using the API
      api.exec("add-task", { task: newTask });

      console.log("Added new task:", newTask);
    } catch (error) {
      console.error("Error adding new task:", error);
      alert(`Error adding new task: ${error.message}`);
    }
  }

  // Remove the custom comments functions - we'll use the built-in editor now


  // Initialize - simplified setup like the official demo
  function init(api) {
    console.log("Initializing simple Gantt");

    // Expose functions globally so they can be called
    window.addNewTask = addNewTask;

    // Listen for task selection to enable comments button
    api.on("select-task", (ev) => {
      const { id } = ev;
      console.log("Task selected:", id);
      selectedTaskId = id;
    });

    // Optional: Add basic event logging to see what's happening
    api.on("update-task", (ev) => {
      console.log("🔥 Task updated via drag/form:", ev);
    });

    api.on("move-task", (ev) => {
      console.log("🔥 Task moved:", ev);
    });

    // Add double-click handler to open task editor
    api.on("show-editor", (ev) => {
      console.log("📝 Editor requested for task:", ev.id);
      // Let the default editor behavior work
      return true;
    });

    // Track link creation and deletion from visual interface
    // Maintain a local mirror immediately from the event payload, then sync from API state

    function normalizeEndpoint(raw) {
      if (raw == null) return null;
      if (typeof raw === 'object') {
        if (raw.id != null) return raw.id;
        if (raw.source != null) return raw.source;
        if (raw.target != null) return raw.target;
        if (raw.from != null) return raw.from;
        if (raw.to != null) return raw.to;
        return null;
      }
      return raw;
    }

    function upsertLinkFromEvent(ev) {
      const payload = ev.link ?? ev;
      if (!payload) return;
      const rawSource = payload.source ?? payload.from ?? payload.sourceId ?? payload.src ?? payload.start ?? payload.s;
      const rawTarget = payload.target ?? payload.to ?? payload.targetId ?? payload.dst ?? payload.end ?? payload.t;
      const source = normalizeEndpoint(rawSource);
      const target = normalizeEndpoint(rawTarget);
      if (source == null || target == null) return;
      const id = payload.id ?? Math.max(0, ...(currentProjectData.links || []).map(l => l.id || 0)) + 1;
      const type = payload.type || 'e2s';
      // Initialize links array if needed
      if (!Array.isArray(currentProjectData.links)) currentProjectData.links = [];
      // Remove any existing with same id
      const idx = currentProjectData.links.findIndex(l => l.id === id);
      const newLink = { id, source, target, type };
      if (idx === -1) currentProjectData.links.push(newLink);
      else currentProjectData.links[idx] = newLink;
    }

    function removeLinkFromEvent(ev) {
      const id = ev.id ?? ev.link?.id;
      if (id == null || !Array.isArray(currentProjectData.links)) return;
      const idx = currentProjectData.links.findIndex(l => l.id === id);
      if (idx !== -1) currentProjectData.links.splice(idx, 1);
    }

    api.on("add-link", (ev) => {
      console.log("🔗 Link added via visual interface:", ev);
      upsertLinkFromEvent(ev);
      // Defer a tick to let internal stores settle, then sync from API
      setTimeout(() => {
        try {
          currentProjectData.links = getLinksSnapshot();
          console.log(`✅ Synced ${currentProjectData.links.length} links from API state (add)`);
        } catch (e) {
          console.warn("⚠️ Could not sync links after add-link:", e);
        }
      }, 0);
    });

    api.on("delete-link", (ev) => {
      console.log("🗑️ Link deleted via visual interface:", ev);
      removeLinkFromEvent(ev);
      setTimeout(() => {
        try {
          currentProjectData.links = getLinksSnapshot();
          console.log(`✅ Synced ${currentProjectData.links.length} links from API state (delete)`);
        } catch (e) {
          console.warn("⚠️ Could not sync links after delete-link:", e);
        }
      }, 0);
    });

    api.on("update-link", (ev) => {
      console.log("🔄 Link updated via visual interface:", ev);
      upsertLinkFromEvent(ev);
      setTimeout(() => {
        try {
          currentProjectData.links = getLinksSnapshot();
          console.log(`✅ Synced ${currentProjectData.links.length} links from API state (update)`);
        } catch (e) {
          console.warn("⚠️ Could not sync links after update-link:", e);
        }
      }, 0);
    });

    console.log("Simple Gantt initialization completed - using standard SVAR behavior");
  }

  // Handle editor changes with proper date/duration synchronization (only for form edits)
  function handleEditorChange(ev) {
    console.log("=== EDITOR CHANGE EVENT ===");
    console.log("Editor action:", ev);

    const { action, id, values } = ev;

    // Handle different editor actions
    if (action === "save-task" && api && id && values) {
      console.log("Saving task from editor:", { id, values });

      // Apply date/duration synchronization for form edits only
      let updatedTask = { ...values };

      // Convert duration to number if it's a string
      if (updatedTask.duration !== undefined) {
        updatedTask.duration = parseInt(updatedTask.duration) || 0;
        console.log("Converted duration to number:", updatedTask.duration);
      }

      // Handle milestone type
      if (updatedTask.type === "milestone") {
        updatedTask.duration = 0;
        console.log("Set duration to 0 for milestone");
      }

      // Recalculate end date when duration or start date exist
      if (updatedTask.start && updatedTask.duration !== undefined && updatedTask.duration > 0) {
        const startDate = new Date(updatedTask.start);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + updatedTask.duration);
        updatedTask.end = endDate;

        console.log(`✅ Synchronized: Start ${startDate} + ${updatedTask.duration} days = End ${endDate}`);
      }

      // Update the task
      try {
        api.exec("update-task", { id, task: updatedTask });
        console.log("✅ Task updated from editor");
      } catch (error) {
        console.error("❌ Error updating task from editor:", error);
      }
    } else if (action === "delete-task" && api && id) {
      console.log("Deleting task from editor:", id);
      api.exec("delete-task", { id });
    }

    console.log("=== END EDITOR CHANGE ===");
  }

  // Form actions - work directly with API
  function formAction(ev) {
    const { action, data } = ev;
    console.log("Form action:", action, data);

    switch (action) {
      case "close-form":
        task = null;
        break;

      case "update-task":
        if (api && data.id && data.task) {
          api.exec("update-task", { id: data.id, task: data.task });
          // Update form state
          task = { ...task, ...data.task };
        }
        break;

      case "delete-task":
        if (api && data.id) {
          api.exec("delete-task", { id: data.id });
          task = null;
        }
        break;

      case "update-link":
        if (api && data.id && data.link) {
          api.exec("update-link", { id: data.id, link: data.link });
          // Also update currentProjectData to keep it in sync
          const linkIndex = currentProjectData.links.findIndex(link => link.id === data.id);
          if (linkIndex !== -1) {
            currentProjectData.links[linkIndex] = {
              ...currentProjectData.links[linkIndex],
              ...data.link
            };
            console.log(`✅ Updated link ${data.id} in currentProjectData`);
          }
        }
        break;

    case "delete-link":
        if (api && data.id) {
          api.exec("delete-link", { id: data.id });
          // Also update currentProjectData to keep it in sync
          const linkIndex = currentProjectData.links.findIndex(link => link.id === data.id);
          if (linkIndex !== -1) {
            currentProjectData.links.splice(linkIndex, 1);
            console.log(`✅ Removed link ${data.id} from currentProjectData`);
          }
        }
        break;

      default:
        if (api) {
          api.exec(action, data);
        }
        break;
    }
  }

  // Helper: get a robust snapshot of links from the API state with safe fallbacks
  function getLinksSnapshot() {
    try {
      const state = api?.getState?.();
      if (state) {
        const candidates = [
          () => state?.links?.list?.(),
          () => state?.links?.serialize?.(),
          () => state?.links?.all?.(),
          () => state?.links?.data,
          () => (Array.isArray(state?.links) ? state.links : null)
        ];
        for (const getter of candidates) {
          try {
            const v = getter?.();
            if (Array.isArray(v)) return v;
            if (v && typeof v === 'object' && Array.isArray(v.items)) return v.items;
          } catch (_) {}
        }
      }
    } catch (e) {
      console.warn('getLinksSnapshot() failed to access api state:', e);
    }
    // Last resort: return our local mirror if present, or empty array
    return Array.isArray(currentProjectData.links) ? currentProjectData.links : [];
  }

  // Simple save function
  function saveProject() {
    if (!api) {
      alert("Gantt not ready");
      return;
    }

    try {
      // Get current state directly from Gantt
      const tasks = api.serialize();

      // Always try to take links from API state; fall back to our local mirror
      let links = getLinksSnapshot();
      // Drop obviously invalid links early (missing endpoints props)
      links = Array.isArray(links) ? links.filter(l => (l && (l.source != null || l.from != null) && (l.target != null || l.to != null))) : [];
      console.log(`🔎 Saving with ${links.length} link(s) after pre-filter`);

      // Decide whether to normalize IDs even if temp IDs exist
      const hasTempIds = tasks.some(t => typeof t.id === 'string' && t.id.startsWith('temp://'));
      const forceNormalize = !!normalizeIdsOnSave;

      function normalizeEndpoint(raw) {
        if (raw == null) return null;
        if (typeof raw === 'object') {
          // common nested shapes
          if (raw.id != null) return raw.id;
          if (raw.source != null) return raw.source;
          if (raw.target != null) return raw.target;
          if (raw.from != null) return raw.from;
          if (raw.to != null) return raw.to;
          return null;
        }
        return raw; // assume primitive id
      }

      let cleanTasks;
      let cleanLinks;

      if (hasTempIds && !forceNormalize) {
        console.log('⚠️ Temp IDs detected; saving raw IDs for tasks and links (normalization disabled)');
        // Keep original IDs so links remain valid
        cleanTasks = tasks.map(task => {
          const cleanTask = { ...task };
          delete cleanTask.data; delete cleanTask.$x; delete cleanTask.$y; delete cleanTask.$w; delete cleanTask.$h;
          // Preserve comments
          if (task.comments && Array.isArray(task.comments)) cleanTask.comments = task.comments;
          return cleanTask;
        });

        const taskIdSet = new Set(tasks.map(t => t.id));
        function resolveToTaskId(key) {
          if (key == null) return null;
          if (taskIdSet.has(key)) return key;
          // If numeric index, try map to tasks[index] or tasks[index-1]
          const n = typeof key === 'number' ? key : Number.isFinite(parseFloat(key)) ? parseInt(key) : NaN;
          if (!Number.isNaN(n)) {
            if (n >= 0 && n < tasks.length) return tasks[n].id;
            if (n - 1 >= 0 && n - 1 < tasks.length) return tasks[n - 1].id;
          }
          return null;
        }

        function deepExtract(obj, maxDepth = 3) {
          if (obj == null || maxDepth < 0) return null;
          if (typeof obj !== 'object') return obj;
          const preferredKeys = ['id','source','target','from','to','sourceId','targetId','src','dst','start','end','s','t','task','taskId'];
          for (const k of preferredKeys) {
            if (obj[k] != null) return deepExtract(obj[k], maxDepth - 1);
          }
          // As a fallback, scan values
          for (const v of Object.values(obj)) {
            const ex = deepExtract(v, maxDepth - 1);
            if (ex != null) return ex;
          }
          return null;
        }

        cleanLinks = links.map((link, index) => {
          const cleanLink = { ...link };
          delete cleanLink.$p;
          // Normalize endpoints but do not remap
          const rawSource = link.source ?? link.from ?? link.sourceId ?? link.src ?? link.start ?? link.s ?? link.sourceTask ?? link.startTask;
          const rawTarget = link.target ?? link.to ?? link.targetId ?? link.dst ?? link.end ?? link.t ?? link.targetTask ?? link.endTask;
          let source = normalizeEndpoint(rawSource);
          let target = normalizeEndpoint(rawTarget);
          if (source == null) source = deepExtract(rawSource);
          if (target == null) target = deepExtract(rawTarget);
          // Try to resolve to actual task ids if endpoints look like indices
          const resolvedSource = resolveToTaskId(source);
          const resolvedTarget = resolveToTaskId(target);
          if (resolvedSource == null || resolvedTarget == null) {
            console.warn('⚠️ Skipping link with missing/raw-unresolvable endpoints:', { link, source, target });
            return null;
          }
          if (resolvedSource === resolvedTarget) {
            console.warn('⚠️ Skipping self-referential link:', { link, resolvedSource, resolvedTarget });
            return null;
          }
          return { id: cleanLink.id ?? (index + 1), type: cleanLink.type || 'e2s', source: resolvedSource, target: resolvedTarget };
        }).filter(Boolean);
      } else {
        // No temp IDs; remap to stable numeric ids
        const idMap = new Map(); // originalId -> newId (1..N)
        tasks.forEach((t, i) => idMap.set(t.id, i + 1));

        cleanTasks = tasks.map((task, index) => {
          const cleanTask = { ...task };
          delete cleanTask.data; delete cleanTask.$x; delete cleanTask.$y; delete cleanTask.$w; delete cleanTask.$h;
          const finalTask = {
            ...cleanTask,
            id: idMap.get(task.id) || (index + 1),
            parent: task.parent != null ? idMap.get(task.parent) : undefined
          };
          if (task.comments && Array.isArray(task.comments)) finalTask.comments = task.comments;
          return finalTask;
        });

        cleanLinks = links.map((link, index) => {
          const cleanLink = { ...link };
          delete cleanLink.$p;
          const rawSource = link.source ?? link.from ?? link.sourceId ?? link.src ?? link.start ?? link.s;
          const rawTarget = link.target ?? link.to ?? link.targetId ?? link.dst ?? link.end ?? link.t;
          const srcKey = normalizeEndpoint(rawSource);
          const tgtKey = normalizeEndpoint(rawTarget);
          const source = idMap.get(srcKey);
          const target = idMap.get(tgtKey);
          if (!source || !target) {
            console.warn('⚠️ Skipping link with unmapped endpoints:', { link, srcKey, tgtKey });
            return null;
          }
          if (source === target) {
            console.warn('⚠️ Skipping self-referential link after remap:', { link, srcKey, tgtKey, source, target });
            return null;
          }
          return { id: index + 1, type: cleanLink.type || 'e2s', source, target };
        }).filter(Boolean);
      }

      const projectData = {
        metadata: {
          projectName: "Simple Gantt Project",
          exportDate: new Date().toISOString(),
          version: "1.0.0",
          normalizedIds: !!forceNormalize || !hasTempIds,
          timelineStart: start instanceof Date ? start.toISOString() : undefined,
          timelineEnd: end instanceof Date ? end.toISOString() : undefined
        },
        tasks: cleanTasks,
        links: cleanLinks,
        markers: currentProjectData.markers,
        scales,
        columns,
        taskTypes
      };

      // Download file
      const jsonString = JSON.stringify(projectData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `gantt-project-${new Date().toISOString().split('T')[0]}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert("Project saved successfully!");

    } catch (error) {
      console.error("Error saving project:", error);
      alert(`Error saving project: ${error.message}`);
    }
  }

  // Transform-and-download: Resource-centric project view
  function downloadResourceView() {
    if (!api) {
      alert("Gantt not ready");
      return;
    }

    try {
      const tasks = api.serialize();

      // Build a quick lookup of original tasks by id
      const taskById = new Map(tasks.map(t => [t.id, t]));

      // Helper to parse resources string into array of codes
      const parseResources = (r) =>
        (typeof r === 'string' ? r.split(',') : [])
          .map(x => x.trim())
          .filter(Boolean);

      // For reliable dates
      function ensureEnd(t) {
        if (t.end instanceof Date && !isNaN(t.end)) return t.end;
        if (t.start) {
          const s = new Date(t.start);
          if (!isNaN(s) && t.duration && t.duration > 0) {
            const e = new Date(s);
            e.setDate(s.getDate() + t.duration);
            return e;
          }
        }
        return undefined;
      }

      // Collect resources and partition tasks (drop tasks with no resources)
      const resourceToTasks = new Map(); // r => [taskIds]
      for (const t of tasks) {
        const rs = parseResources(t.resources);
        if (rs.length === 0) continue; // drop unassigned
        for (const r of rs) {
          if (!resourceToTasks.has(r)) resourceToTasks.set(r, []);
          resourceToTasks.get(r).push(t.id);
        }
      }

      // Build new task list: summaries per resource + children duplicates
      const newTasks = [];
      const duplicateMap = new Map(); // key: `${origId}|${groupKey}` => newId

      let nextId = 1;

      function addSummaryWithChildren(groupKey, title, origIds) {
        // Create summary
        const summaryId = nextId++;
        const childIds = [];

        // Duplicate each task under this summary
        for (const oid of origIds) {
          const orig = taskById.get(oid);
          if (!orig) continue;
          const end = ensureEnd(orig);
          const dup = {
            ...orig,           // retain as much info as possible (url, resources, etc.)
            id: nextId++,
            parent: summaryId,
            type: 'progress',  // child tasks should be of type "progress"
            // strip internal fields if any
            data: undefined,
            $x: undefined,
            $y: undefined,
            $w: undefined,
            $h: undefined,
            end
          };
          newTasks.push(dup);
          childIds.push(dup.id);
          duplicateMap.set(`${oid}|${groupKey}`, dup.id);
        }

        // Compute summary start/end/duration from children
        let start = undefined, end = undefined;
        for (const cid of childIds) {
          const ct = newTasks.find(t => t.id === cid);
          if (!ct) continue;
          const cs = ct.start ? new Date(ct.start) : undefined;
          const ce = ensureEnd(ct);
          if (cs && !isNaN(cs)) {
            start = !start || cs < start ? cs : start;
          }
          if (ce && !isNaN(ce)) {
            end = !end || ce > end ? ce : end;
          }
        }
        let duration;
        if (start && end) {
          const ms = end.getTime() - start.getTime();
          duration = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
        }

        newTasks.push({
          id: summaryId,
          text: title, // "Resource: {RESOURCE}"
          type: 'summary',
          open: true,
          start: start || undefined,
          end: end || undefined,
          duration: duration || undefined
        });
      }

      // Add each resource group
      for (const [r, ids] of resourceToTasks.entries()) {
        addSummaryWithChildren(r, `Resource: ${r}`, ids);
      }

      // Per requirements: no links in this export
      const projectData = {
        metadata: {
          projectName: 'Resource-centric export',
          exportDate: new Date().toISOString(),
          version: '1.0.0',
          view: 'by-resource',
          normalizedIds: !!forceNormalize || !hasTempIds,
          timelineStart: start instanceof Date ? start.toISOString() : undefined,
          timelineEnd: end instanceof Date ? end.toISOString() : undefined
        },
        tasks: newTasks,
        links: [],
        markers: currentProjectData.markers,
        scales,
        columns,
        taskTypes
      };

      const jsonString = JSON.stringify(projectData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `gantt-project-by-resource-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('Resource-centric project exported successfully!');
    } catch (err) {
      console.error('Error exporting resource-centric view:', err);
      alert(`Error exporting resource-centric view: ${err.message}`);
    }
  }

  // Simple load function
  function loadProject(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const jsonData = JSON.parse(e.target.result);

        if (!jsonData.tasks || !Array.isArray(jsonData.tasks)) {
          alert("Invalid project file - missing tasks");
          return;
        }

        // Convert date strings back to Date objects and preserve comments
        const processedTasks = jsonData.tasks.map(task => {
          const processedTask = {
            ...task,
            start: new Date(task.start),
            end: task.end ? new Date(task.end) : undefined
          };

          // Explicitly preserve comments if they exist
          if (task.comments && Array.isArray(task.comments)) {
            processedTask.comments = task.comments;
            console.log(`Loaded ${task.comments.length} comments for task: ${task.text}`);
          }

          return processedTask;
        });

        // Convert marker date strings back to Date objects
        const processedMarkers = (jsonData.markers || []).map(marker => ({
          ...marker,
          start: new Date(marker.start)
        }));

        // Update our reactive state - this should trigger Gantt re-render
        currentProjectData = {
          tasks: processedTasks,
          links: jsonData.links || [],
          markers: processedMarkers
        };

        // Determine and set the visible timeline window so the project is immediately visible
        const metaStart = jsonData.metadata?.timelineStart ? new Date(jsonData.metadata.timelineStart) : null;
        const metaEnd = jsonData.metadata?.timelineEnd ? new Date(jsonData.metadata.timelineEnd) : null;

        function validDate(d) { return d instanceof Date && !isNaN(d); }

        if (validDate(metaStart) && validDate(metaEnd)) {
          start = metaStart;
          end = metaEnd;
        } else {
          // Compute from tasks
          let minStart = null;
          let maxEnd = null;
          for (const t of processedTasks) {
            const s = t.start instanceof Date && !isNaN(t.start) ? new Date(t.start) : null;
            let e = t.end instanceof Date && !isNaN(t.end) ? new Date(t.end) : null;
            if (!e && s && Number.isFinite(t.duration) && t.duration > 0) {
              e = new Date(s);
              e.setDate(e.getDate() + t.duration);
            }
            if (s) minStart = !minStart || s < minStart ? s : minStart;
            if (e) maxEnd = !maxEnd || e > maxEnd ? e : maxEnd;
          }
          if (!minStart || !maxEnd) {
            // Fallback to a default window around today
            const today = new Date();
            const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const defaultStart = new Date(startOfToday); defaultStart.setDate(defaultStart.getDate() - 3);
            const defaultEnd = new Date(startOfToday); defaultEnd.setDate(defaultEnd.getDate() + 30);
            start = defaultStart;
            end = defaultEnd;
          } else {
            const padStart = new Date(minStart); padStart.setDate(padStart.getDate() - 3);
            const padEnd = new Date(maxEnd); padEnd.setDate(padEnd.getDate() + 7);
            start = padStart;
            end = padEnd;
          }
        }

        console.log("Loaded project data:", {
          tasksCount: processedTasks.length,
          linksCount: jsonData.links?.length || 0,
          markersCount: processedMarkers.length,
          projectName: jsonData.metadata?.projectName
        });

        alert(`Project "${jsonData.metadata?.projectName || 'Unnamed'}" loaded successfully!`);

      } catch (error) {
        console.error("Error loading project:", error);
        alert(`Error loading project file: ${error.message}`);
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  }

  function triggerFileLoad() {
    fileInput.click();
  }

  function createNewProject() {
    if (confirm("Create new project? This will clear all current data.")) {
      // Compute dates relative to 'today'
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const projectStart = new Date(startOfToday);
      projectStart.setDate(projectStart.getDate() + 1); // start tomorrow by default

      const task1Start = new Date(projectStart);
      const task1Duration = 4;
      const task1End = new Date(task1Start);
      task1End.setDate(task1End.getDate() + task1Duration);

      const task2Start = new Date(task1End);
      const task2Duration = 4;
      const task2End = new Date(task2Start);
      task2End.setDate(task2End.getDate() + task2Duration);

      // Root summary duration auto-computed by Gantt, but provide a rough duration
      const rootDurationDays = Math.max(1, Math.ceil((task2End.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)));

      // Baseline dates (optional): set 2 days before starts
      const baseStart1 = new Date(task1Start); baseStart1.setDate(baseStart1.getDate() - 2);
      const baseEnd1 = new Date(task1End); baseEnd1.setDate(baseEnd1.getDate() - 2);

      const initialData = {
        tasks: [
          {
            id: 1,
            open: true,
            start: projectStart,
            duration: rootDurationDays,
            text: "Project Root",
            progress: 0,
            type: "summary"
          },
          {
            id: 2,
            parent: 1,
            start: task1Start,
            base_start: baseStart1,
            base_end: baseEnd1,
            duration: task1Duration,
            optimistic: task1Duration - 1,
            pessimistic: task1Duration + 2,
            text: "Task 1",
            progress: 0,
            type: "task",
            resources: "Resource-A"
          },
          {
            id: 3,
            parent: 1,
            start: task2Start,
            duration: task2Duration,
            text: "Task 2",
            url: "https://example.com/task2",
            progress: 0,
            type: "task",
            resources: "Resource-A, Resource-B"
          }
        ],
        links: [
          { id: 1, source: 2, target: 3, type: "e2s" }
        ],
        markers: [
          {
            id: 1,
            start: projectStart,
            text: "Start Project",
          },
          {
            id: 2,
            start: startOfToday,
            text: "Today",
            css: "myMiddleClass",
          },
          {
            id: 3,
            start: (() => { const d = new Date(projectStart); d.setDate(d.getDate() + 20); return d; })(),
            text: "End Project",
            css: "myEndClass",
          }
        ]
      };

      // Update reactive state - this should trigger Gantt re-render
      currentProjectData = initialData;

      // Also update the visible timeline to a sensible window around the project
      const timelineStart = new Date(startOfToday); timelineStart.setDate(timelineStart.getDate() - 3);
      const timelineEnd = new Date(projectStart); timelineEnd.setDate(timelineEnd.getDate() + 30);
      start = timelineStart;
      end = timelineEnd;

      console.log("New project created with:", {
        tasksCount: initialData.tasks.length,
        linksCount: initialData.links.length,
        timelineStart,
        timelineEnd
      });

      alert("New project created!");
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
      handler: saveProject,
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
      id: "new-project",
      comp: "button",
      icon: "wxi-file",
      text: "New project",
      type: "secondary",
      handler: createNewProject,
    }
  ];

  function isDayOff(date) {
    const d = date.getDay();
    return d == 0 || d == 6;
  }

  function highlightTime(d, u) {
    if (u == "day" && isDayOff(d)) return "wx-weekend";
    return "";
  }

  // Marker manager functions
  function openMarkerManager() {
    console.log("📍 Opening marker manager, current showMarkerManager:", showMarkerManager);
    showMarkerManager = true;
    console.log("📍 Set showMarkerManager to:", showMarkerManager);
  }

  function handleMarkerAction(event) {
    const { action, data } = event.detail;
    console.log("Marker action:", action, data);

    switch (action) {
      case "close":
        showMarkerManager = false;
        break;

      case "add":
        if (data.marker) {
          // Generate a unique ID for the new marker
          const maxId = Math.max(0, ...currentProjectData.markers.map(m => m.id || 0));
          const newMarker = {
            id: maxId + 1,
            ...data.marker,
            start: new Date(data.marker.start)
          };
          currentProjectData.markers.push(newMarker);
          console.log("✅ Added new marker:", newMarker);
        }
        break;

      case "update":
        if (data.id !== undefined && data.marker) {
          const markerIndex = currentProjectData.markers.findIndex(m => m.id === data.id);
          if (markerIndex !== -1) {
            currentProjectData.markers[markerIndex] = {
              ...currentProjectData.markers[markerIndex],
              ...data.marker,
              id: data.id, // Preserve the ID
              start: new Date(data.marker.start)
            };
            console.log(`✅ Updated marker with ID ${data.id}`);
          }
        }
        break;

      case "delete":
        if (data.id !== undefined) {
          const markerIndex = currentProjectData.markers.findIndex(m => m.id === data.id);
          if (markerIndex !== -1) {
            currentProjectData.markers.splice(markerIndex, 1);
            console.log(`✅ Deleted marker with ID ${data.id}`);
          }
        }
        break;

      default:
        console.warn("Unknown marker action:", action);
    }
  }

</script>

<main>
  <h1>Simple Manual Gantt Chart Editor</h1>
  <p>
    This is a simple Gantt chart editor that allows you to create, edit, and manage tasks, links, and markers. </p>
  <p>
    Built with <a href="https://svelte.dev/" target="_blank">Svelte</a> and runs completely locally in your browser. Close browser and all your plans are gone! Save and load project plans locally. See the code <a href="https://github.com/rnwolf/simple-web-gantt-viewer" target="_blank"> at Github simple-web-gantt-viewer</a>.
  </p>
  <!-- Hidden file input -->
  <input
    type="file"
    accept=".json"
    bind:this={fileInput}
    onchange={loadProject}
    style="display: none;"
  />

  <div class="gantt-container">
    <Willow>
      <div class="ganttCell">
      <Locale>
        <div class="bar">
          <Field label="Timeline Start" position="left">
            {#snippet children({ id })}
              <DatePicker bind:value={start} {id} format={"%Y-%m-%d"} editable={true} />
            {/snippet}
          </Field>
          <Field label="Timeline End" position="left">
            {#snippet children({ id })}
              <DatePicker bind:value={end} {id} format={"%Y-%m-%d"} editable={true} />
            {/snippet}
          </Field>
          <Field label="Auto Scale" position="left">
            {#snippet children({ id })}
              <div class="input">
                <Switch bind:value={autoScale} {id} />
              </div>
            {/snippet}
          </Field>
          <Field label="Baseline" position="left">
            {#snippet children({ id })}
              <div class="input">
                <Switch bind:value={baseline} {id} />
              </div>
            {/snippet}
          </Field>
          <Field label="Normalize IDs on save" position="left">
            {#snippet children({ id })}
              <div class="input">
                <Switch bind:value={normalizeIdsOnSave} {id} />
              </div>
            {/snippet}
          </Field>

        </div>
      </Locale>

      <ContextMenu {api}>
        <Tooltip {api} content={MyTooltipContent}>
          <div class="toolbar-container">
            <Toolbar {api} />
            <div class="custom-toolbar">
              <button class="toolbar-btn save" onclick={saveProject} title="Save Project">
                📁 Save
              </button>
              <button class="toolbar-btn load" onclick={triggerFileLoad} title="Load Project">
                📂 Load
              </button>
              <button class="toolbar-btn new" onclick={createNewProject} title="New Project">
                📄 New
              </button>
              <button class="toolbar-btn markers" onclick={openMarkerManager} title="Manage Markers">
                📍 Markers
              </button>
              <button class="toolbar-btn resource-export" onclick={downloadResourceView} title="Export Resource View">
                👥 Resources
              </button>
            </div>
          </div>
          <Fullscreen hotkey="ctrl+shift+f">
            <Gantt
              bind:this={api}
              {init}
              tasks={currentProjectData.tasks}
              links={currentProjectData.links}
              markers={currentProjectData.markers}
              baselines={baseline}
              {scales}
              {columns}
              {taskTypes}
              {highlightTime}
              {autoScale}
              {start}
              {end}
              zoom={zoomConfig}
            />
          </Fullscreen>
          <Editor {api} items={editorItems} autoSave={false} onaction={handleEditorChange} />
        </Tooltip>
      </ContextMenu>
      </div>
    </Willow>
  </div>

  <!-- Marker Manager Modal -->
  {#if showMarkerManager}
    <div class="modal-overlay">
      <MarkerManager
        markers={currentProjectData.markers}
        onaction={handleMarkerAction}
      />
    </div>
  {/if}

  <!-- Comments are now integrated into the main Editor component above -->
</main>

<style>
  :global(.main) {
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


  :global(.wx-gantt .wx-bar.wx-task.critical .wx-progress-percent) {
    background-color: #f45e36;
  }
  :global(.wx-gantt .wx-bar.wx-task.critical) {
    background-color: #f49a82;
    border: 1px solid #f45e36
  }

  :global(.wx-gantt .wx-bar.wx-task.narrow) {
    background-color: #676a81;
    color: transparent;
    height: 10px!important;
    margin-top: 10px;
    border: 1px solid #63667a
  }

  :global(.wx-gantt .wx-bar.wx-task.narrow .wx-progress-percent) {
    background-color: #1a2630
  }

  :global(.wx-gantt .wx-bar.wx-task.narrow .wx-link) {
    background-color: #384047;
    border-radius: 0
  }

  :global(.wx-gantt .wx-bar.wx-task.narrow .wx-link .wx-inner) {
    border-radius: 0
  }

  :global(.wx-gantt .wx-bar.wx-task.buffer) {
    background-color: #ffeb3b;
    border: 1px solid #ffeb3b;
    color: #384047;
    border-radius: 50px
  }

  :global(.wx-gantt .wx-bar.wx-task.buffer .wx-progress-percent) {
    background-color: #ffc107
  }

  :global(.wx-gantt .wx-bar.wx-task.buffer .wx-progress-wrapper) {
    border-radius: 50px
  }

  :global(  .wx-gantt .wx-bar.wx-task.progress) {
    background-color: transparent;
    color: var(--wx-color-font);
    border-radius: 50px;
    border: 3px solid #00bcd4
  }

  :global(.wx-gantt .wx-bar.wx-task.progress .wx-progress-percent) {
    background-color: #00bcd4
  }

  :global(.wx-gantt .wx-bar.wx-task.progress .wx-progress-wrapper) {
    border-radius: 50px
  }

  :global(.wx-gantt .myMiddleClass) {
    background-color: rgba(255, 84, 84, 0.77);
  }

  :global(.wx-gantt .myEndClass) {
    background-color: rgba(54, 206, 124, 0.77);
  }

  /* Add task button styling */
  :global(.add-task-button) {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    margin: 0 auto;
    transition: all 0.2s ease;
  }

  :global(.add-task-button:hover) {
    background-color: #0056b3;
    transform: scale(1.1);
  }

  :global(.add-task-button:active) {
    transform: scale(0.95);
  }

  /* Toolbar container styling */
  .toolbar-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px;
    border-bottom: var(--wx-gantt-border);
    background-color: var(--wx-background, #f8f9fa);
  }

  .custom-toolbar {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .toolbar-btn {
    padding: 6px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: white;
    color: #333;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .toolbar-btn:hover {
    background-color: #f5f5f5;
    border-color: #999;
    transform: translateY(-1px);
  }

  .toolbar-btn:active {
    transform: translateY(0);
    background-color: #e9e9e9;
  }

  .toolbar-btn.save {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
  }

  .toolbar-btn.save:hover {
    background-color: #0056b3;
    border-color: #0056b3;
  }

  .toolbar-btn.load {
    background-color: #28a745;
    color: white;
    border-color: #28a745;
  }

  .toolbar-btn.load:hover {
    background-color: #1e7e34;
    border-color: #1e7e34;
  }

  .toolbar-btn.new {
    background-color: #6c757d;
    color: white;
    border-color: #6c757d;
  }

  .toolbar-btn.new:hover {
    background-color: #545b62;
    border-color: #545b62;
  }

  /* Comments are now integrated into the main Editor - no need for modal styling */

  /* Fix DatePicker dropdown positioning - force calendars to appear below the input */
  :global(.wx-datepicker) {
    position: relative;
  }

  :global(.wx-datepicker .wx-popup) {
    top: 100% !important;
    bottom: auto !important;
    margin-top: 4px;
  }

  :global(.wx-popup.wx-calendar) {
    top: 100% !important;
    bottom: auto !important;
    transform: translateY(0) !important;
  }

  /* Alternative approach - ensure date picker containers have proper z-index and positioning */
  .bar :global(.wx-field) {
    position: relative;
    z-index: 10;
  }

  .bar :global(.wx-datepicker .wx-popup) {
    position: absolute !important;
    top: calc(100% + 2px) !important;
    bottom: auto !important;
    left: 0 !important;
    margin: 0;
    z-index: 1000;
  }

  /* Ensure the bar itself doesn't interfere with dropdown positioning */
  .bar {
    position: relative;
    z-index: 1;
    overflow: visible;
  }

  /*  ganttCell style ensures that the bottom horizontal slider does not overlap with the task bars */
  .ganttCell {
		height: 410px;
		width: 100%;
		display: flex;
		flex-direction: column;
		margin-bottom: 10px;
	}

  /* Modal overlay styling */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 20px;
  }

  /* Additional button styling for markers and export */
  .toolbar-btn.markers {
    background-color: #6f42c1;
    color: white;
    border-color: #6f42c1;
  }

  .toolbar-btn.markers:hover {
    background-color: #5a2a9d;
    border-color: #5a2a9d;
  }

  .toolbar-btn.resource-export {
    background-color: #0d6efd;
    color: white;
    border-color: #0d6efd;
  }

  .toolbar-btn.resource-export:hover {
    background-color: #0b5ed7;
    border-color: #0b5ed7;
  }

</style>
