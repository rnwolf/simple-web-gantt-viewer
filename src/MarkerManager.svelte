<script>
  import { DatePicker, Field, Locale, Willow } from "wx-svelte-core";

  let { markers = [], onaction } = $props();

  let editingMarker = $state(null);
  let showAddForm = $state(false);
  let newMarker = $state({ text: "", start: new Date(), css: "" });

  // Marker types with predefined CSS classes
  const markerTypes = [
    { id: "", label: "Default", css: "" },
    { id: "start", label: "Start Marker", css: "myStartClass" },
    { id: "today", label: "Today Marker", css: "myMiddleClass" },
    { id: "end", label: "End Marker", css: "myEndClass" },
    { id: "milestone", label: "Milestone", css: "myMilestoneClass" },
    { id: "deadline", label: "Deadline", css: "myDeadlineClass" }
  ];

  function addMarker() {
    if (!newMarker.text.trim()) {
      alert("Please enter a marker name");
      return;
    }

    const marker = {
      text: newMarker.text.trim(),
      start: new Date(newMarker.start),
      css: newMarker.css || ""
    };

    onaction(new CustomEvent("action", {
      detail: {
        action: "add",
        data: { marker }
      }
    }));

    // Reset form
    newMarker = { text: "", start: new Date(), css: "" };
    showAddForm = false;
  }

  function editMarker(marker) {
    editingMarker = { ...marker };
  }

  function saveMarker() {
    if (!editingMarker.text.trim()) {
      alert("Please enter a marker name");
      return;
    }

    onaction(new CustomEvent("action", {
      detail: {
        action: "update",
        data: {
          id: editingMarker.id,
          marker: {
            ...editingMarker,
            text: editingMarker.text.trim(),
            start: new Date(editingMarker.start)
          }
        }
      }
    }));

    editingMarker = null;
  }

  function deleteMarker(markerId) {
    if (confirm("Are you sure you want to delete this marker?")) {
      onaction(new CustomEvent("action", {
        detail: {
          action: "delete",
          data: { id: markerId }
        }
      }));
    }
  }

  function cancelEdit() {
    editingMarker = null;
    showAddForm = false;
    newMarker = { text: "", start: new Date(), css: "" };
  }

  function closeManager() {
    onaction(new CustomEvent("action", {
      detail: {
        action: "close"
      }
    }));
  }
</script>

<div class="marker-manager-overlay">
  <Willow>
    <Locale>
      <div class="marker-manager">

        <div class="marker-header">
          <h3>📍 Manage Project Markers</h3>
          <button class="close-btn" onclick={closeManager}>×</button>
        </div>

        <div class="marker-content">
          <!-- Existing Markers List -->
          <div class="markers-list">
            <h4>Current Markers ({markers.length})</h4>

            {#if markers.length === 0}
              <p class="no-markers">No markers defined. Add your first marker below.</p>
            {:else}
              <div class="marker-items">
                {#each markers as marker, index}
                  <div class="marker-item" class:editing={editingMarker?.id === marker.id}>
                    {#if editingMarker?.id === marker.id}
                      <!-- Edit Form -->
                      <div class="edit-form">
                        <Field label="Marker Name">
                          <input
                            type="text"
                            bind:value={editingMarker.text}
                            placeholder="Enter marker name"
                            class="marker-input"
                          />
                        </Field>

                        <Field label="Type/Style">
                          <select bind:value={editingMarker.css} class="marker-select">
                            {#each markerTypes as type}
                              <option value={type.css}>{type.label}</option>
                            {/each}
                          </select>
                        </Field>

                        <Field label="Date">
                          {#snippet children({ id })}
                            <DatePicker
                              bind:value={editingMarker.start}
                              format="%Y-%m-%d"
                              editable={true}
                              {id}
                            />
                          {/snippet}
                        </Field>

                        <div class="edit-actions">
                          <button class="save-btn" onclick={saveMarker}>💾 Save</button>
                          <button class="cancel-btn" onclick={cancelEdit}>❌ Cancel</button>
                        </div>
                      </div>
                    {:else}
                      <!-- Display Form -->
                      <div class="marker-display">
                        <div class="marker-info">
                          <div class="marker-name">{marker.text}</div>
                          <div class="marker-date">{marker.start?.toLocaleDateString() || 'Invalid Date'}</div>
                          {#if marker.css}
                            <div class="marker-type">Style: {markerTypes.find(t => t.css === marker.css)?.label || 'Custom'}</div>
                          {/if}
                        </div>
                        <div class="marker-actions">
                          <button class="edit-btn" onclick={() => editMarker(marker)}>✏️ Edit</button>
                          <button class="delete-btn" onclick={() => deleteMarker(marker.id)}>🗑️ Delete</button>
                        </div>
                      </div>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Add New Marker -->
          <div class="add-marker-section">
            <div class="add-header">
              <h4>Add New Marker</h4>
              <button class="toggle-add" onclick={() => showAddForm = !showAddForm}>
                {showAddForm ? '➖ Hide' : '➕ Add Marker'}
              </button>
            </div>

            {#if showAddForm}
              <div class="add-form">
                <Field label="Marker Name">
                  <input
                    type="text"
                    bind:value={newMarker.text}
                    placeholder="e.g., Phase 1 Complete, Review Deadline"
                    class="marker-input"
                  />
                </Field>

                <Field label="Type/Style">
                  <select bind:value={newMarker.css} class="marker-select">
                    {#each markerTypes as type}
                      <option value={type.css}>{type.label}</option>
                    {/each}
                  </select>
                </Field>

                <Field label="Date">
                  {#snippet children({ id })}
                    <DatePicker
                      bind:value={newMarker.start}
                      format="%Y-%m-%d"
                      editable={true}
                      {id}
                    />
                  {/snippet}
                </Field>

                <div class="form-actions">
                  <button class="add-btn" onclick={addMarker}>➕ Add Marker</button>
                  <button class="cancel-btn" onclick={cancelEdit}>❌ Cancel</button>
                </div>
              </div>
            {/if}
          </div>
        </div> <!-- End of marker-content -->
      </div> <!-- End of marker-manager -->
    </Locale>
  </Willow>
</div>

<style>
  .marker-manager-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 300px;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px; /* Add padding to prevent modal from touching edges */
    box-sizing: border-box;
  }

  .marker-manager {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 600px;
    max-height: 80vh;
    overflow: visible; /* Changed from hidden to allow calendar to show */
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .marker-header {
    background: #f8f9fa;
    padding: 15px 20px;
    border-bottom: 1px solid #e9ecef;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .marker-header h3 {
    margin: 0;
    color: #333;
    font-size: 1.2em;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
  }

  .close-btn:hover {
    background: #e9ecef;
  }

  .marker-content {
    padding: 20px;
    overflow-y: auto;
    flex: 1;
    position: relative;
  }

  .markers-list h4,
  .add-header h4 {
    color: #333;
    margin: 0 0 15px 0;
    font-size: 1.1em;
  }

  .no-markers {
    color: #666;
    font-style: italic;
    text-align: center;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 4px;
  }

  .marker-items {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .marker-item {
    border: 1px solid #e9ecef;
    border-radius: 6px;
    padding: 15px;
    background: #f8f9fa;
  }

  .marker-item.editing {
    border-color: #007bff;
    background: #e3f2fd;
  }

  .marker-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .marker-info {
    flex: 1;
  }

  .marker-name {
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }

  .marker-date {
    color: #666;
    font-size: 0.9em;
  }

  .marker-type {
    color: #007bff;
    font-size: 0.8em;
    margin-top: 2px;
  }

  .marker-actions {
    display: flex;
    gap: 8px;
  }

  .edit-btn, .delete-btn, .save-btn, .cancel-btn, .add-btn, .toggle-add {
    padding: 6px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
    transition: background-color 0.2s;
  }

  .edit-btn {
    background: #007bff;
    color: white;
  }

  .edit-btn:hover {
    background: #0056b3;
  }

  .delete-btn {
    background: #dc3545;
    color: white;
  }

  .delete-btn:hover {
    background: #c82333;
  }

  .save-btn, .add-btn {
    background: #28a745;
    color: white;
  }

  .save-btn:hover, .add-btn:hover {
    background: #218838;
  }

  .cancel-btn {
    background: #6c757d;
    color: white;
  }

  .cancel-btn:hover {
    background: #5a6268;
  }

  .toggle-add {
    background: #17a2b8;
    color: white;
  }

  .toggle-add:hover {
    background: #138496;
  }

  .add-marker-section {
    margin-top: 25px;
    padding-top: 20px;
    border-top: 1px solid #e9ecef;
  }

  .add-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .edit-form, .add-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .marker-input, .marker-select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
  }

  .marker-input:focus, .marker-select:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }

  .edit-actions, .form-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  /* Ensure calendar dropdown appears above modal overlay */
  :global(.wx-popup.wx-calendar) {
    z-index: 1100 !important;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .marker-manager {
      width: 95%;
      max-height: 90vh;
    }

    .marker-display {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .marker-actions {
      align-self: flex-end;
    }
  }
</style>
