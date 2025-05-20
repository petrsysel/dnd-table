<script lang="ts">
    import type { Scene } from "$lib/core/scene.svelte";
    import ScenePreview from "./scenePreview.svelte";
    const { scenes }:{ scenes: Scene[] } = $props()
</script>

<div class="scene-grid">
    <ScenePreview isFactory={true}></ScenePreview>
    {#each scenes.toReversed() as scene (scene.id)}
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
</style>