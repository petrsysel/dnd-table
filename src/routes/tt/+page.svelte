<script lang="ts">
    import type { Scene } from "$lib/core/scene.svelte";
    import { source } from "sveltekit-sse";
    import { isJsonString } from "../../utils";

    const value = source('/connect-projection').select('scene')
    let scene: Scene|undefined = $state()
    // $inspect(value)
    value.subscribe(sceneRaw => {
        if(!isJsonString(sceneRaw)) return
        const s: Scene = JSON.parse(sceneRaw)
        scene = s
    })
</script>

<h1>Table Top</h1>
<p>Here will be scene view</p>

{scene?.name}