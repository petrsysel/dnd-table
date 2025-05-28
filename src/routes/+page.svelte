<script>
    import FilterPanel from "$lib/components/filterPanel.svelte";
import SceneHub from "$lib/components/sceneHub.svelte";
    import { filter } from "$lib/core/filterManager.svelte.js";
    import { onMount } from "svelte";

    const { data } = $props()
    filter.collections = data.collections

</script>

{#key data.collections}
    <FilterPanel
        collections={data.collections}
    ></FilterPanel>
{/key}
<SceneHub
    scenes={data.scenes}
></SceneHub>

<style lang="less">
    :global(*){
        @font-face {
            font-family: Roboto;
            src: url(/fonts/roboto-flex.ttf);
        }
        --normal100: rgb(239, 239, 239);
        --normal200: rgb(205, 205, 205);
        --normal700: rgb(31, 31, 31);
        --normal800: rgb(25, 25, 25);
        --normal900: rgb(21, 21, 21);

        --alpha500: rgba(0, 0, 0, 0.558);
        transition: 0.3s;
        font-family: Roboto;

        margin: 0;
        padding: 0;
    }
    :global(body) {
        background-color: var(--normal900);
        color: var(--normal100);
    }
</style>