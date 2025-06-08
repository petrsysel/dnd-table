<script lang="ts">
    import type { Point } from "$lib/core/scene.svelte";
    import { sceneEditorManager } from "$lib/core/sceneEditorManager.svelte";
    import { onMount } from "svelte";
    import { scale } from "svelte/transition";

    let zoom = 1
    let zoomFactor = 0.05
    let editor: HTMLDivElement
    let container: HTMLDivElement
    let sceneImage: HTMLImageElement
    let svgLayer: SVGElement

    let isPanning = false
    let delta = { x: 0, y: 0 }
    let needsUpdate = false

    let editorWidth = $state(0)
    let editorHeight = $state(0)

    let start = {
        x: 0,
        y: 0
    }
    let currentTransform = {
        x: 0,
        y: 0
    }

    let scene = $derived(sceneEditorManager.openedScene)

    let FOW: Point[] = $derived.by(() => {
        const layer = sceneEditorManager.openedScene?.fowLayers.find(l => l.id === sceneEditorManager.activeFowLayer)
        if(!layer) return []
        return layer.polygon
    })
    let points = $derived(
        FOW
        .map(c => `${Math.round(c.x * scene!.mapSize.width)},${Math.round(c.y * scene!.mapSize.height)}`)
        .join(" ")
    )

    const saveFowChange = async () => {
        const formData = new FormData()
        formData.append('scene-id', sceneEditorManager.openedScene!.id);
        formData.append('fow-id', sceneEditorManager.activeFowLayer);
        formData.append('polygon', JSON.stringify(FOW));
        const res = await fetch('/api/update-fow-layer', {
            method: 'POST',
            body: formData,
        })

        const response = await res.json()
    }

    function updateTransform(){

        container.style.transform=`translate(-50%,-50%) scale(${zoom})`
        container.style.left = `${currentTransform.x + delta.x}px`
        container.style.top = `${currentTransform.y + delta.y}px`
    }
    function resetView(){
        editorWidth = editor.clientWidth
        editorHeight = editor.clientHeight
        zoom = 1
        
        currentTransform = {
            x: editorWidth/2,
            y: editorHeight/2
        }
        updateTransform()
    }

    onMount(() => {
        resetView()

        editor.addEventListener('contextmenu', (e) => e.preventDefault());
        editor.addEventListener('wheel', e => {
            const direction = e.deltaY < 0 ? 1: -1
            zoom += zoomFactor*direction
            updateTransform()
        })

        editor.addEventListener('mousedown', (e) => {
            if (e.button === 2) { // Pravé tlačítko
                isPanning = true;
                start = { x: e.clientX, y: e.clientY };
            }
        });

        editor.addEventListener('mousemove', (e) => {
            if (!isPanning) return;
            delta.x = e.clientX - start.x;
            delta.y = e.clientY - start.y;
            needsUpdate = true
            updateTransform()
        });

        editor.addEventListener('mouseup', (e) => {
            if (e.button === 2) {
                isPanning = false;
                currentTransform.x += delta.x
                currentTransform.y += delta.y
                delta = { x: 0, y: 0 }
            }
        })

        sceneEditorManager.onSceneChanged(() => {
            resetView()
            if(!scene) return
            const imageRatio = scene.mapSize.width/scene.mapSize.height
            
            const editorRatio = editor.clientWidth/editor.clientHeight
            
            let styleWidth = "0px"
            let styleHeight = "0px"

            if(imageRatio > editorRatio){
                styleWidth = `${editor.clientWidth}px`
                const height = editor.clientWidth/imageRatio
                styleHeight = `${height}px`
            }
            else{
                styleHeight = `${editor.clientHeight}px`
                const width = editor.clientHeight*imageRatio
                styleWidth = `${width}px`
            }
            sceneImage.style.width = styleWidth
            sceneImage.style.height = styleHeight
            svgLayer.style.width = styleWidth
            svgLayer.style.height = styleHeight
        })
    })

    let draggingIndex: number = $state(-1)

    function startDrag(e: MouseEvent, index: number) {
    draggingIndex = index;

        const move = (e: MouseEvent) => {
            const rect = svgLayer.getBoundingClientRect();
            let x = (e.clientX - rect.left) / rect.width;
            let y = (e.clientY - rect.top) / rect.height;
            
            if(x < 0) x = 0
            else if(x > 1) x = 1

            if(y < 0) y = 0
            else if(y > 1) y = 1

            FOW = FOW.map((pt, i) =>
            i === draggingIndex ? { x, y } : pt
            );
        };

        const up = () => {
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", up);
            draggingIndex = -1
            saveFowChange()
        };

        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", up);
    }

    let startClickX = 0
    let startClickY = 0
    let endClickX = 0
    let endClickY = 0
</script>

<div class="editor" bind:this={editor}>
    <div class="map-container"
        bind:this={container}
    >
        <img bind:this={sceneImage} src={sceneEditorManager.openedScene?.path} alt="Scene">
        <svg bind:this={svgLayer} width={scene?.mapSize.width} height={scene?.mapSize.height}
        viewBox = {`0 0 ${scene?scene!.mapSize.width:100} ${scene?scene!.mapSize.height:100}`}
        onmouseup={e => {
            if(draggingIndex>=0 || e.button != 0) return
            
            function pointToSegmentDistance(px: number, py: number, a: {x:number,y:number}, b: {x:number,y:number}) {
            
            const x1 = a.x, y1 = a.y;
            const x2 = b.x, y2 = b.y;
            const A = px - x1;
            const B = py - y1;
            const C = x2 - x1;
            const D = y2 - y1;

            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            let param = lenSq !== 0 ? dot / lenSq : -1;

            if (param < 0) param = 0;
            else if (param > 1) param = 1;

            const xx = x1 + param * C;
            const yy = y1 + param * D;
            const dx = px - xx;
            const dy = py - yy;

            return Math.sqrt(dx * dx + dy * dy);
            }

            const rect = svgLayer.getBoundingClientRect();
            const relativeX = (e.clientX - rect.left) / rect.width;
            const relativeY = (e.clientY - rect.top) / rect.height;

            // Vložení mezi nejbližší body
            let minDist = Infinity;
            let insertIndex = 0;

            for (let i = 0; i < FOW.length; i++) {
            const a = FOW[i];
            const b = FOW[(i + 1) % FOW.length]; // uzavřený polygon
            const dist = pointToSegmentDistance(relativeX, relativeY, a, b);

                if (dist < minDist) {
                    minDist = dist;
                    insertIndex = i + 1;
                }
            }

            FOW = [
            ...FOW.slice(0, insertIndex),
            { x: relativeX, y: relativeY },
            ...FOW.slice(insertIndex)
            ]
            saveFowChange()
        }}>
            <polygon
                style="fill:rgba(0,0,0,0.5);stroke:white;stroke-width:3"
                points={points}
            />
            {#each FOW as point, index}
            <circle
                cx={point.x * scene!.mapSize.width}
                cy={point.y * scene!.mapSize.height}
                r="8"
                fill="white"
                stroke="none"
                onmousedown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    startClickX = e.clientX
                    startClickY = e.clientY
                    startDrag(e, index)

                }}
                onmouseup={e=>{
                    endClickX = e.clientX
                    endClickY = e.clientY
                }}
                ondblclick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    const dx = startClickX - endClickX
                    const dy = startClickY - endClickY
                    const dist = Math.sqrt(dx * dx + dy * dy)
                    if(dist < 10){
                        FOW.splice(index, 1)
                    }

                    saveFowChange()
                }}
                style="transition: 0s"
            />
            {/each}
        </svg>
    </div>
</div>

<style lang="less">
    .editor{
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
    }
    .map-container{
        position: absolute;
        // width: 10rem;
        // height: 10rem;
        background-color: black;
        top: 0;
        left: 0;
        transform: translate(-50%, -50%);
        transition: 0s;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }
    img{
        transition: 0s;
    }
    svg{
        position: absolute;
        top: 0;
        left: 0;
    }
</style>