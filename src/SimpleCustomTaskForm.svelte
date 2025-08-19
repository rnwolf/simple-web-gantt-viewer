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

  // Props
  let { task, taskTypes, allTasks = [], allLinks = [], onaction } = $props();

  let node = $state(),
    left = $state(),
    top = $state();

  onMount(() => {
    left = (window.innerWidth - node.offsetWidth) / 2;
    top = (window.innerHeight - node.offsetHeight) / 2;
  });

  function deleteTask() {
    onaction && onaction({ action: "delete-task", data: { id: task.id } });
  }

  function onClose() {
    onaction && onaction({ action: "close-form" });
  }

  function handleChange({ value }, key) {
    console.log(`Handling change: ${key} = ${value}`);

    // Handle numeric fields
    if (key === "duration" || key === "optimistic" || key === "pessimistic") {
      value = parseInt(value) || 0;
    }

    // Update the task object
    const updatedTask = {
      ...task,
      [key]: value,
    };

    // Handle milestone type
    if (key === "type" && value === "milestone") {
      updatedTask.duration = 0;
      delete updatedTask.end;
    }

    // Recalculate end date when duration or start date changes
    if (key === "duration" || key === "start") {
      if (updatedTask.start && updatedTask.duration && updatedTask.duration > 0) {
        const startDate = new Date(updatedTask.start);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + parseInt(updatedTask.duration));
        updatedTask.end = endDate;
      }
    }

    // Recalculate duration when end date changes
    if (key === "end" && updatedTask.start && updatedTask.end) {
      const startDate = new Date(updatedTask.start);
      const endDate = new Date(updatedTask.end);
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      updatedTask.duration = Math.max(1, diffDays);
    }

    // Send update immediately
    onaction && onaction({
      action: "update-task",
      data: { id: task.id, task: updatedTask },
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
  ];

  // Link type options
  const linkTypes = [
    { id: "e2s", label: "End to Start (FS)" },
    { id: "s2s", label: "Start to Start (SS)" },
    { id: "e2e", label: "End to End (FF)" },
    { id: "s2e", label: "Start to End (SF)" },
  ];

  // Get links for this task
  let taskLinks = $derived(() => {
    if (!task?.id || !allLinks || !allTasks) {
      console.log("No data for links:", { taskId: task?.id, linksCount: allLinks?.length, tasksCount: allTasks?.length });
      return [];
    }

    const taskId = task.id;
    console.log(`Finding links for task ${taskId}`);
    console.log("All links:", allLinks);

    const incoming = allLinks.filter(link => link.target === taskId);
    const outgoing = allLinks.filter(link => link.source === taskId);

    console.log(`Found ${incoming.length} incoming and ${outgoing.length} outgoing links`);

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

    console.log("Final taskLinks result:", result);
    return result;
  });

  // Handle link type change
  function onLinkChange(e, linkId) {
    const newType = e.value;
    console.log(`Changing link ${linkId} type to ${newType}`);

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
      <!-- Task Name -->
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

      <!-- Description -->
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

      <!-- Start Date -->
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
        <!-- Duration -->
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

        <!-- End Date -->
        <Field label="End Date">
          {#snippet children({ id })}
            <DatePicker
              {id}
              value={task?.end}
              onchange={ev => handleChange(ev, "end")}
            />
          {/snippet}
        </Field>

        <!-- Progress -->
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

      <!-- Resources -->
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

      <!-- Task Dependencies -->
      {#if taskLinks.length > 0}
        <div class="links-section">
          <h4 class="section-title">Task Dependencies</h4>

          {#each taskLinks as links}
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
                            onchange={(e) => onLinkChange(e, obj.link.id)}
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
