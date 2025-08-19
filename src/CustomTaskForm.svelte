// Enhanced CustomTaskForm.svelte with proper ID handling

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

	// Get all props from parent component
	let { task, taskTypes, onaction, allTasks = [], allLinks = [] } = $props();

	let node = $state(),
		left = $state(),
		top = $state();

	// Store original ID to track changes
	let originalId = $state(task?.id);

	onMount(() => {
		left = (window.innerWidth - node.offsetWidth) / 2;
		top = (window.innerHeight - node.offsetHeight) / 2;
		originalId = task?.id;
	});

	function deleteTask() {
		onaction && onaction({ action: "delete-task", data: { id: task.id } });
		onaction && onaction({ action: "close-form" });
	}

	function onClose() {
		onaction && onaction({ action: "close-form" });
	}

	// Enhanced ID handling function
	function handleIdChange(newId) {
		const oldId = task.id;
		console.log(`Attempting to change ID from ${oldId} to ${newId}`);

		// Check if the new ID is different and valid
		if (newId && newId !== oldId) {
			// Use the custom action to handle ID updates properly
			onaction && onaction({
				action: "update-task-id",
				data: {
					oldId: oldId,
					newId: newId,
					task: { ...task, id: newId }
				}
			});
		}
	}

	function handleChange({ value }, key) {
		console.log(`Handling change: ${key} = ${value}`);

		// Special handling for ID changes
		if (key === "id") {
			handleIdChange(value);
			return; // Don't continue with normal update
		}

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

	// Task type options
	const typeOptions = taskTypes?.map(type => ({
		id: type.id,
		label: type.label
	})) || [
		{ id: "task", label: "Task" },
		{ id: "summary", label: "Summary task" },
		{ id: "milestone", label: "Milestone" },
		{ id: "urgent", label: "Urgent" },
	];

	// Link type options
	const linkTypeOptions = [
		{ id: "e2s", label: "End to Start (Finish-to-Start)" },
		{ id: "s2s", label: "Start to Start" },
		{ id: "e2e", label: "End to End (Finish-to-Finish)" },
		{ id: "s2e", label: "Start to End (Start-to-Finish)" },
	];

	// Link type options (following SVAR Gantt pattern)
	const linkTypes = [
		{ id: "e2s", label: "End to Start (FS)" },
		{ id: "s2s", label: "Start to Start (SS)" },
		{ id: "e2e", label: "End to End (FF)" },
		{ id: "s2e", label: "Start to End (SF)" },
	];

	// Get links data similar to SVAR Gantt Links component
	let linksData = $derived(() => {
		if (!task?.id || !allLinks || !allTasks) {
			console.log("No links data available:", { 
				taskId: task?.id, 
				allLinksCount: allLinks?.length || 0, 
				allTasksCount: allTasks?.length || 0 
			});
			return [];
		}
		
		const taskId = task.id;
		console.log(`Finding links for task ${taskId}:`);
		console.log("All links:", allLinks);
		
		const incoming = allLinks.filter(link => {
			console.log(`Checking link ${link.id}: source=${link.source}, target=${link.target}, matches target? ${link.target === taskId}`);
			return link.target === taskId;
		});
		const outgoing = allLinks.filter(link => {
			console.log(`Checking link ${link.id}: source=${link.source}, target=${link.target}, matches source? ${link.source === taskId}`);
			return link.source === taskId;
		});
		
		console.log(`Found ${incoming.length} incoming and ${outgoing.length} outgoing links for task ${taskId}`);
		
		const result = [];
		
		if (incoming.length > 0) {
			result.push({
				label: "Incoming Dependencies",
				data: incoming.map(link => ({
					link,
					task: allTasks.find(t => t.id === link.source) || { text: `Task ${link.source}` }
				}))
			});
		}
		
		if (outgoing.length > 0) {
			result.push({
				label: "Outgoing Dependencies", 
				data: outgoing.map(link => ({
					link,
					task: allTasks.find(t => t.id === link.target) || { text: `Task ${link.target}` }
				}))
			});
		}
		
		console.log("Final linksData result:", result);
		return result;
	});

	// Handle link type change (following SVAR pattern)
	function onChange(e, linkId) {
		const newType = e.value;
		console.log(`Changing link ${linkId} type to ${newType}`);
		
		// Send update action directly (following SVAR pattern)
		onaction && onaction({
			action: "update-link",
			data: { id: linkId, link: { type: newType } }
		});
	}

	// Handle link deletion
	function deleteLink(linkId) {
		if (confirm("Are you sure you want to delete this dependency?")) {
			console.log(`Deleting link ${linkId}`);
			
			onaction && onaction({
				action: "delete-link",
				data: { id: linkId }
			});
		}
	}

	// Helper function to check if ID is temporary
	function isTemporaryId(id) {
		return typeof id === 'string' && id.startsWith('temp://');
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="backdrop">
	<div class="modal" style="left:{left}px;top:{top}px" bind:this={node}>
		<div class="header">
			<h3 class="title">Edit Task</h3>
			{#if isTemporaryId(task?.id)}
				<span class="temp-id-badge">Temporary ID</span>
			{/if}
			<i class="close wxi-close" onclick={onClose}></i>
		</div>
		<div class="body">
			<!-- Task ID - Display only, not editable -->
			<Field label="Task ID">
				{#snippet children({ id })}
					<div class="id-display-container">
						<div class="id-display {isTemporaryId(task?.id) ? 'temp-id-display' : 'permanent-id-display'}">
							{task?.id || "No ID"}
						</div>
						{#if isTemporaryId(task?.id)}
							<small class="id-help">
								This is a temporary ID. It will be converted to a permanent ID when you save and reload the project.
							</small>
						{:else}
							<small class="id-help">
								Task IDs cannot be changed after creation.
							</small>
						{/if}
					</div>
				{/snippet}
			</Field>

			<!-- Rest of your existing form fields... -->
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

			<!-- Link Dependencies Section (following SVAR Gantt pattern) -->
			{#if linksData.length > 0}
				<div class="links-section">
					<h4 class="section-title">Task Dependencies</h4>
					
					{#each linksData as links}
						{#if links.data.length}
							<div class="links-group">
								<h5>{links.label}:</h5>
								
								{#each links.data as obj}
									<div class="link-item">
										<div class="link-info">
											<strong>{obj.task.text || ""}</strong>
										</div>
										<div class="link-controls">
											<Field label="Type">
												{#snippet children({ id })}
													<Select
														{id}
														value={obj.link.type}
														options={linkTypes}
														onchange={(e) => onChange(e, obj.link.id)}
													/>
												{/snippet}
											</Field>
											<button 
												class="button small danger" 
												onclick={() => deleteLink(obj.link.id)}
												title="Delete dependency"
											>
												×
											</button>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					{/each}
				</div>
			{:else}
				<div class="links-section">
					<h4 class="section-title">Task Dependencies</h4>
					<div class="no-links">
						<p>This task has no dependencies.</p>
						<small>Dependencies can be created by dragging from one task to another in the Gantt chart.</small>
					</div>
				</div>
			{/if}

			<div class="button-group">
				<button class="button primary" onclick={onClose}>Close</button>
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

	.temp-id-badge {
		background: #ff9800;
		color: white;
		padding: 2px 8px;
		border-radius: 12px;
		font-size: 11px;
		font-weight: 500;
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

	.id-display-container {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.id-display {
		padding: 8px 12px;
		border: 2px solid #e0e0e0;
		border-radius: 4px;
		background: #f8f9fa;
		font-family: monospace;
		font-size: 14px;
		color: #495057;
	}

	.temp-id-display {
		border-color: #ff9800;
		background: #fff3e0;
		color: #f57c00;
	}

	.permanent-id-display {
		border-color: #28a745;
		background: #d4edda;
		color: #155724;
	}

	.id-help {
		color: #666;
		font-size: 12px;
		font-style: italic;
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

	/* Link Dependencies Styles */
	.links-section {
		margin-top: 20px;
		padding-top: 20px;
		border-top: 1px solid #eee;
	}

	.section-title {
		margin: 0 0 15px 0;
		font-size: 16px;
		font-weight: 600;
		color: var(--wx-color-font, #333);
	}

	.links-group {
		margin-bottom: 15px;
	}

	.links-group h5 {
		margin: 0 0 10px 0;
		font-size: 14px;
		font-weight: 500;
		color: var(--wx-color-font, #666);
	}

	.link-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px;
		margin-bottom: 8px;
		border: 1px solid #e0e0e0;
		border-radius: 4px;
		background: #f8f9fa;
	}

	.link-info {
		display: flex;
		align-items: center;
		gap: 8px;
		flex: 1;
	}

	.link-arrow {
		color: #666;
		font-weight: bold;
	}

	.link-controls {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.button.small {
		padding: 5px 10px;
		font-size: 12px;
		min-width: auto;
		flex: none;
	}

	.no-links {
		text-align: center;
		padding: 20px;
		color: #666;
	}

	.no-links p {
		margin: 0 0 5px 0;
	}

	.no-links small {
		color: #999;
		font-style: italic;
	}
</style>