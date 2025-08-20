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
  - #TODO - Add a second Gantt chart that display timeline from a specific resource perspective

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
- **Template Data**: Loads minimal starter template

### Data Persistence

- **Session State**: Maintains project state during browser session
- **Real-time Sync**: Changes immediately reflected in UI

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


## Sample Project JSON File

```json
{
  "metadata": {
    "projectName": "Simple Gantt Project",
    "exportDate": "2025-08-20T15:20:09.119Z",
    "version": "1.0.0"
  },
  "tasks": [
    {
      "id": 1,
      "open": true,
      "start": "2023-12-06T00:00:00.000Z",
      "duration": 9,
      "text": "Project Root",
      "progress": 60,
      "type": "summary",
      "details": "Main project container with all tasks",
      "comments": [
        {
          "id": 1,
          "user": 1,
          "content": "This is the main project container. All tasks should be organized under this.",
          "date": "2025-08-20T15:18:36.163Z"
        }
      ],
      "end": "2023-12-15T00:00:00.000Z",
      "$level": 1,
      "$skip": false
    },
    {
      "id": 2,
      "parent": 1,
      "start": "2023-12-06T00:00:00.000Z",
      "base_start": "2023-12-05T00:00:00.000Z",
      "base_end": "2023-12-09T00:00:00.000Z",
      "duration": 4,
      "text": "Task 1",
      "progress": 75,
      "type": "task",
      "resources": "R001, R002",
      "details": "First phase of the project work",
      "comments": [],
      "end": "2023-12-10T00:00:00.000Z",
      "base_duration": 4,
      "$level": 2,
      "$skip": false,
      "optimistic": "6",
      "pessimistic": "8",
      "unscheduled": false
    },
    {
      "id": 3,
      "parent": 1,
      "start": "2023-12-11T00:00:00.000Z",
      "base_start": "2023-12-11T00:00:00.000Z",
      "base_end": "2023-12-15T00:00:00.000Z",
      "duration": 4,
      "optimistic": 11,
      "pessimistic": 22,
      "text": "Task 2",
      "url": "https://example.com/task2",
      "progress": 40,
      "type": "task",
      "resources": "R003",
      "details": "Second phase following Task 1",
      "comments": [],
      "end": "2023-12-15T00:00:00.000Z",
      "base_duration": 4,
      "$level": 2,
      "$skip": false
    }
  ],
  "links": [
    {
      "id": 1,
      "source": 2,
      "target": 3,
      "type": "e2s"
    }
  ],
  "markers": [
    {
      "id": 1,
      "start": "2023-12-02T00:00:00.000Z",
      "text": "Start Project",
      "left": 0
    },
    {
      "id": 2,
      "start": "2023-12-08T00:00:00.000Z",
      "text": "Today",
      "css": "myMiddleClass",
      "left": 409.8
    },
    {
      "id": 3,
      "start": "2023-12-25T00:00:00.000Z",
      "text": "End Project",
      "css": "myEndClass",
      "left": 1639.2
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
