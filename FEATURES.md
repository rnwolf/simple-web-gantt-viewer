# Features Documentation

This document provides detailed information about all features available in the Simple Web Gantt Viewer.

## 📊 Core Gantt Chart Features

### Interactive Timeline

- **Multiple Zoom Levels**: Seamlessly zoom from years down to hours
- **Drag & Drop**: Move tasks by dragging Gantt bars along the timeline
- **Real-time Updates**: Immediate visual feedback for all changes
- **Weekend Highlighting**: Visual distinction for non-working days
- **Grid Lines**: Clear time period divisions with customizable scales

### Task Management

#### Task Creation

- **Multiple Methods**:
  - Click on `+New Task` button
  - Use context menus to add task above, below or as child
- **Rich Task Editor**: Comprehensive form with all task properties
- **Task Types**:
  - Standard Task
  - Summary Task (parent container)
  - Milestone (zero-duration marker)
  - Critical Task
  - Progress Task
  - Buffer Task

#### Task Properties

- **Basic Information**:
  - Task Name (required)
  - Description (optional)
  - Start Date
  - Duration (in days)
  - Optimistic duration (optional)
  - Pessimistic duration (optional)
  - End Date (calculated)
  - Baseline start and end dates (optional)
  - Task type
  - External URL links (optional)

- **Progress Tracking**:
  - Progress percentage (0-100%)
  - Visual progress bars within Gantt bars
  - Auto-calculated summary progress for parent tasks

- **Resource Management**:
  - Resource assignment (e.g., "R001, R002")
  - Resource-centric export to analyze capacity by resource (see Resource View Export below)

#### Task Hierarchy

- **Parent-Child Relationships**: Create multi-level task structures
- **Summary Tasks**: Automatic date calculation from child tasks
- **Expand/Collapse**: Hide/show task subtrees
- **Indent Visualization**: Clear hierarchy representation in grid

### Link Dependencies

#### Link Types

1. **End-to-Start (E2S)**: Most common - second task starts when first ends
2. **Start-to-Start (S2S)**: Both tasks start at the same time
3. **End-to-End (E2E)**: Both tasks end at the same time
4. **Start-to-End (S2E)**: Second task ends when first starts

#### Link Creation

- **Visual Method**:
  - Hover over task to see link handles
  - Click from source link handle to target task link handle
  - Default Link type is E2S, ans can be changed via task editor

- **Editor Method**:
  - Use "Links" section in task editor
  - Choose link type explicitly

#### Link Management

- **Visual Indicators**: Arrows showing dependency direction
- **Link Editing**: Modify existing links through editor
- **Link Deletion**: Remove dependencies as needed via editor

### Project Markers

#### Default Markers

- **Start Project**: Project kick-off marker
- **Today**: Current date indicator
- **End Project**: Project completion marker

#### Create Custom Markers as required (Saved with project file)

- **Milestone Markers**: Important project milestones
- **Deadline Markers**: Critical deadlines
- **Review Points**: Scheduled review sessions
- **Custom Events**: Any project-specific events

#### Marker Management

- **Full CRUD Operations**:
  - Create new markers with name, date, and style
  - Edit existing marker properties
  - Delete markers
  - View all markers in organized list

- **Styling Options**:
  - Default styling
  - Predefined marker types (Today, End)
  - Custom CSS classes for unique styling

## 💾 Data Management

### File Operations

#### Save Functionality

- **Format**: JSON files containing all project data
- **Content Includes**:
  - All tasks with complete properties
  - All links/dependencies
  - All project markers
  - Comments
- **Browser Download**: Uses browser's native download mechanism
- **Filename Control**: User-specified filenames

#### Load Functionality

- **File Selection**: Browser file picker
- **Format Validation**: Ensures valid JSON structure
- **Complete Replacement**: Loads new project, replacing current data
- **Error Handling**: Graceful handling of invalid files

#### New Project

- **Clean Slate**: Clears all current project data
- **Template Data**: Loads a starter template generated relative to the current date (project starts soon). The visible timeline window is also set automatically so tasks are visible immediately.

### Data Persistence

#### ID Normalization Toggle

- Toolbar toggle: "Normalize IDs on save"
- When ON (default): Saves with numeric task IDs (1..N) and remapped link endpoints for readability/testing.
- When OFF: If any tasks have temporary `temp://` IDs, those IDs are preserved in saved tasks and links to avoid breaking relationships during editing.
- The project metadata includes `normalizedIds` to reflect the mode used when saving.

#### Timeline Viewport Persistence

- Saves timeline window into metadata as `timelineStart` and `timelineEnd`.
- On load, if metadata includes these values, the timeline is restored so the project is visible immediately.
- If absent, the app auto-computes a window from the tasks’ min start and max end (with padding) or falls back to a sensible default around today.
- **Session State**: Maintains project state during browser session

## 🎨 User Interface Features

### Custom Toolbar

- **Save Button**: Download current project as JSON
- **Load Button**: Import project from JSON file
- **New Button**: Start fresh project (with confirmation)
- **Markers Button**: Open marker management interface

### Task Editor

- **Form Validation**: Prevents invalid data entry
- **Date Pickers**: Easy date selection with calendar widget
- **Rich Text Areas**: Multi-line descriptions and notes
- **Comments**: Add timestamed comments
- **Task dependencies**: Edit predecessors and sucessors link types and delete links

#### Editor Fields

1. **Basic Info**: Task name, description, dates, duration
2. **Progress**: Completion percentage and tracking
3. **Resources**: Resource assignments
4. **Links**: Dependency management interface
5. **Comments**: Collaboration and discussion threads

### Comments System

- **Timestamps**: Automatic time tracking for all comments

### Tooltips

- **Hover Information**: Richer details on task hover
- **Custom Content**: Task-specific information display
- **Resource Details**: Resource assignment information

### Grid Columns

- **Task Name**: Primary task identifier
- **URL Links**: Clickable external links
- **Start Date**: Task start date with formatting
- **Duration**: Task duration in days
- **Resources**: Assigned resource display

## ⚡ Advanced Features

### Resource View Export
- Export a resource-centric project file grouping tasks under summary tasks per resource ("Resource: {RESOURCE}").
- Each child task is duplicated under the resources it belongs to, with type set to "progress".
- Summary tasks’ start/end/duration are recalculated based on children in the export.
- Links are omitted from the export for clarity.
- Important: Tasks without any assigned resource are excluded from the resource export.

TIP: Save the Resource view and open it in a second browser window. Arrange it side-by-side with the main project plan to visually compare plan vs capacity by resource.

### Zoom Configuration

- **7 Zoom Levels**: From year view to hour view
- **Intelligent Scaling**: Automatic scale adjustment
- **Custom Formats**: Date/time display formatting per level
- **Weekend Display**: Different styling for weekends (Sat & Sunday)

#### Zoom Levels Detail

1. **Year View**: Annual overview (200-400px cells)
2. **Year/Quarter**: Quarterly breakdowns
3. **Quarter/Month**: Monthly planning view
4. **Month/Week**: Weekly scheduling
5. **Day View**: Daily task management
6. **Day/6-Hour**: Detailed daily planning
7. **Day/Hour**: Hourly precision timing

### Custom Styling

- **Task Colors**: Different colours per task types
- **Gradient Effects**: Task progress
- **Hover Effects**: Interactive feedback
- **Summary Task Styling**: Special appearance for parent tasks
- **Progress Visualization**: Colour-coded completion status

### Responsive Design

- **Flexible Layout**: Adapts to various screen sizes

## 🔧 Technical Features

### Performance

- **Virtual Scrolling**: Efficient handling of large datasets
- **Lazy Loading**: On-demand component initialization
- **Optimized Rendering**: Minimal DOM updates

### Browser Support

- **Modern Browsers**: Full support for current browser versions
- **Local File Access**: Save/load without server requirements
- **Progressive Enhancement**: Graceful degradation for older browsers

### Development Extensibility

- **Component Architecture**: Modular, reusable SVAR components


## 🚀 Enhancements

- Excel/JSON Timezone Handling (planned):
  - Current behavior: JSON UTC (Z) datetimes are exported to Excel as naive datetimes preserving the same UTC wall clock; Excel naive datetimes are imported as UTC back to JSON.
  - Planned flag: Add a converter option `--tz-behaviour local` to export/import using the user's local timezone semantics instead of UTC-preserving mapping. This would be useful for spreadsheets intended for teams working exclusively in local time.

## ❓ FAQ

- Why can’t I see my project tasks after loading a file?
  - The timeline window (Start/End) may not overlap your tasks. The app saves `timelineStart`/`timelineEnd` in metadata and restores them on load. If these are missing, it auto-derives a window from task dates. You can also set Timeline Start/End in the top bar.

## Sample Project JSON Files

Project plan file export sample.


```json
{
  "metadata": {
    "projectName": "Simple Gantt Project",
    "exportDate": "2025-08-21T20:04:08.127Z",
    "version": "1.0.0",
    "normalizedIds": true,
    "timelineStart": "2025-08-10T23:00:00.000Z",
    "timelineEnd": "2025-09-29T23:00:00.000Z"
  },
  "tasks": [
    {
      "id": 1,
      "open": true,
      "start": "2025-08-19T23:00:00.000Z",
      "duration": 22,
      "text": "Project Root",
      "progress": 0,
      "type": "summary",
      "end": "2025-09-10T23:00:00.000Z",
      "details": "",
      "$level": 1,
      "$skip": false
    },
    {
      "type": "summary",
      "text": "Summary A",
      "unscheduled": false,
      "parent": 1,
      "start": "2025-08-19T23:00:00.000Z",
      "duration": 10,
      "end": "2025-08-29T23:00:00.000Z",
      "id": 2,
      "progress": 0,
      "details": "",
      "$level": 2,
      "$skip": false,
      "open": false
    },
    {
      "id": 3,
      "parent": 2,
      "start": "2025-08-19T23:00:00.000Z",
      "base_start": "2025-08-19T23:00:00.000Z",
      "base_end": "2025-08-23T23:00:00.000Z",
      "duration": 4,
      "optimistic": 3,
      "pessimistic": 6,
      "text": "Task 1",
      "progress": 82,
      "type": "task",
      "resources": "Resource-A",
      "end": "2025-08-23T23:00:00.000Z",
      "base_duration": 4,
      "details": "",
      "$level": 3,
      "$skip": false,
      "unscheduled": false
    },
    {
      "id": 4,
      "parent": 2,
      "start": "2025-08-25T23:00:00.000Z",
      "duration": 4,
      "text": "Task 2",
      "url": "https://example.com/task2",
      "progress": 0,
      "type": "task",
      "resources": "Resource-A, Resource-B",
      "end": "2025-08-29T23:00:00.000Z",
      "details": "",
      "$level": 3,
      "$skip": false
    },
    {
      "type": "summary",
      "text": "Summary B",
      "unscheduled": false,
      "parent": 1,
      "start": "2025-08-30T23:00:00.000Z",
      "duration": 5,
      "end": "2025-09-04T23:00:00.000Z",
      "id": 5,
      "progress": 23,
      "details": "This is a description box for summary B",
      "$level": 2,
      "$skip": false,
      "$reorder": false,
      "open": false,
      "url": "https://www.example.com/task-123",
      "optimistic": "5",
      "pessimistic": "10",
      "comments": [
        {
          "id": 1755805780521,
          "content": "This is a comment\n",
          "author": {
            "id": 1,
            "name": "Alex",
            "color": "hsl(138, 100%, 85%)"
          },
          "user": 1,
          "date": "2025-08-21T19:54:45.927Z"
        },
        {
          "id": 1755805780522,
          "content": "This is another comment",
          "author": {
            "id": 1,
            "name": "Alex",
            "color": "hsl(138, 100%, 85%)"
          },
          "user": 1,
          "date": "2025-08-21T19:54:54.177Z"
        }
      ]
    },
    {
      "type": "task",
      "text": "Task A",
      "unscheduled": false,
      "parent": 5,
      "start": "2025-08-30T23:00:00.000Z",
      "duration": 3,
      "end": "2025-09-02T23:00:00.000Z",
      "id": 6,
      "progress": 26,
      "details": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed aliquet velit neque, et fermentum nibh fringilla vitae. Praesent orci ex, eleifend a posuere vitae, laoreet eget leo. Nam suscipit malesuada malesuada. Nunc lobortis, felis at tincidunt ullamcorper, magna purus posuere nibh, ut hendrerit elit metus sit amet ante. Nunc tempor imperdiet lacinia. Aliquam consequat non massa at suscipit. In id felis metus. Nulla malesuada suscipit iaculis.",
      "$level": 3,
      "$skip": false,
      "$reorder": false,
      "resources": "Resource-A",
      "url": "https://www.bing.com/",
      "optimistic": "4",
      "pessimistic": "8",
      "comments": [
        {
          "id": 1755805780523,
          "content": "Quisque facilisis fringilla urna vitae tincidunt.",
          "author": {
            "id": 1,
            "name": "Alex",
            "color": "hsl(138, 100%, 85%)"
          },
          "user": 1,
          "date": "2025-08-21T19:57:46.985Z"
        },
        {
          "id": 1755805780524,
          "content": "Quisque facilisis fringilla urna vitae tincidunt.",
          "author": {
            "id": 1,
            "name": "Alex",
            "color": "hsl(138, 100%, 85%)"
          },
          "user": 1,
          "date": "2025-08-21T19:57:51.154Z"
        }
      ]
    },
    {
      "type": "task",
      "text": "Task B",
      "unscheduled": false,
      "parent": 5,
      "start": "2025-08-31T23:00:00.000Z",
      "duration": 4,
      "end": "2025-09-04T23:00:00.000Z",
      "id": 7,
      "progress": 24,
      "details": "uspendisse luctus erat lacus. Donec id tellus neque. Vivamus hendrerit commodo blandit. Phasellus eu vehicula elit. Morbi in aliquet massa. Ut in elit sit amet purus semper ullamcorper. In aliquet mauris eget tristique ornare. Nulla finibus eget lacus sit amet feugiat. Maecenas velit magna, dictum ut tempus sit amet, dignissim ac orci.",
      "$level": 3,
      "$skip": false,
      "resources": "Resource-B",
      "url": "https://www.google.com/taskB"
    },
    {
      "type": "buffer",
      "text": "Project Buffer",
      "unscheduled": false,
      "parent": 1,
      "start": "2025-09-04T23:00:00.000Z",
      "duration": 6,
      "end": "2025-09-10T23:00:00.000Z",
      "id": 8,
      "progress": 0,
      "details": "",
      "$level": 2,
      "$skip": false,
      "$reorder": false
    }
  ],
  "links": [
    {
      "id": 1,
      "type": "e2s",
      "source": 3,
      "target": 4
    },
    {
      "id": 2,
      "type": "e2s",
      "source": 6,
      "target": 7
    },
    {
      "id": 3,
      "type": "e2s",
      "source": 4,
      "target": 6
    }
  ],
  "markers": [
    {
      "id": 1,
      "start": "2025-08-17T23:00:00.000Z",
      "text": "Start Project",
      "left": 700,
      "css": ""
    },
    {
      "id": 2,
      "start": "2025-08-25T23:00:00.000Z",
      "text": "Today",
      "css": "myMiddleClass",
      "left": 1500
    },
    {
      "id": 3,
      "start": "2025-09-10T23:00:00.000Z",
      "text": "End Project",
      "css": "myEndClass",
      "left": 3100
    }
  ],
  "scales": [
    {
      "unit": "month",
      "step": 1,
      "format": "MMMM yyy"
    },
    {
      "unit": "day",
      "step": 1,
      "format": "d"
    }
  ],
  "columns": [
    {
      "id": "text",
      "header": "Task name",
      "flexgrow": 2,
      "editor": "text"
    },
    {
      "id": "url",
      "header": "Url",
      "flexgrow": 1,
      "align": "left"
    },
    {
      "id": "start",
      "header": "Start date",
      "flexgrow": 1,
      "align": "center"
    },
    {
      "id": "duration",
      "header": "Duration",
      "align": "center",
      "flexgrow": 1
    },
    {
      "id": "resources",
      "header": "Resources",
      "flexgrow": 1,
      "align": "center",
      "editor": "text"
    }
  ],
  "taskTypes": [
    {
      "id": "task",
      "label": "Task"
    },
    {
      "id": "summary",
      "label": "Summary task"
    },
    {
      "id": "milestone",
      "label": "Milestone"
    },
    {
      "id": "critical",
      "label": "Critical"
    },
    {
      "id": "narrow",
      "label": "Narrow"
    },
    {
      "id": "progress",
      "label": "Progress"
    },
    {
      "id": "buffer",
      "label": "Buffer"
    }
  ]
}
```

Sample project file for a resource view export.

```json
{
  "metadata": {
    "projectName": "Resource-centric export",
    "exportDate": "2025-08-21T20:15:51.580Z",
    "version": "1.0.0",
    "view": "by-resource",
    "normalizedIds": true,
    "timelineStart": "2025-08-10T23:00:00.000Z",
    "timelineEnd": "2025-09-29T23:00:00.000Z"
  },
  "tasks": [
    {
      "id": 1,
      "text": "Resource: Resource-A",
      "type": "summary",
      "open": true,
      "start": "2025-08-19T23:00:00.000Z",
      "end": "2025-09-02T23:00:00.000Z",
      "duration": 14
    },
    {
      "id": 2,
      "parent": 1,
      "start": "2025-08-19T23:00:00.000Z",
      "base_start": "2025-08-19T23:00:00.000Z",
      "base_end": "2025-08-23T23:00:00.000Z",
      "duration": 4,
      "optimistic": 3,
      "pessimistic": 6,
      "text": "Task 1",
      "progress": 82,
      "type": "progress",
      "resources": "Resource-A",
      "end": "2025-08-23T23:00:00.000Z",
      "base_duration": 4,
      "details": "",
      "$level": 3,
      "$skip": false,
      "unscheduled": false
    },
    {
      "id": 3,
      "parent": 1,
      "start": "2025-08-25T23:00:00.000Z",
      "duration": 4,
      "text": "Task 2",
      "url": "https://example.com/task2",
      "progress": 0,
      "type": "progress",
      "resources": "Resource-A, Resource-B",
      "end": "2025-08-29T23:00:00.000Z",
      "details": "",
      "$level": 3,
      "$skip": false
    },
    {
      "type": "progress",
      "text": "Task A",
      "unscheduled": false,
      "parent": 1,
      "start": "2025-08-30T23:00:00.000Z",
      "duration": 3,
      "end": "2025-09-02T23:00:00.000Z",
      "id": 4,
      "progress": 26,
      "details": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed aliquet velit neque, et fermentum nibh fringilla vitae. Praesent orci ex, eleifend a posuere vitae, laoreet eget leo. Nam suscipit malesuada malesuada. Nunc lobortis, felis at tincidunt ullamcorper, magna purus posuere nibh, ut hendrerit elit metus sit amet ante. Nunc tempor imperdiet lacinia. Aliquam consequat non massa at suscipit. In id felis metus. Nulla malesuada suscipit iaculis.",
      "$level": 3,
      "$skip": false,
      "$reorder": false,
      "resources": "Resource-A",
      "url": "https://www.bing.com/",
      "optimistic": "4",
      "pessimistic": "8",
      "comments": [
        {
          "id": 1755805780523,
          "content": "Quisque facilisis fringilla urna vitae tincidunt.",
          "author": {
            "id": 1,
            "name": "Alex",
            "color": "hsl(138, 100%, 85%)"
          },
          "user": 1,
          "date": "2025-08-21T19:57:46.985Z"
        },
        {
          "id": 1755805780524,
          "content": "Quisque facilisis fringilla urna vitae tincidunt.",
          "author": {
            "id": 1,
            "name": "Alex",
            "color": "hsl(138, 100%, 85%)"
          },
          "user": 1,
          "date": "2025-08-21T19:57:51.154Z"
        }
      ]
    },
    {
      "id": 5,
      "text": "Resource: Resource-B",
      "type": "summary",
      "open": true,
      "start": "2025-08-25T23:00:00.000Z",
      "end": "2025-09-04T23:00:00.000Z",
      "duration": 10
    },
    {
      "id": 6,
      "parent": 5,
      "start": "2025-08-25T23:00:00.000Z",
      "duration": 4,
      "text": "Task 2",
      "url": "https://example.com/task2",
      "progress": 0,
      "type": "progress",
      "resources": "Resource-A, Resource-B",
      "end": "2025-08-29T23:00:00.000Z",
      "details": "",
      "$level": 3,
      "$skip": false
    },
    {
      "type": "progress",
      "text": "Task B",
      "unscheduled": false,
      "parent": 5,
      "start": "2025-08-31T23:00:00.000Z",
      "duration": 4,
      "end": "2025-09-04T23:00:00.000Z",
      "id": 7,
      "progress": 24,
      "details": "uspendisse luctus erat lacus. Donec id tellus neque. Vivamus hendrerit commodo blandit. Phasellus eu vehicula elit. Morbi in aliquet massa. Ut in elit sit amet purus semper ullamcorper. In aliquet mauris eget tristique ornare. Nulla finibus eget lacus sit amet feugiat. Maecenas velit magna, dictum ut tempus sit amet, dignissim ac orci.",
      "$level": 3,
      "$skip": false,
      "resources": "Resource-B",
      "url": "https://www.google.com/taskB"
    }
  ],
  "links": [],
  "markers": [
    {
      "id": 1,
      "start": "2025-08-17T23:00:00.000Z",
      "text": "Start Project",
      "left": 256.125,
      "css": ""
    },
    {
      "id": 2,
      "start": "2025-08-25T23:00:00.000Z",
      "text": "Today",
      "css": "myMiddleClass",
      "left": 512.25
    },
    {
      "id": 3,
      "start": "2025-09-10T23:00:00.000Z",
      "text": "End Project",
      "css": "myEndClass",
      "left": 1024.5
    }
  ],
  "scales": [
    {
      "unit": "month",
      "step": 1,
      "format": "MMMM yyy"
    },
    {
      "unit": "day",
      "step": 1,
      "format": "d"
    }
  ],
  "columns": [
    {
      "id": "text",
      "header": "Task name",
      "flexgrow": 2,
      "editor": "text"
    },
    {
      "id": "url",
      "header": "Url",
      "flexgrow": 1,
      "align": "left"
    },
    {
      "id": "start",
      "header": "Start date",
      "flexgrow": 1,
      "align": "center"
    },
    {
      "id": "duration",
      "header": "Duration",
      "align": "center",
      "flexgrow": 1
    },
    {
      "id": "resources",
      "header": "Resources",
      "flexgrow": 1,
      "align": "center",
      "editor": "text"
    }
  ],
  "taskTypes": [
    {
      "id": "task",
      "label": "Task"
    },
    {
      "id": "summary",
      "label": "Summary task"
    },
    {
      "id": "milestone",
      "label": "Milestone"
    },
    {
      "id": "critical",
      "label": "Critical"
    },
    {
      "id": "narrow",
      "label": "Narrow"
    },
    {
      "id": "progress",
      "label": "Progress"
    },
    {
      "id": "buffer",
      "label": "Buffer"
    }
  ]
}
```

---

*This feature set provides a comprehensive project management solution suitable for teams and individuals managing complex projects with dependencies, resources, and timeline requirements.*
