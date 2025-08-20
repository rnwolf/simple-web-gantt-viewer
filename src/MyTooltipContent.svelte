<script>
    import { format } from "date-fns";
    export let data;
    console.log("Tooltip data:", data);
    const mask = "yyyy-MM-dd";
</script>

{#if data}


    <div class="data">
        <div class="text">
            <span class="caption">ID:</span>
            {data.id}
        </div>
        <div class="text">
            <span class="caption">{data.type}:</span>
            {data.text}
        </div>
        <div class="text">
            <span class="caption">start:</span>
            {format(data.start, mask)}
        </div>
        {#if data.end}
            <div class="text">
                <span class="caption">end:</span>
                {format(data.end, mask)}
            </div>
        {/if}
        {#if data.duration}
            <div class="text">
                <span class="caption">duration:</span>
                {data.duration}
            </div>
        {/if}
        {#if data.optimistic}
            <div class="text">
                <span class="caption">optimistic:</span>
                {data.optimistic}
            </div>
        {/if}
        {#if data.pessimistic}
            <div class="text">
                <span class="caption">pessimistic:</span>
                {data.pessimistic}
            </div>
        {/if}
        {#if data.resources}
            <div class="text">
                <span class="caption">Resources:</span>
                {data.resources}
            </div>
        {/if}
    </div>
{/if}

<style>
    .data {
        white-space: nowrap;
        background-color: var(--wx-tooltip-background);
        padding: 3px 8px;
    }

    .text {
        font-family: var(--wx-font-family);
        color: var(--wx-color-primary-font);
        font-size: 13px;
        text-transform: capitalize;
        margin-bottom: 5px;
    }

    .text:last-child {
        margin-bottom: 0;
    }

    .caption {
        font-weight: 700;
    }
</style>