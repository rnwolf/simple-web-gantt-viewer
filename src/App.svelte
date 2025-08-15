<script>
  import { getData } from "./data.js";
  import { Gantt, Willow, Tooltip, ContextMenu, Editor, defaultEditorItems, Toolbar, Fullscreen   } from "wx-svelte-gantt";
  import { DatePicker, Field, Locale, Switch } from "wx-svelte-core";

  import "./gantt-styles.css";
  import MyTooltipContent from "./MyTooltipContent.svelte";


  const data = getData();
  let api = $state();

  let start = $state(new Date(2024, 11, 6)),
		end = $state(new Date(2024, 11, 29)),
		autoScale = $state(false);

  const items = [
   {
    id: "save-project",
    comp: "button",
    icon: "wxi-plus",
    text: "Save project",
    type: "primary",
   },
   {
    id: "add-task",
    comp: "button",
    icon: "wxi-plus",
    text: "Add task",
    type: "primary",
   },
   {
    id: "edit-task",
    comp: "button",
    icon: "wxi-edit",
    text: "edit",
    type: "link",
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

  // Add some debugging
  console.log("Gantt data:", data);
  console.log("Tasks:", data.tasks);
  console.log("Links:", data.links);
</script>

<main>
  <h1>Simple Gantt Viewer</h1>

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


  <div class="gantt-container">
    <Willow>
    <ContextMenu {api}>
    <Tooltip {api}  content={MyTooltipContent}>
    <Toolbar {api} {items} />
    <Fullscreen hotkey="ctrl+shift+f">
    <Gantt
      bind:this={api}
      {markers}
      tasks={data.tasks}
      links={data.links}
      scales={data.scales}
      columns={data.columns}
      taskTypes={data.taskTypes}
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