<script>
  import { Gantt, Willow, Tooltip, ContextMenu, Fullscreen } from "wx-svelte-gantt";
  import { Toolbar } from "wx-svelte-toolbar";
  import { DatePicker, Field, Locale, Switch } from "wx-svelte-core";
  import SimpleCustomTaskForm from "./SimpleCustomTaskForm.svelte";
  import "./gantt-styles.css";
  import MyTooltipContent from "./MyTooltipContent.svelte";

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
        type: "summary"
      },
      {
        id: 2,
        parent: 1,
        start: new Date(2023, 11, 6),
        duration: 4,
        text: "Task 1",
        progress: 80,
        type: "task"
      },
      {
        id: 3,
        parent: 1,
        start: new Date(2023, 11, 11),
        duration: 4,
        text: "Task 2",
        progress: 40,
        type: "task"
      }
    ],
    links: [
      { id: 1, source: 2, target: 3, type: "e2s" }
    ]
  });

  // Simple state
  let api = $state();
  let task = $state(null);
  let fileInput;

  // Date controls
  let start = $state(new Date(2023, 11, 1));
  let end = $state(new Date(2023, 11, 29));
  let autoScale = $state(false);

  // Gantt configuration
  const scales = [
    { unit: "month", step: 1, format: "MMMM yyy" },
    { unit: "day", step: 1, format: "d" }
  ];

  const columns = [
    { id: "text", header: "Task name", flexgrow: 2 },
    { id: "start", header: "Start date", flexgrow: 1, align: "center" },
    { id: "duration", header: "Duration", align: "center", flexgrow: 1 }
  ];

  const taskTypes = [
    { id: "task", label: "Task" },
    { id: "summary", label: "Summary task" },
    { id: "milestone", label: "Milestone" }
  ];

  // Initialize - just intercept the editor
  function init(api) {
    console.log("Initializing simple Gantt");
    
    api.intercept("show-editor", data => {
      console.log("Opening custom editor for task:", data.id);
      
      // Get task data directly from API
      try {
        const tasks = api.serialize();
        const foundTask = tasks.find(t => t.id === data.id);
        
        if (foundTask) {
          task = foundTask;
          return false; // Prevent default editor
        }
      } catch (error) {
        console.error("Error finding task:", error);
      }
      
      return true; // Allow default editor if we can't find the task
    });
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
        }
        break;

      case "delete-link":
        if (api && data.id) {
          api.exec("delete-link", { id: data.id });
        }
        break;

      default:
        if (api) {
          api.exec(action, data);
        }
        break;
    }
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
      
      // For now, use current project links data as we can't reliably access current links
      // This is a simplified approach - in a real app you'd want to track link changes
      const links = currentProjectData.links;

      // Clean up any temporary IDs by assigning sequential numbers
      const cleanTasks = tasks.map((task, index) => {
        const cleanTask = { ...task };
        
        // Clean up any unwanted properties
        delete cleanTask.data;
        delete cleanTask.$x;
        delete cleanTask.$y;
        delete cleanTask.$w;
        delete cleanTask.$h;
        
        return {
          ...cleanTask,
          id: index + 1,
          parent: task.parent ? tasks.findIndex(t => t.id === task.parent) + 1 : undefined
        };
      });

      const cleanLinks = links.map((link, index) => ({
        ...link,
        id: index + 1,
        source: tasks.findIndex(t => t.id === link.source) + 1,
        target: tasks.findIndex(t => t.id === link.target) + 1
      }));

      const projectData = {
        metadata: {
          projectName: "Simple Gantt Project",
          exportDate: new Date().toISOString(),
          version: "1.0.0"
        },
        tasks: cleanTasks,
        links: cleanLinks,
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

        // Convert date strings back to Date objects
        const processedTasks = jsonData.tasks.map(task => ({
          ...task,
          start: new Date(task.start),
          end: task.end ? new Date(task.end) : undefined
        }));

        // Update our reactive state - this should trigger Gantt re-render
        currentProjectData = {
          tasks: processedTasks,
          links: jsonData.links || []
        };

        console.log("Loaded project data:", {
          tasksCount: processedTasks.length,
          linksCount: jsonData.links?.length || 0,
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
      // Reset to initial data
      const initialData = {
        tasks: [
          {
            id: 1,
            open: true,
            start: new Date(2023, 11, 6),
            duration: 8,
            text: "Project Root",
            progress: 60,
            type: "summary"
          },
          {
            id: 2,
            parent: 1,
            start: new Date(2023, 11, 6),
            duration: 4,
            text: "Task 1",
            progress: 80,
            type: "task"
          },
          {
            id: 3,
            parent: 1,
            start: new Date(2023, 11, 11),
            duration: 4,
            text: "Task 2",
            progress: 40,
            type: "task"
          }
        ],
        links: [
          { id: 1, source: 2, target: 3, type: "e2s" }
        ]
      };
      
      // Update reactive state - this should trigger Gantt re-render
      currentProjectData = initialData;
      
      console.log("New project created with:", {
        tasksCount: initialData.tasks.length,
        linksCount: initialData.links.length
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
</script>

<main>
  <h1>Simple Gantt Viewer</h1>

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
      <Locale>
        <div class="bar">
          <Field label="Project Start" position="left">
            {#snippet children({ id })}
              <DatePicker bind:value={start} {id} format={"%Y/%m/%d"} />
            {/snippet}
          </Field>
          <Field label="Project End" position="left">
            {#snippet children({ id })}
              <DatePicker bind:value={end} {id} format={"%Y/%m/%d"} />
            {/snippet}
          </Field>
          <Field label="Auto Scale" position="left">
            {#snippet children({ id })}
              <div class="input">
                <Switch bind:value={autoScale} {id} />
              </div>
            {/snippet}
          </Field>
        </div>
      </Locale>

      <ContextMenu {api}>
        <Tooltip {api} content={MyTooltipContent}>
          <Toolbar {items} />
          <Fullscreen hotkey="ctrl+shift+f">
            <Gantt
              bind:this={api}
              {init}
              tasks={currentProjectData.tasks}
              links={currentProjectData.links}
              {scales}
              {columns}
              {taskTypes}
              {highlightTime}
              {autoScale}
              {start}
              {end}
            />

            {#if task}
              <SimpleCustomTaskForm
                {task}
                {taskTypes}
                allTasks={api ? api.serialize() : []}
                allLinks={currentProjectData.links}
                onaction={formAction}
              />
            {/if}
          </Fullscreen>
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
