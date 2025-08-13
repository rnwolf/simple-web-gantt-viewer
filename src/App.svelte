<script>
  import { getData } from "./data.js";
  import { Gantt } from "wx-svelte-gantt";

  const data = getData();
</script>

<main>
  <h1>Simple Gantt Viewer</h1>
  <div class="gantt-container">
    <Gantt
      tasks={data.tasks}
      links={data.links}
      scales={data.scales}
      columns={data.columns}
    />
  </div>
</main>

<style>
  :global(html, body) {
    height: 100%;
    padding: 0;
    margin: 0;
    font-family: Arial, sans-serif;
  }

  :global(#app) {
    height: 100%;
  }

  main {
    height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 20px;
    box-sizing: border-box;
  }

  h1 {
    margin: 0 0 20px 0;
    color: #333;
  }

  .gantt-container {
    flex: 1;
    min-height: 0;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  /* Weekend styling for the Gantt chart */
  :global(.weekend) {
    background-color: #f5f5f5;
  }
</style>