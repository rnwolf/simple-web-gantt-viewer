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
