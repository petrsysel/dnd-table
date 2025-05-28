<script lang="ts">
    import { filter } from "$lib/core/filterManager.svelte";
    import type { SceneCollection } from "$lib/core/sceneCollection.svelte";
    import { onMount } from "svelte";
    import CollectionManager from "./collectionManager.svelte";
    
    const { collections }:{ collections:SceneCollection[] } = $props()

    filter.collections = collections
</script>

<div class="gap"></div>
<div class="panel">

    <CollectionManager
        {collections}
    ></CollectionManager>

    <input type="text" placeholder="Kterou scénu hledáš?" onkeyup={e => {
        const value = (e.target as HTMLInputElement).value
        filter.setFilter(s => s.name.toLowerCase().includes(value.toLowerCase()))
    }}>
</div>

<style lang="less">
    .gap{
        margin: 0;
        padding: 0;
        height: 3.5rem;
    }
    .panel{
        position: fixed;
        top: 0;
        left: 0;
        margin: 0;
        padding: 0;
        width: 100%;
        height: 3rem;
        background-color: black;
        display: flex;
        align-items: center;
        z-index: 101;
        padding: 0 3rem;
        justify-content: space-around;
        box-sizing: border-box;

        input{
            font-size: 1rem;
            padding: 0.3rem;
            width: 14rem;
            outline: none;
            background-color: var(--normal900);
            border: none;
            border-radius: 0.2rem;
            color: var(--normal100);
        }
    }
</style>