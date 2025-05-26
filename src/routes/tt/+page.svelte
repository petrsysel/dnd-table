<script lang="ts">
    import type { Scene } from "$lib/core/scene.svelte";
    import { source } from "sveltekit-sse";
    import { isJsonString, loadImage } from "../../utils";
    import { onMount } from "svelte";
    import defaultImage from '$lib/assets/images/rectangle.svg'
    import { Kampos, effects, noise, transitions } from 'kampos';

    const value = source('/connect-projection').select('scene')
    let scene: Scene|undefined = $state()
    let promisedImages:Promise<unknown>[] = []
    let startListener:(()=>void) = ()=>{}

    value.subscribe(sceneRaw => {
        if(!isJsonString(sceneRaw)) return
        const s: Scene = JSON.parse(sceneRaw)
        scene = s
        imageFrom.src = imageTo.src
        imageTo.src = scene.path

        promisedImages = [
            loadImage(imageFrom.src),
            loadImage(imageTo.src)
        ]
        console.log(promisedImages)
        startListener()
    })

    let imageFrom: HTMLImageElement
    let imageTo: HTMLImageElement

    onMount(() => {
        imageTo.src = defaultImage

        const turbulence:any = effects.turbulence({ noise: noise.perlinNoise })
        console.log(turbulence)
        const WIDTH = 854;
        const HEIGHT = 480;
        const CELL_FACTOR = 4;
        const AMPLITUDE = CELL_FACTOR / WIDTH;

        turbulence.frequency = {x: AMPLITUDE, y: AMPLITUDE};
        turbulence.octaves = 8;
        turbulence.isFractal = true;

        const effectCanvas = document.createElement('canvas');

        effectCanvas.width = WIDTH;
        effectCanvas.height = HEIGHT;

        const dissolveMap = new Kampos({
            target: effectCanvas,
            effects: [turbulence],
            noSource: true
        });
        dissolveMap.draw();

        const dissolve = transitions.dissolve();
        dissolve.map = effectCanvas;
        dissolve.high = 0.03;

        const target = document.querySelector('#target');
        const hippo = new Kampos({target, effects: [dissolve]});
        console.log(hippo)

        startListener = () => {
            Promise.all(promisedImages).then(([fromImage, toImage]) => {
                console.log("start")
                hippo.setSource({media: fromImage, WIDTH, HEIGHT});
                dissolve.to = toImage;
                hippo.play((time:number) => {
                    // a sin() to play in a loop
                    dissolve.progress = Math.abs(Math.sin(time * 4e-4)); // multiply time by a factor to slow it down a bit
                });
            });
        }
    })
</script>

<div>
    <canvas id="target">
        <img bind:this={imageFrom} src="" alt="">
        <img bind:this={imageTo} src="" alt="">
    </canvas>
</div>