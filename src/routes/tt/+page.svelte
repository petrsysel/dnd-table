<script lang="ts">
    import type { FOW, Point, Scene } from "$lib/core/scene.svelte";
    import { source } from "sveltekit-sse";
    import { isJsonString, loadAndWait, loadImage,  } from "$lib/core/utils";
    import { onMount } from "svelte";
    import defaultImage from '$lib/assets/images/rectangle.svg'
    import { Kampos, effects, noise, transitions } from 'kampos';

    const sceneSignal = source('/connect-projection').select('scene')
    const visibilitySignal = source('/connect-projection').select('visibility')
    const polygonSignal = source('/connect-projection').select('polygon')
    const layersSignal = source('/connect-projection').select('layers')
    
    let scene: Scene|undefined = $state()
    let promisedImages:Promise<unknown>[] = []
    let startListener:(()=>void) = ()=>{}

    let isRotated = $state(false)
    let fowLayers: FOW[] = $state([])

    let redrawFowTrigger = $state(0)

    layersSignal.subscribe(async layersRaw => {
        if(!isJsonString(layersRaw)) return

        const layersInfo: {
            sceneId: string,
            layers: FOW[]
        } = JSON.parse(layersRaw)

        if(layersInfo.sceneId != scene?.id) return

        fowLayers = layersInfo.layers
    })

    polygonSignal.subscribe(async polygonRaw => {
        if(!isJsonString(polygonRaw)) return
        const polygonInfo: {
            fowId: string,
            polygon: Point[]
        } = JSON.parse(polygonRaw)

        fowLayers.forEach(l => {
            if(l.id === polygonInfo.fowId){
                l.polygon = polygonInfo.polygon
            }
        })
    })

    visibilitySignal.subscribe(async visibilityRaw => {
        if(!isJsonString(visibilityRaw)) return
        const visibilityInfo: {
            fowId: string,
            visible: boolean
        } = JSON.parse(visibilityRaw)

        fowLayers.forEach(l => {
            console.log(l.id)
            console.log(visibilityInfo.fowId)
            if(l.id === visibilityInfo.fowId){
                l.visible = visibilityInfo.visible
                console.log(l.visible)
            }
        })
    })

    sceneSignal.subscribe(async sceneRaw => {
        if(!isJsonString(sceneRaw)) return
        const s: Scene = JSON.parse(sceneRaw)
        scene = s
        fowLayers = scene.fowLayers
        
        await loadAndWait(sceneImage, scene.path)

        const viewportRatio = window.innerWidth/window.innerHeight
        const imageRatio = sceneImage.naturalWidth/sceneImage.naturalHeight
        console.log("Image size")
        console.log(`x: ${sceneImage.naturalWidth}, y: ${sceneImage.naturalHeight}`)
        console.log("Image ratio")
        console.log(imageRatio)
        if(imageRatio < 1) isRotated = true
        else isRotated = false
        console.log(isRotated)
        redrawFowTrigger++

        fowLayers.forEach(l => {console.log(l.visible)})

        // promisedImages = [
        //     loadImage(imageFrom.src),
        //     loadImage(imageTo.src)
        // ]
        // startListener()

    })

    // let imageFrom: HTMLImageElement
    // let imageTo: HTMLImageElement
    let sceneImage: HTMLImageElement

    // onMount(() => {
    //     imageTo.src = defaultImage

    //     const turbulence:any = effects.turbulence({ noise: noise.perlinNoise })

    //     const WIDTH = 854;
    //     const HEIGHT = 480;
    //     const CELL_FACTOR = 4;
    //     const AMPLITUDE = CELL_FACTOR / WIDTH;

    //     turbulence.frequency = {x: AMPLITUDE, y: AMPLITUDE};
    //     turbulence.octaves = 8;
    //     turbulence.isFractal = true;

    //     const effectCanvas = document.createElement('canvas');

    //     effectCanvas.width = WIDTH;
    //     effectCanvas.height = HEIGHT;

    //     const dissolveMap = new Kampos({
    //         target: effectCanvas,
    //         effects: [turbulence],
    //         noSource: true
    //     });
    //     dissolveMap.draw();

    //     const dissolve = transitions.dissolve();
    //     dissolve.map = effectCanvas;
    //     dissolve.high = 0.03;

    //     const target = document.querySelector('#target');
    //     const hippo = new Kampos({target, effects: [dissolve]});

    //     startListener = () => {
    //         Promise.all(promisedImages).then(([fromImage, toImage]) => {
    //             hippo.setSource({media: fromImage, WIDTH, HEIGHT});
    //             dissolve.to = toImage;
    //             hippo.play((time:number) => {
    //                 // a sin() to play in a loop
    //                 dissolve.progress = Math.abs(Math.sin(time * 4e-4)); // multiply time by a factor to slow it down a bit
    //             });
    //         });
    //     }
    // })
</script>

<div class="container">
    <!-- <canvas id="target">
        <img bind:this={imageFrom} src="" alt="">
        <img bind:this={imageTo} src="" alt="">
    </canvas> -->

    <div class="scene" class:rotated={isRotated}>
        <img bind:this={sceneImage} src="" alt="">
        {#key redrawFowTrigger}
            {#each fowLayers as layer (layer.id)}
                <div class="hidden-layer" class:visible-layer={layer.visible}>
                    <svg xmlns="http://www.w3.org/2000/svg" width={sceneImage.width} height={sceneImage.height} viewBox={`0 0 ${sceneImage.naturalWidth} ${sceneImage.naturalHeight}`}>
                        <polygon style="fill:black;stroke:none;"
                        points={layer.polygon.map(c => `${Math.round(c.x * sceneImage.naturalWidth)},${Math.round(c.y * sceneImage.naturalHeight)}`)
                .join(" ")}></polygon>
                    </svg>
                </div>
            {/each}
        {/key}
    </div>
</div>

<style>
    .container{
        position: relative;
        transition: none;
        background-color: black;
    }
    .scene{
        position: fixed;
        top:0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: black;

        img{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit:contain;
        }
        svg{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: contain;
            /* transform: rotate(-50%, -50%); */
        }
    }
    .rotated{
        width: 100vh;
        height: 100vw;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%) rotate(90deg);
        transition: 0s;
    }

    .hidden-layer{
        opacity: 1;
        transition: opacity 1s;
    }
    .visible-layer{
        opacity: 0;
    }
</style>