<script lang="ts">
    import { sceneEditorManager } from "$lib/core/sceneEditorManager.svelte";
    import { onMount } from "svelte";

    let zoom = 1
    let zoomFactor = 0.05
    let editor: HTMLDivElement
    let container: HTMLDivElement
    let sceneImage: HTMLImageElement

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
            const originalImage = document.createElement('img')
            if(!sceneEditorManager.openedScene) return
            originalImage.onload = () => {
                console.log("Original image size")
                console.log(originalImage.width)
                console.log(originalImage.height)
                const imageRatio = originalImage.width/originalImage.height
                
                const editorRatio = editor.clientWidth/editor.clientHeight
                
                if(imageRatio > editorRatio){
                    sceneImage.width = editor.clientWidth
                    const height = editor.clientWidth/imageRatio
                    sceneImage.height = height
                }
                else{
                    sceneImage.height = editor.clientHeight
                    const width = editor.clientHeight*imageRatio
                    sceneImage.width = width
                }
                
            }
            originalImage.src = sceneEditorManager.openedScene.path
        })
    })
</script>

<div class="editor" bind:this={editor}>
    <div class="map-container"
        bind:this={container}
    >
        <img bind:this={sceneImage} src={sceneEditorManager.openedScene?.path} alt="Scene">
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
    }
    img{
        transition: 0s;
    }
</style>