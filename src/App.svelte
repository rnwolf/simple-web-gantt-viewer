<script>
  import { getData } from "./data.js";
  import { Gantt, Willow, Tooltip, ContextMenu, Editor, defaultEditorItems, Fullscreen   } from "wx-svelte-gantt";
  import { Toolbar } from "wx-svelte-toolbar";
  import { DatePicker, Field, Locale, Switch } from "wx-svelte-core";

  import "./gantt-styles.css";
  import MyTooltipContent from "./MyTooltipContent.svelte";

  // Reactive data state
  let currentData = $state(getData());
  let api = $state();

  let start = $state(new Date(2024, 11, 6)),
		end = $state(new Date(2024, 11, 29)),
		autoScale = $state(false);

  // Hidden file input reference
  let fileInput;

  // Function to download project data as JSON
  function downloadProjectData() {
    console.log("downloadProjectData function called");

    try {
      console.log("API object:", api);
      console.log("Current data snapshot:", $state.snapshot(currentData));

      // Get current data from the Gantt component
      let currentTasks;
      if (api && api.serialize) {
        console.log("Using API serialize method");
        currentTasks = api.serialize();
      } else {
        console.log("Using fallback currentData.tasks");
        currentTasks = currentData.tasks;
      }

      console.log("Current tasks for export:", currentTasks);

      // Create the project data object
      const projectData = {
        metadata: {
          projectName: "Simple Gantt Project",
          exportDate: new Date().toISOString(),
          version: "1.0.0"
        },
        tasks: currentTasks,
        links: currentData.links,
        scales: currentData.scales,
        columns: currentData.columns,
        taskTypes: currentData.taskTypes
      };

      console.log("Project data to export:", projectData);

      // Convert to JSON string
      const jsonString = JSON.stringify(projectData, null, 2);
      console.log("JSON string length:", jsonString.length);

      // Create blob and download
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      console.log("Blob created, URL:", url);

      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `gantt-project-${new Date().toISOString().split('T')[0]}.json`;

      console.log("Download link created:", link.download);

      // Trigger download
      document.body.appendChild(link);
      console.log("Link added to body, clicking...");
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);

      console.log('Project data downloaded successfully');
      alert('Project saved successfully!');
    } catch (error) {
      console.error('Error downloading project data:', error);
      console.error('Error stack:', error.stack);
      alert(`Error saving project data: ${error.message}`);
    }
  }

  // Function to trigger file input
  function triggerFileLoad() {
    fileInput.click();
  }

  // Function to load project data from JSON file
  function loadProjectData(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.json')) {
      alert('Please select a valid JSON file.');
      return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
      try {
        const jsonData = JSON.parse(e.target.result);

        // Validate the loaded data structure
        if (!validateProjectData(jsonData)) {
          alert('Invalid project file format. Please ensure the file contains valid Gantt project data.');
          return;
        }

        // Convert date strings back to Date objects
        const processedData = processLoadedData(jsonData);

        // Update the current data
        currentData = processedData;

        // Clear the Gantt and reload with new data
        if (api) {
          api.parse(processedData);
        }

        console.log('Project loaded successfully:', processedData);
        alert(`Project "${jsonData.metadata?.projectName || 'Unnamed Project'}" loaded successfully!`);

      } catch (error) {
        console.error('Error loading project data:', error);
        alert('Error loading project file. Please ensure the file is valid JSON.');
      }
    };

    reader.onerror = function() {
      alert('Error reading file. Please try again.');
    };

    reader.readAsText(file);

    // Clear the file input so the same file can be loaded again
    event.target.value = '';
  }

  // Function to validate project data structure
  function validateProjectData(data) {
    if (!data || typeof data !== 'object') return false;

    // Check for required properties
    const requiredProps = ['tasks'];
    for (const prop of requiredProps) {
      if (!data[prop]) return false;
    }

    // Validate tasks array
    if (!Array.isArray(data.tasks)) return false;

    // Basic task validation
    for (const task of data.tasks) {
      if (!task.id || !task.text) return false;
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


  const items = [
   {
    id: "save-project",
    comp: "button",
    icon: "wxi-download",
    text: "Save project",
    type: "primary",
    handler: downloadProjectData,
   },
   {
    id: "load-project",
    comp: "button",
    icon: "wxi-upload",
    text: "Load project",
    type: "primary",
    handler: triggerFileLoad,
   },
  ];

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

  	const markers = [
		{
			start: new Date(2023, 11, 6),
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
          <Field label="Start" position="left">
            {#snippet children({ id })}
              <DatePicker bind:value={start} {id} />
            {/snippet}
          </Field>
          <Field label="End" position="left">
            {#snippet children({ id })}
              <DatePicker bind:value={end} {id} />
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
      {markers}
      tasks={currentData.tasks}
      links={currentData.links}
      scales={currentData.scales}
      columns={currentData.columns}
      taskTypes={currentData.taskTypes}
      {highlightTime}
    />
    </Fullscreen>
    <Editor {api} />
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