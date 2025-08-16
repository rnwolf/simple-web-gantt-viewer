<script>
	import { onMount } from "svelte";
	import {
		Field,
		Text,
		TextArea,
		Select,
		Slider,
		DatePicker,
	} from "wx-svelte-core";

	let { task, taskTypes, onaction } = $props();

	let node = $state(),
		left = $state(),
		top = $state();

	onMount(() => {
		left = (window.innerWidth - node.offsetWidth) / 2;
		top = (window.innerHeight - node.offsetHeight) / 2;
	});

	function deleteTask() {
		onaction && onaction({ action: "delete-task", data: { id: task.id } });
		onaction && onaction({ action: "close-form" });
	}

	function onClose() {
		onaction && onaction({ action: "close-form" });
	}

	function handleChange({ value }, key) {
		console.log(`Handling change: ${key} = ${value}`);

		if (key === "type" && value === "milestone") {
			delete task.end;
			task.duration = 0;
		} else if (task.start > task.end) {
			task.start = task.end;
			task.duration = 1;
			task.end = 0;
		}

		// Handle numeric fields - convert string input to numbers
		if (key === "duration" || key === "optimistic" || key === "pessimistic") {
			value = parseInt(value) || 0;
		}

		// Handle ID changes - ensure it's a string or number
		if (key === "id") {
			// Convert to number if it's numeric, otherwise keep as string
			value = isNaN(value) ? value : parseInt(value);
		}

		// Update the task object
		task = {
			...task,
			[key]: value,
		};

		// Recalculate end date when duration or start date changes
		if (key === "duration" || key === "start") {
			if (task.start && task.duration && task.duration > 0) {
				const startDate = new Date(task.start);
				const endDate = new Date(startDate);
				endDate.setDate(startDate.getDate() + parseInt(task.duration));

				task = {
					...task,
					end: endDate
				};

				console.log(`Recalculated end date: ${endDate} (start: ${startDate}, duration: ${task.duration})`);
			}
		}

		// Recalculate duration when start or end date changes
		if (key === "end" && task.start && task.end) {
			const startDate = new Date(task.start);
			const endDate = new Date(task.end);
			const diffTime = endDate.getTime() - startDate.getTime();
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

			task = {
				...task,
				duration: Math.max(1, diffDays) // Minimum 1 day duration
			};

			console.log(`Recalculated duration: ${task.duration} days`);
		}

		console.log("Updated task:", task);

		// Send update immediately when field changes
		onaction &&
			onaction({
				action: "update-task",
				data: { id: task.id, task },
			});
	}

	// Task type options - make sure this matches your taskTypes from data.js
	const typeOptions = taskTypes?.map(type => ({
		id: type.id,
		label: type.label
	})) || [
		{ id: "task", label: "Task" },
		{ id: "summary", label: "Summary task" },
		{ id: "milestone", label: "Milestone" },
		{ id: "urgent", label: "Urgent" },
	];
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="backdrop">
	<div class="modal" style="left:{left}px;top:{top}px" bind:this={node}>
		<div class="header">
			<h3 class="title">Edit Task</h3>
			<i class="close wxi-close" onclick={onClose}></i>
		</div>
		<div class="body">
			<!-- Task ID - Make it editable -->
			<Field label="Task ID">
				{#snippet children({ id })}
					<Text
						{id}
						value={task?.id || ""}
						placeholder="Enter task ID"
						onchange={ev => handleChange(ev, "id")}
					/>
				{/snippet}
			</Field>

			<!-- Basic Task Information -->
			<Field label="Task Name">
				{#snippet children({ id })}
					<Text
						{id}
						focus={true}
						value={task?.text || ""}
						onchange={ev => handleChange(ev, "text")}
					/>
				{/snippet}
			</Field>

			<Field label="Description">
				{#snippet children({ id })}
					<TextArea
						{id}
						value={task?.details || ""}
						onchange={ev => handleChange(ev, "details")}
					/>
				{/snippet}
			</Field>

			<!-- Task Type -->
			<Field label="Task Type">
				{#snippet children({ id })}
					<Select
						{id}
						value={task?.type || "task"}
						options={typeOptions}
						onchange={ev => handleChange(ev, "type")}
					/>
				{/snippet}
			</Field>

			<!-- Dates and Duration -->
			<Field label="Start Date">
				{#snippet children({ id })}
					<DatePicker
						{id}
						value={task?.start}
						onchange={ev => handleChange(ev, "start")}
					/>
				{/snippet}
			</Field>

			{#if task?.type !== "milestone"}
				<Field label="Duration (days)">
					{#snippet children({ id })}
						<Text
							{id}
							value={task?.duration || 1}
							type="number"
							onchange={ev => handleChange(ev, "duration")}
						/>
					{/snippet}
				</Field>

				<Field label="End Date">
					{#snippet children({ id })}
						<DatePicker
							{id}
							value={task?.end}
							onchange={ev => handleChange(ev, "end")}
						/>
					{/snippet}
				</Field>

				<Field label="Progress: {task?.progress || 0}%">
					{#snippet children({ id })}
						<Slider
							{id}
							value={task?.progress || 0}
							min={0}
							max={100}
							onchange={ev => handleChange(ev, "progress")}
						/>
					{/snippet}
				</Field>
			{/if}

			<!-- Custom Fields for Your Project -->
			<Field label="Resources">
				{#snippet children({ id })}
					<Text
						{id}
						value={task?.resources || ""}
						placeholder="e.g., R001, R002"
						onchange={ev => handleChange(ev, "resources")}
					/>
				{/snippet}
			</Field>

			{#if task?.type !== "milestone"}
				<Field label="Optimistic Estimate (days)">
					{#snippet children({ id })}
						<Text
							{id}
							value={task?.optimistic || task?.duration || 1}
							type="number"
							onchange={ev => handleChange(ev, "optimistic")}
						/>
					{/snippet}
				</Field>

				<Field label="Pessimistic Estimate (days)">
					{#snippet children({ id })}
						<Text
							{id}
							value={task?.pessimistic || task?.duration || 1}
							type="number"
							onchange={ev => handleChange(ev, "pessimistic")}
						/>
					{/snippet}
				</Field>
			{/if}

			<!-- Action Buttons -->
			<div class="button-group">
				<button class="button primary" onclick={onClose}>Save & Close</button>
				<button class="button danger" onclick={deleteTask}>Delete Task</button>
			</div>
		</div>
	</div>
</div>

<style>
	.backdrop {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		z-index: 5;
		background: var(--wx-modal-backdrop, rgba(0, 0, 0, 0.5));
	}

	.modal {
		position: relative;
		width: 400px;
		max-height: 80vh;
		overflow-y: auto;
		padding: 20px;
		border-radius: 8px;
		box-shadow:
			0 4px 4px rgba(0, 0, 0, 0.12),
			0 0 10px rgba(0, 0, 0, 0.06);
		background-color: var(--wx-background, white);
		font-family: var(--wx-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
		font-size: var(--wx-font-size, 14px);
		color: var(--wx-color-font, #333);
	}

	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		border-bottom: 1px solid #eee;
		padding-bottom: 10px;
	}

	.title {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
	}

	.close {
		cursor: pointer;
		font-weight: 700;
		font-size: 16px;
		transition: color 0.15s ease-in;
		padding: 5px;
	}

	.close:hover {
		color: rgb(255, 122, 122);
	}

	.body {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	.button-group {
		display: flex;
		gap: 10px;
		margin-top: 20px;
		padding-top: 15px;
		border-top: 1px solid #eee;
	}

	.button {
		flex: 1;
		padding: 10px 15px;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-family: var(--wx-font-family, inherit);
		font-size: var(--wx-font-size, 14px);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.button:focus {
		outline: none;
		opacity: 0.8;
	}

	.button:hover {
		opacity: 0.9;
	}

	.primary {
		background-color: var(--wx-color-primary, #007bff);
		color: white;
		border-color: var(--wx-color-primary, #007bff);
	}

	.danger {
		color: var(--wx-color-danger-font, white);
		background-color: var(--wx-color-danger, #dc3545);
		border-color: var(--wx-color-danger, #dc3545);
	}
</style>