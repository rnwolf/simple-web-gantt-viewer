// Simple and clean download function using the flattening approach

// Enhanced download function with data structure flattening and ID cleanup
function downloadProjectDataWithCleanup() {
  console.log("downloadProjectData with structure flattening and ID cleanup called");

  try {
    // Get current data from SVAR Gantt
    let currentTasks;
    if (api && api.serialize) {
      currentTasks = api.serialize();
    } else {
      currentTasks = currentData.tasks;
    }

    console.log("=== STARTING PROJECT EXPORT ===");
    console.log(`Raw SVAR data: ${currentTasks.length} top-level tasks`);

    // Step 1: Flatten the nested structure to clean parent-child format
    const flattenedTasks = flattenProjectData(currentTasks);

    // Step 2: Clean up temporary IDs
    const { tasks: cleanedTasks, idMapping, hasChanges } = cleanupTemporaryIds(flattenedTasks);

    // Step 3: Clean up links if IDs were changed
    const cleanedLinks = cleanupLinksIds(currentData.links, idMapping);

    // Step 4: Create clean project data
    const projectData = {
      metadata: {
        projectName: "Simple Gantt Project",
        exportDate: new Date().toISOString(),
        version: "1.0.0",
        cleanedIds: hasChanges,
        flattenedStructure: true
      },
      tasks: cleanedTasks,
      links: cleanedLinks,
      scales: currentData.scales,
      columns: currentData.columns,
      taskTypes: currentData.taskTypes,
      markers: currentData.markers,
    };

    console.log("=== FINAL PROJECT DATA ===");
    console.log(`Final tasks: ${cleanedTasks.length}`);
    console.log("Task structure:", cleanedTasks.map(t => `${t.id} (${t.text}) parent=${t.parent || 'none'}`));
    console.log(`Links: ${cleanedLinks.length}`);
    console.log(`Temporary IDs cleaned: ${hasChanges}`);

    // Create and download file
    const jsonString = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = hasChanges
      ? `gantt-project-cleaned-${new Date().toISOString().split('T')[0]}.json`
      : `gantt-project-flattened-${new Date().toISOString().split('T')[0]}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const successMessage = hasChanges
      ? `Project saved successfully!\n\n✅ Flattened structure (no nested data arrays)\n✅ Cleaned ${idMapping.size} temporary IDs\n✅ Updated ${cleanedLinks.filter(l => idMapping.has(l.source) || idMapping.has(l.target)).length} links\n\nPerfect for 3rd party systems!`
      : 'Project saved with flattened structure!\n\n✅ Clean parent-child relationships\n✅ No nested data arrays\n\nPerfect for 3rd party systems!';

    alert(successMessage);

  } catch (error) {
    console.error('Error downloading project data:', error);
    alert(`Error saving project data: ${error.message}`);
  }
}
