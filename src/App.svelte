<script>
  import { getData } from "./data";
  import { Gantt } from "wx-svelte-gantt";

  const data = getData();

</script>

<Gantt
    tasks={data.tasks}
    links={data.links}
    scales={data.scales}
/>
