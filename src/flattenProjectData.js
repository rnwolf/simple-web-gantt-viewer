// Utility functions for flattening SVAR Gantt data structure

/**
 * Flattens nested task data structure to clean parent-child relationships
 * Removes duplicate tasks and internal SVAR properties
 */
export function flattenProjectData(currentTasks) {
  console.log("=== FLATTENING NESTED STRUCTURE ===");
  
  // Step 1: Recursively extract all tasks from nested data arrays
  function flattenTasksRecursively(tasks, allTasks = []) {
    tasks.forEach(task => {
      // Create clean task without nested data arrays
      const cleanTask = { ...task };
      delete cleanTask.data; // Remove nested data array
      
      // Remove SVAR internal properties that shouldn't be saved
      delete cleanTask.$level;
      delete cleanTask.$x;
      delete cleanTask.$y;
      delete cleanTask.$w;
      delete cleanTask.$h;
      delete cleanTask.$skip;
      delete cleanTask.open; // This can be derived from structure
      
      allTasks.push(cleanTask);
      
      // Recursively process nested tasks if they exist
      if (task.data && Array.isArray(task.data)) {
        flattenTasksRecursively(task.data, allTasks);
      }
    });
    return allTasks;
  }
  
  const flattenedTasks = flattenTasksRecursively(currentTasks);
  console.log(`Flattened ${currentTasks.length} top-level tasks to ${flattenedTasks.length} total tasks`);
  
  // Step 2: Remove duplicates (tasks can appear both at top level and nested)
  const uniqueTasks = [];
  const seenIds = new Set();
  
  flattenedTasks.forEach(task => {
    if (!seenIds.has(task.id)) {
      seenIds.add(task.id);
      uniqueTasks.push(task);
    } else {
      console.log(`Removed duplicate task: ${task.id} (${task.text})`);
    }
  });
  
  console.log(`Removed ${flattenedTasks.length - uniqueTasks.length} duplicate tasks`);
  console.log("Final flattened tasks:", uniqueTasks.map(t => `${t.id} (${t.text}) parent=${t.parent || 'none'}`));
  
  return uniqueTasks;
}

/**
 * Clean up temporary IDs in flattened task structure
 */
export function cleanupTemporaryIds(tasks) {
  console.log("=== CLEANING UP TEMPORARY IDs ===");
  
  // Find temporary IDs
  const tempTasks = tasks.filter(task =>
    typeof task.id === 'string' && task.id.startsWith('temp://')
  );
  
  if (tempTasks.length === 0) {
    console.log("No temporary IDs found");
    return { tasks, idMapping: new Map(), hasChanges: false };
  }
  
  console.log(`Found ${tempTasks.length} temporary IDs:`, tempTasks.map(t => t.id));
  
  // Create ID mapping
  const existingNonTempIds = tasks
    .filter(t => !(typeof t.id === 'string' && t.id.startsWith('temp://')))
    .map(t => t.id);
  
  const numericIds = existingNonTempIds
    .filter(id => typeof id === 'number' || /^\d+$/.test(id))
    .map(id => parseInt(id))
    .filter(id => !isNaN(id));
  
  let nextId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
  
  const idMapping = new Map();
  tempTasks.forEach(task => {
    idMapping.set(task.id, nextId++);
  });
  
  console.log("ID mapping:", Array.from(idMapping.entries()));
  
  // Replace IDs in tasks
  const cleanedTasks = tasks.map(task => {
    const updatedTask = { ...task };
    
    // Replace task ID if it's temporary
    if (idMapping.has(task.id)) {
      const oldId = task.id;
      updatedTask.id = idMapping.get(task.id);
      console.log(`✅ Replaced task ID: ${oldId} → ${updatedTask.id} (${task.text})`);
    }
    
    // Replace parent reference if it's temporary
    if (task.parent && idMapping.has(task.parent)) {
      const oldParent = task.parent;
      updatedTask.parent = idMapping.get(task.parent);
      console.log(`✅ Replaced parent reference: ${oldParent} → ${updatedTask.parent} for task ${task.text}`);
    }
    
    return updatedTask;
  });
  
  // Verify cleanup
  const remainingTempIds = cleanedTasks.filter(task =>
    typeof task.id === 'string' && task.id.startsWith('temp://')
  );
  
  if (remainingTempIds.length > 0) {
    throw new Error(`Failed to clean all temporary IDs. ${remainingTempIds.length} remain: ${remainingTempIds.map(t => t.id)}`);
  }
  
  console.log("✅ All temporary IDs successfully replaced");
  
  return {
    tasks: cleanedTasks,
    idMapping,
    hasChanges: true
  };
}

/**
 * Clean up temporary IDs in links
 */
export function cleanupLinksIds(links, idMapping) {
  if (!links || !idMapping || idMapping.size === 0) {
    return links;
  }
  
  console.log("=== CLEANING UP LINK IDs ===");
  
  return links.map(link => {
    const updatedLink = { ...link };
    
    if (idMapping.has(link.source)) {
      updatedLink.source = idMapping.get(link.source);
      console.log(`✅ Replaced link source: ${link.source} → ${updatedLink.source}`);
    }
    
    if (idMapping.has(link.target)) {
      updatedLink.target = idMapping.get(link.target);
      console.log(`✅ Replaced link target: ${link.target} → ${updatedLink.target}`);
    }
    
    return updatedLink;
  });
}
