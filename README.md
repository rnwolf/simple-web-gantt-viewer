# README

Basic Gantt viewer for a local project data file(s).

Aim to have dual view (syncronized)
- gantt view
  - Grid
    - Task ID
    - Task Name
    - Resource IDs
    - Duration
    - Chain (Critical Chain, Feeding Chain)
  - Bar
    - Name with
- resource view
- resource view

## SVAR Gantt viewer

Based on opensource Gantt viewer.

https://svar.dev/svelte/gantt/

https://github.com/svar-widgets/gantt

https://forum.svar.dev/

### Quickstart

mkdir simple-web-gantt-viewer

cd simple-web-gantt-viewer

npm init -y

npm install wx-svelte-gantt vite svelte @sveltejs/vite-plugin-svelte

add svelta app

npm run dev

Open browser to view results


### Features

Custom formatting for task types.
https://docs.svar.dev/svelte/gantt/guides/configuration/add_custom_task

Enable editor for tasks.
https://docs.svar.dev/svelte/gantt/guides/configuration/configure_editor

Custom Tooltip
https://docs.svar.dev/svelte/gantt/guides/configuration/add_tooltip

Add columns to the grid area
https://docs.svar.dev/svelte/gantt/guides/configuration/configure_grid

Colour Weekends
https://github.com/svar-widgets/gantt/blob/main/svelte/demos/cases/GanttHolidays.svelte

Bar with start date and end date picker plus autotoggle for zoom (#TODO)
https://github.com/svar-widgets/gantt/blob/main/svelte/demos/cases/GanttStartEnd.svelte

Baseline for Gantt with base_start base_end (#TODO)
https://docs.svar.dev/svelte/gantt/samples/#/baseline/willow
Also need to modify the editor form: https://github.com/svar-widgets/gantt/blob/main/svelte/demos/cases/GanttBaseline.svelte
https://github.com/svar-widgets/gantt/blob/main/svelte/demos/cases/GanttEditorConfig.svelte

Add Sub Tasks to a Task (#TODO)
https://docs.svar.dev/svelte/gantt/samples/#/editor-tasks/willow

Full screen selector and hotkey
https://github.com/svar-widgets/gantt/blob/main/svelte/demos/cases/GanttFullscreen.svelte


Add tool bar
https://github.com/svar-widgets/toolbar/tree/b0165e8d6f39c5b9ba72e5bc590ea0832f1a6369?tab=readme-ov-file
https://github.com/svar-widgets/toolbar/blob/main/svelte/demos/cases/BasicInit.svelte


Add Zoom scales Hours <-> Days <-> Weeks <-> Months <-> Quarters <-> Years
https://docs.svar.dev/svelte/gantt/api/properties/zoom



### Fix timeline header to top

https://forum.svar.dev/d/159-sticky-header-for-timeline-top-bar-in-gantt-chart

set the height to 100% to the root container.

```
html,
body {
  height: 100%;
  padding: 0;
  margin: 0;
}
#root {
  height: 100%;
}
```

## Alternative (Discarded - 2 years since updated)

https://github.com/ANovokmet/svelte-gantt

https://anovokmet.github.io/svelte-gantt/

A lightweight and fast interactive gantt chart/resource booking component made with Svelte. Compatible with any JS library or framework. ZERO dependencies.
