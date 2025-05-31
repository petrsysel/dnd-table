<script lang="ts">
    import { sceneEditorManager } from "$lib/core/sceneEditorManager.svelte";
    import closeIcon from '$lib/assets/icons/close.svg'
    import IconButton from "./iconButton.svelte";
    import MapPlane from "./FowEditor.svelte";
    import FowEditor from "./FowEditor.svelte";
</script>

<div class="window" class:open={sceneEditorManager.isOpen}>
    <div class="container">
        <div class="close-button">
            <IconButton
                icon={closeIcon}
                height={2}
                type='button'
                color="var(--normal100)"
                onclick={() => {
                    sceneEditorManager.close()
                }}
            ></IconButton>  
        </div>
        <div class="editor">
            <FowEditor></FowEditor>
        </div>
        <div class="layer-panel">

        </div>
    </div>
        
</div>

<style lang="less">
    .window{
        position: fixed;
        width: 100vw;
        height: 100vh;
        top:0;
        left: 100vw;
        background-color: var(--normal900);
        z-index: 200;
        display: flex;
    }
    .container{
        width: 100%;
        height: 100%;
        position: relative;
        display: flex;
        .editor{
            flex: 1;
            background-color: var(--normal800);
            position: relative;
        }
        .layer-panel{
            width: 20rem;
            background-color: var(--normal900);
            z-index: 200;
        }
    }
    .open{
        left: 0;
        overflow: hidden;
    }

    .close-button{
        position: absolute;
        top: 1rem;
        left: 1rem;
        z-index: 201;
    }
</style>