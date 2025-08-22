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

#### Date & Time Handling (critical)
- Tasks and markers are saved and loaded using local-naive datetimes for their date fields (no timezone suffix).
  - Example saved values: `2025-08-23T00:00:00` or `2025-08-23` for date-only fields.
  - No timezone conversion is applied on save: what you see in the UI is what is written to the JSON file.
- Loading rules:
  - If a date string ends with `Z` (UTC), the components are interpreted as local wall-clock time so that UI display matches the JSON value.
  - If the value is `YYYY-MM-DD`, it is parsed as a local date (midnight local) with no timezone shift.
  - If the value is `YYYY-MM-DDTHH:mm:ss` (no `Z`), it is parsed as local time.
- Timeline viewport (metadata):
  - `timelineStart` and `timelineEnd` in metadata are stored as ISO strings (timezone-aware) to preserve the viewport window. These do not affect task date rendering; they only control the initial visible window when loading a project.

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

TIP: Note your can edit  **Names** and **Resources** with keyboard in the grid. Double click or press F2 to enter edit mode. Use arrow keys to navigate up and down.

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

- Specify Holidays in project plan to colour these as non-working days

## ❓ FAQ

- Why can’t I see my project tasks after loading a file?
  - The timeline window (Start/End) may not overlap your tasks. The app saves `timelineStart`/`timelineEnd` in metadata and restores them on load. If these are missing, it auto-derives a window from task dates. You can also set Timeline Start/End in the top bar.

## Sample Project JSON Files

Project plan file export sample. [gantt-project-2025-08-22.json](docs/gantt-project-2025-08-22.json)

Resouerce view export sample. [gantt-project-by-resource-2025-08-22.json](docs/gantt-project-by-resource-2025-08-22.json)
---

*This feature set provides a comprehensive project management solution suitable for teams and individuals managing complex projects with dependencies, resources, and timeline requirements.*
