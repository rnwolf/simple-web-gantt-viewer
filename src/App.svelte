<script>
  import { getData } from "./data.js";
  import { Gantt, Willow,  ContextMenu, Editor, defaultEditorItems, Toolbar  } from "wx-svelte-gantt";
  import "./gantt-styles.css";


  const data = getData();
  let api = $state();

  // Add some debugging
  console.log("Gantt data:", data);
  console.log("Tasks:", data.tasks);
  console.log("Links:", data.links);
</script>

<main>
  <h1>Simple Gantt Viewer</h1>

  <div class="gantt-container">
    <Willow>
    <Gantt
      bind:this={api}
      tasks={data.tasks}
      links={data.links}
      scales={data.scales}
      columns={data.columns}
    />
    </Willow>
  </div>
</main>

<style>

</style>