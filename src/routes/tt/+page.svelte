<script lang="ts">
    import type { FOW, Point, Scene } from "$lib/core/scene.svelte";
    import { source } from "sveltekit-sse";
    import { isJsonString, loadAndWait, loadImage,  } from "$lib/core/utils";
    import { onMount } from "svelte";
    import blackImage from '$lib/assets/images/black-background.svg'
    import transparentImage from '$lib/assets/images/transparent-background.svg'
    import { Kampos, effects, noise, transitions } from 'kampos';

    const sceneSignal = source('/connect-projection').select('scene')
    const visibilitySignal = source('/connect-projection').select('visibility')
    const polygonSignal = source('/connect-projection').select('polygon')
    const layersSignal = source('/connect-projection').select('layers')
    
    let scene: Scene|undefined = $state()
    let promisedImages:Promise<unknown>[] = []
    let playTransition:((state: 'show'|'hide') => Promise<void>) = async (state) => {}

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
            if(l.id === visibilityInfo.fowId){
                l.visible = visibilityInfo.visible
            }
        })
    })

    sceneSignal.subscribe(async sceneRaw => {
        if(!isJsonString(sceneRaw)) return
        if(scene) await playTransition('hide')
        const s: Scene = JSON.parse(sceneRaw)
        scene = s
        fowLayers = scene.fowLayers
        
        await loadAndWait(sceneImage, scene.path)

        const viewportRatio = window.innerWidth/window.innerHeight
        const imageRatio = sceneImage.naturalWidth/sceneImage.naturalHeight
        if(imageRatio < 1) isRotated = true
        else isRotated = false
        redrawFowTrigger++
        await playTransition('show')

    })

    let imageFrom: HTMLImageElement
    let imageTo: HTMLImageElement
    let sceneImage: HTMLImageElement

    const generateNoiseFunction = () => {
    // generuj náhodný offset (např. na všech osách)
    const ox = (Math.random() * 9999).toFixed(3);
    const oy = (Math.random() * 9999).toFixed(3);
    const oz = (Math.random() * 9999).toFixed(3);

    // šablona noise funkce s vloženým offsetem
    return `
        vec3 mod289 (vec3 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec4 mod289 (vec4 x) {
            return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec4 permute (vec4 x) {
            return mod289(((x*34.0)+1.0)*x);
        }

        vec4 taylorInvSqrt (vec4 r) {
            return 1.79284291400159 - 0.85373472095314 * r;
        }

        vec3 fade (vec3 t) {
            return t*t*t*(t*(t*6.0-15.0)+10.0);
        }

        float noise (vec3 P) {
            // tvůj náhodný offset
            P += vec3(${ox}, ${oy}, ${oz});

            vec3 Pi0 = floor(P);
            vec3 Pi1 = Pi0 + vec3(1.0);
            Pi0 = mod289(Pi0);
            Pi1 = mod289(Pi1);
            vec3 Pf0 = fract(P);
            vec3 Pf1 = Pf0 - vec3(1.0);
            vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
            vec4 iy = vec4(Pi0.yy, Pi1.yy);
            vec4 iz0 = Pi0.zzzz;
            vec4 iz1 = Pi1.zzzz;
            vec4 ixy = permute(permute(ix) + iy);
            vec4 ixy0 = permute(ixy + iz0);
            vec4 ixy1 = permute(ixy + iz1);

            vec4 gx0 = ixy0 * (1.0 / 7.0);
            vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
            gx0 = fract(gx0);
            vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
            vec4 sz0 = step(gz0, vec4(0.0));
            gx0 -= sz0 * (step(0.0, gx0) - 0.5);
            gy0 -= sz0 * (step(0.0, gy0) - 0.5);

            vec4 gx1 = ixy1 * (1.0 / 7.0);
            vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
            gx1 = fract(gx1);
            vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
            vec4 sz1 = step(gz1, vec4(0.0));
            gx1 -= sz1 * (step(0.0, gx1) - 0.5);
            gy1 -= sz1 * (step(0.0, gy1) - 0.5);

            vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
            vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
            vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
            vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
            vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
            vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
            vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
            vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

            vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
            g000 *= norm0.x;
            g010 *= norm0.y;
            g100 *= norm0.z;
            g110 *= norm0.w;
            vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
            g001 *= norm1.x;
            g011 *= norm1.y;
            g101 *= norm1.z;
            g111 *= norm1.w;

            float n000 = dot(g000, Pf0);
            float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
            float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
            float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
            float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
            float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
            float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
            float n111 = dot(g111, Pf1);

            vec3 fade_xyz = fade(Pf0);
            vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
            vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
            float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
            return 2.2 * n_xyz;
        }
    `;
};

    const prepareTransition = () => {
        const turbulence:any = effects.turbulence({ noise: generateNoiseFunction()})

        const WIDTH = 1920;
        const HEIGHT = 1080;
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

        hippo.setSource({media: imageFrom, WIDTH, HEIGHT});
        dissolve.to = imageTo;

        playTransition = async state => {
            // progress
            // 0 - black
            // 1 - transparent
            return new Promise(resolve => {
                let speed = 0.012 * 0.05
                let dt = 0
                let lastTime: number | null = null

                if(state === 'show'){
                    dissolve.progress = 0
                    lastTime = null
                    hippo.play((time:number) => {
                        if (lastTime === null) {
                            lastTime = time
                            return
                        }
                        dt = time - lastTime
                        lastTime = time

                        dissolve.progress += speed*dt
                        if(dissolve.progress >= 1){
                            dissolve.progress = 1
                            hippo.stop()
                            resolve()
                        }
                    })
                }
                else{
                    lastTime = null
                    dissolve.progress = 1
                    hippo.play((time: number) => {
                        if (lastTime === null) {
                            lastTime = time
                            return
                        }
                        dt = time - lastTime
                        lastTime = time

                        dissolve.progress -= speed*dt

                        if(dissolve.progress <= 0){
                            dissolve.progress = 0
                            hippo.stop()
                            resolve()
                        }
                    })
                }
            })
        }
    }

    onMount(() => {
        setTimeout(() => {
            prepareTransition()
            console.log("Loaded")
        },100)
    })
</script>

<div class="container">
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

    <canvas id="target" class="transition-layer">
        <img bind:this={imageFrom} src={blackImage} alt="">
        <img bind:this={imageTo} src={transparentImage} alt="">
    </canvas>
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

    .transition-layer{
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
</style>