<script lang="ts">
    import { sceneEditorManager } from "$lib/core/sceneEditorManager.svelte";
    import closeIcon from '$lib/assets/icons/close.svg'
    import IconButton from "./iconButton.svelte";
    import MapPlane from "./FowEditor.svelte";
    import FowEditor from "./FowEditor.svelte";
    import plusIcon from '$lib/assets/icons/plus.svg'
    import visibleIcon from '$lib/assets/icons/visible.svg'
    import notVisibleIcon from '$lib/assets/icons/notvisible.svg'
    import deleteIcon from '$lib/assets/icons/delete.svg'

    let sceneNameInput: HTMLInputElement

    const requestNewFow = async () => {
        const scene = sceneEditorManager.openedScene
        if(!scene) return

        const formData = new FormData();
        formData.append('id', scene.id);
        formData.append('name', sceneNameInput.value);
        const res = await fetch('/api/new-fow-layer', {
            method: 'POST',
            body: formData,
        });
        
        sceneNameInput.value = ""
        const result = await res.json()
        console.log(result)
        await sceneEditorManager.loadFow()
        sceneEditorManager.setActiveFow(result.fow.id)
    }

    const showHideAll = async (state:"show"|"hide") => {
        const scene = sceneEditorManager.openedScene
        if(!scene) return

        const formData = new FormData();
        formData.append('scene-id', scene.id);
        formData.append('state', state)
        const res = await fetch('/api/showhideall-layers', {
            method: 'POST',
            body: formData,
        })
        const result = await res.json()

        await sceneEditorManager.loadFow()
    }
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
            <div class="block-overlay" class:visible={sceneEditorManager.openedScene? sceneEditorManager.openedScene.fowLayers.length <= 0:false}>
                <p>Pro editování Fog of War je nejprve třeba vytvořit novou vrstvu.</p>
            </div>
            <FowEditor></FowEditor>
        </div>
        <div class="layer-panel">
            <p class="title">Fog of War</p>
            <div class="new-layer">
                <input bind:this={sceneNameInput} class="new-layer-name" type="text" placeholder="Nová FOW vrstva"
                    onkeydown={e => {
                        if(e.key == "Enter") requestNewFow()
                    }}
                >
                <IconButton
                    color="var(--normal100)"
                    type="button"
                    height={1.3}
                    icon={plusIcon}
                    onclick={requestNewFow}
                ></IconButton>
            </div>

            <div class="hideshowall">
                <button onclick={() => {showHideAll("show")}}>Odhalit vše</button>
                <button onclick={() => {showHideAll('hide')}}>Skrýt vše</button>
            </div>

            {#if sceneEditorManager.openedScene}
                {#each sceneEditorManager.openedScene.fowLayers as layer}
                    <div class="fow-layer" class:active={sceneEditorManager.isActiveFow(layer.id)}
                        onclick={() => {
                            sceneEditorManager.setActiveFow(layer.id)
                        }}
                    >
                        <div class="layer-name">
                            <p>{layer.name}</p>
                        </div>
                        <div class="layer-controls">
                            <div class="delete-button">
                                <IconButton
                                    color="var(--normal100)"
                                    type="button"
                                    height={1.3}
                                    icon={deleteIcon}
                                    onclick={async () => {
                                        const scene = sceneEditorManager.openedScene
                                        if(!scene) return

                                        const formData = new FormData();
                                        formData.append('scene-id', scene.id);
                                        formData.append('fow-id', layer.id);
                                        const res = await fetch('/api/delete-fow-layer', {
                                            method: 'POST',
                                            body: formData,
                                        })
                                        const result = await res.json()

                                        await sceneEditorManager.loadFow()
                                    }}
                                ></IconButton>
                            </div>
                            <IconButton
                                color="var(--normal100)"
                                type="button"
                                height={1.3}
                                icon={layer.visible?visibleIcon:notVisibleIcon}
                                onclick={async () => {
                                    const scene = sceneEditorManager.openedScene
                                    if(!scene) return

                                    const formData = new FormData();
                                    formData.append('scene-id', scene.id);
                                    formData.append('fow-id', layer.id);
                                    const res = await fetch('/api/toggle-fow-layer-visibility', {
                                        method: 'POST',
                                        body: formData,
                                    })
                                    const result = await res.json()

                                    await sceneEditorManager.loadFow()
                                }}
                            ></IconButton>
                        </div>
                    </div>
                {/each}
            {/if}
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
            background-color: black;
            z-index: 200;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            box-sizing: border-box;
            padding: 0.5rem;
            .title{
                font-size: 1.5rem;
            }

            .new-layer{
                
                display: flex;
                width: 100%;
                gap: 0.4rem;
                box-sizing: border-box;
                padding-right: 0.5rem;
                input{
                    flex: 1;
                    font-size: 1rem;
                    padding: 0.5rem;
                    outline: none;
                    background-color: var(--normal800);
                    // border: 1px solid var(--normal100);
                    border: none;
                    border-radius: 0.3rem;
                    color: var(--normal100);
                }
            }
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

    .fow-layer{
        display: flex;
        width: 100%;
        justify-content: space-between;
        box-sizing: border-box;
        padding: 0 0.5rem;
        align-items: center;
        background-color: var(--normal800);
        border-radius: 0.3rem;

        .layer-name{
            width: 100%;
            height: 100%;
            padding: 0.5rem 0;
            cursor: pointer;
            display: flex;
            align-items: center;
        }

        .layer-controls{
            display: flex;
            gap: 1rem;
        }

        .delete-button{
            opacity: 0;
        }
        &:hover{
            .delete-button{
                opacity: 1;
            }
        }
    }
    .active{
        box-shadow: 0px 0px 5px 1px white;
    }

    .block-overlay{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--alpha500);
        z-index: 200;
        display: none;
        justify-content: center;
        align-items: center;
    }
    .visible{
        display: flex;
    }

    .hideshowall{
        display: flex;
        width: 100%;
        gap: 0.5rem;

        button{
            flex: 1;
            font-size: 1rem;
            background-color: var(--normal800);
            border: none;
            border-radius: 0.3rem;
            color: var(--normal100);
            padding: 0.5rem;
            cursor: pointer;

            &:hover{
                background-color: var(--normal900);
            }
        }
    }
    
</style>