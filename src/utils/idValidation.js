// Create a new file: src/utils/idValidation.js

/**
 * Utility functions for handling task ID validation and management
 */

/**
 * Check if an ID is temporary
 */
export function isTemporaryId(id) {
  return typeof id === 'string' && id.startsWith('temp://');
}

/**
 * Check if an ID is valid (not empty, null, or undefined)
 */
export function isValidId(id) {
  return id !== null && id !== undefined && id !== '';
}

/**
 * Generate a unique ID that doesn't conflict with existing ones
 */
export function generateUniqueId(existingIds, preferredId = null) {
  const existingSet = new Set(existingIds);

  // If preferred ID is provided and doesn't exist, use it
  if (preferredId && !existingSet.has(preferredId)) {
    return preferredId;
  }

  // Generate numeric ID
  const numericIds = Array.from(existingSet)
    .filter(id => typeof id === 'number' || /^\d+$/.test(id))
    .map(id => parseInt(id))
    .filter(id => !isNaN(id));

  let nextId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;

  // Ensure the generated ID doesn't conflict
  while (existingSet.has(nextId)) {
    nextId++;
  }

  return nextId;
}

/**
 * Validate task data structure
 */
export function validateTaskData(task) {
  const errors = [];

  if (!isValidId(task.id)) {
    errors.push('Task ID is required');
  }

  if (!task.text || task.text.trim() === '') {
    errors.push('Task name is required');
  }

  if (!task.start || !(task.start instanceof Date)) {
    errors.push('Valid start date is required');
  }

  if (task.type !== 'milestone') {
    if (!task.duration || task.duration <= 0) {
      errors.push('Duration must be greater than 0');
    }

    if (task.end && task.start && task.end < task.start) {
      errors.push('End date cannot be before start date');
    }
  }

  if (task.progress && (task.progress < 0 || task.progress > 100)) {
    errors.push('Progress must be between 0 and 100');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Find all tasks that reference a given ID as parent
 */
export function findChildTasks(tasks, parentId) {
  return tasks.filter(task => task.parent === parentId);
}

/**
 * Find all links that reference a given task ID
 */
export function findTaskLinks(links, taskId) {
  return links.filter(link => link.source === taskId || link.target === taskId);
}

/**
 * Create an ID mapping for batch updates
 */
export function createIdMapping(oldIds, existingIds = []) {
  const mapping = new Map();
  const existingSet = new Set(existingIds);
  let nextId = generateUniqueId(existingIds);

  oldIds.forEach(oldId => {
    if (isTemporaryId(oldId)) {
      // Generate new ID for temporary ones
      while (existingSet.has(nextId)) {
        nextId++;
      }
      mapping.set(oldId, nextId);
      existingSet.add(nextId);
      nextId++;
    } else if (existingSet.has(oldId)) {
      // Handle conflicts for non-temporary IDs
      let newId = oldId;
      let counter = 1;
      while (existingSet.has(newId)) {
        newId = `${oldId}_${counter}`;
        counter++;
      }
      mapping.set(oldId, newId);
      existingSet.add(newId);
    }
    // No mapping needed if ID is unique and not temporary
  });

  return mapping;
}

/**
 * Apply ID mapping to tasks and links
 */
export function applyIdMapping(data, idMapping) {
  const { tasks, links } = data;

  // Update tasks
  const updatedTasks = tasks.map(task => {
    const updatedTask = { ...task };

    // Update task ID
    if (idMapping.has(task.id)) {
      updatedTask.id = idMapping.get(task.id);
    }

    // Update parent reference
    if (task.parent && idMapping.has(task.parent)) {
      updatedTask.parent = idMapping.get(task.parent);
    }

    return updatedTask;
  });

  // Update links
  const updatedLinks = links?.map(link => {
    const updatedLink = { ...link };

    if (idMapping.has(link.source)) {
      updatedLink.source = idMapping.get(link.source);
    }

    if (idMapping.has(link.target)) {
      updatedLink.target = idMapping.get(link.target);
    }

    return updatedLink;
  }) || [];

  return {
    ...data,
    tasks: updatedTasks,
    links: updatedLinks
  };
}

/**
 * Get summary of temporary IDs in project data
 */
export function getTemporaryIdSummary(data) {
  const tempTasks = data.tasks.filter(task => isTemporaryId(task.id));
  const affectedChildren = data.tasks.filter(task =>
    task.parent && isTemporaryId(task.parent)
  );
  const affectedLinks = data.links?.filter(link =>
    isTemporaryId(link.source) || isTemporaryId(link.target)
  ) || [];

  return {
    temporaryTasks: tempTasks,
    affectedChildren,
    affectedLinks,
    count: tempTasks.length,
    hasTemporaryIds: tempTasks.length > 0
  };
}

/**
 * Validate project data for import
 */
// Enhanced validation function
export function validateProjectForImport(data) {
  if (!data || typeof data !== 'object') {
    alert('Invalid file format. Please select a valid Gantt project file.');
    return false;
  }

  if (!data.tasks || !Array.isArray(data.tasks)) {
    alert('Invalid project file: Missing or invalid tasks data.');
    return false;
  }

  // Check for duplicate IDs
  const seenIds = new Set();
  const duplicates = [];

  for (const task of data.tasks) {
    if (!task.id) {
      alert('Invalid project file: Task found without ID.');
      return false;
    }

    if (seenIds.has(task.id)) {
      duplicates.push(task.id);
    } else {
      seenIds.add(task.id);
    }
  }

  if (duplicates.length > 0) {
    alert(`Invalid project file: Duplicate task IDs found: ${duplicates.join(', ')}`);
    return false;
  }

  return true;
}
