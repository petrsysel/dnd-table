<script lang="ts">
    import { filter } from "$lib/core/filterManager.svelte";
    import type { Scene } from "$lib/core/scene.svelte";
    import { onMount } from "svelte";
    import ScenePreview from "./scenePreview.svelte";
    const { scenes }:{ scenes: Scene[] } = $props()

    let sceneList = $derived(scenes.filter(filter.collectionFilter).filter(filter.filter).toReversed())
</script>

<div class="scene-grid">
    <div class="wrapper" class:visible={!filter.isEditMode}>
        <ScenePreview isFactory={true}></ScenePreview>
    </div>
    {#each sceneList as scene (scene.id)}
        <ScenePreview
            scene={scene}
        ></ScenePreview>
    {/each}
</div>

<style lang="less">
    .scene-grid{
        display: grid;
        grid-template-columns: repeat(auto-fill, 15rem);
        gap: 0.5rem;
        justify-content: center;
        // justify-content:space-around;
    }
    .wrapper{
        display: none;
        justify-content: center;
        align-items: center;
    }
    .visible{
        display: flex;
    }
</style>