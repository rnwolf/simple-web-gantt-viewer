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

  let start = $state(new Date(2023, 11, 1)),  // Remember in Java script months start at zero
		end = $state(new Date(2023, 11, 29)),
    today = $state(new Date(2023, 11, 12)),
		autoScale = $state(false);

  console.log("Latest start date:", start);

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
        taskTypes: currentData.taskTypes,
        markers: currentData.markers,
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
        console.log('currentData updated successfully')

        // Clear the Gantt and reload with new data
        // if (api) {
        //   api.parse(processedData);
        // }

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
    console.log("=== VALIDATION DEBUG START ===");
    console.log("Data to validate:", data);
    console.log("Data type:", typeof data);
    console.log("Data is null?", data === null);
    console.log("Data is undefined?", data === undefined);

    if (!data || typeof data !== 'object') {
      console.log("❌ Validation failed: data is not an object");
      console.log("Data value:", data);
      return false;
    }

    console.log("✅ Data is object, checking required properties...");
    console.log("All available properties:", Object.keys(data));

    // Check for required properties
    const requiredProps = ['tasks'];
    for (const prop of requiredProps) {
      console.log(`🔍 Checking for property: ${prop}`);
      console.log(`Property exists?`, prop in data);
      console.log(`Property truthy?`, !!data[prop]);

      if (!data[prop]) {
        console.log(`❌ Validation failed: missing or falsy property ${prop}`);
        console.log(`Property value:`, data[prop]);
        console.log(`Property type:`, typeof data[prop]);
        console.log(`Available properties:`, Object.keys(data));
        return false;
      }
      console.log(`✅ Property ${prop} found and truthy`);
    }

    // Validate tasks array
    console.log("🔍 Validating tasks array...");
    console.log("Tasks value:", data.tasks);
    console.log("Tasks type:", typeof data.tasks);
    console.log("Is array?", Array.isArray(data.tasks));

    if (!Array.isArray(data.tasks)) {
      console.log("❌ Validation failed: tasks is not an array");
      console.log("Tasks actual type:", typeof data.tasks);
      console.log("Tasks value:", data.tasks);
      return false;
    }

    console.log(`✅ Tasks is array with ${data.tasks.length} items`);

    // Basic task validation - check each task
    for (let i = 0; i < data.tasks.length; i++) {
      const task = data.tasks[i];
      console.log(`🔍 Validating task ${i}:`, task);
      console.log(`Task ${i} type:`, typeof task);
      console.log(`Task ${i} keys:`, Object.keys(task || {}));

      if (!task) {
        console.log(`❌ Task ${i} validation failed: task is null/undefined`);
        return false;
      }

      if (typeof task !== 'object') {
        console.log(`❌ Task ${i} validation failed: task is not an object`);
        console.log(`Task ${i} type:`, typeof task);
        console.log(`Task ${i} value:`, task);
        return false;
      }

      console.log(`Task ${i} id:`, task.id, `(type: ${typeof task.id})`);
      console.log(`Task ${i} text:`, task.text, `(type: ${typeof task.text})`);

      if (!task.id) {
        console.log(`❌ Task ${i} validation failed: missing or falsy id`);
        console.log(`Task ${i} id value:`, task.id);
        console.log(`Task ${i} id type:`, typeof task.id);
        return false;
      }

      if (!task.text) {
        console.log(`❌ Task ${i} validation failed: missing or falsy text`);
        console.log(`Task ${i} text value:`, task.text);
        console.log(`Task ${i} text type:`, typeof task.text);
        return false;
      }

      console.log(`✅ Task ${i} validation passed`);
    }

    // Additional debugging for other properties
    console.log("🔍 Other properties in data:");
    console.log("- metadata:", data.metadata);
    console.log("- links:", data.links);
    console.log("- scales:", data.scales);
    console.log("- columns:", data.columns);
    console.log("- taskTypes:", data.taskTypes);
    console.log("- markers:", data.markers);

    console.log("=== VALIDATION DEBUG END - SUCCESS ===");
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
              <DatePicker bind:value={start} {id} format={"%Y/%m/%d"}/>
            {/snippet}
          </Field>
          <Field label="End" position="left">
            {#snippet children({ id })}
              <DatePicker bind:value={end} {id} format={"%Y/%m/%d"}/>
            {/snippet}
          </Field>
          <Field label="Today" position="left">
            {#snippet children({ id })}
              <DatePicker bind:value={today} {id} format={"%Y/%m/%d"}/>
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
      markers={currentData.markers}
      tasks={currentData.tasks}
      links={currentData.links}
      scales={currentData.scales}
      columns={currentData.columns}
      taskTypes={currentData.taskTypes}
      {highlightTime}
      {autoScale}
			zoom
			{start}
			{end}
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