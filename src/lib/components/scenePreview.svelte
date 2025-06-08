<script lang="ts">
    import IconButton from "./iconButton.svelte";
    import imageIcon from '$lib/assets/icons/imageIcon.svg'
    import uploadIcon from '$lib/assets/icons/upload.svg'
    import delteIcon from '$lib/assets/icons/delete.svg'
    import editIcon from '$lib/assets/icons/edit.svg'
    import checkIcon from '$lib/assets/icons/okey.svg'
    import uncheckIcon from '$lib/assets/icons/circle.svg'

    import defaultBackground from '$lib/assets/images/rectangle.svg'
    import { onMount } from "svelte";
    import { goto, invalidate, invalidateAll } from "$app/navigation";
    import type { Scene } from "$lib/core/scene.svelte";
    import { filter } from "$lib/core/filterManager.svelte";
    import { sceneEditorManager } from "$lib/core/sceneEditorManager.svelte";
    import ConfirmDialogue from "./confirmDialogue.svelte";


    let {
        isFactory = false,
        scene
    }:{
        isFactory?: boolean,
        scene?: Scene
    } = $props()

    let fileSelect: HTMLInputElement
    let backgroundImage: string = $state(defaultBackground)

    let name: string|undefined = $state()
    let file: File|undefined = $state()

    let selectedFile: File | null = null;

    function handleFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            selectedFile = input.files[0];

            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                backgroundImage = imageUrl
            };
            reader.readAsDataURL(selectedFile);
            file = selectedFile
        }
    }
    const reload = async () => {
        await goto(window.location.pathname,{
            noScroll:true,
            invalidateAll: true
        })
    }

    const sendNewSceneData = async () => {
        const formData = new FormData();
        formData.append('file', file!);
        formData.append('name', name!);
        const res = await fetch('/api/new-scene', {
            method: 'POST',
            body: formData,
        });
        
        name = ""
        file = undefined
        backgroundImage = defaultBackground

        const result:Scene = (await res.json()).scene;

        if(filter.activeCollection.id !== 'main'){
            const collectionFormData = new FormData()
            collectionFormData.set('collection-id', filter.activeCollection.id)
            collectionFormData.set('scene-id', result.id)
            const resColl = await fetch('/api/add-scene-to-collection', {
                method: 'POST',
                body: collectionFormData,
            });
            await resColl.json()
        }
        
        await filter.updateCollections()
        await reload()
        
    }

    const deleteScene = async (sceneId: string) => {
        const formData = new FormData();
        formData.append('scene-id', sceneId);
        const res = await fetch('/api/delete-scene', {
            method: 'POST',
            body: formData,
        })

        await res.json();
        
        reload()
    }

    onMount(() => {
        name = ""

        if(!isFactory){
            backgroundImage = `${scene!.path}`
        }
    })

    let confirmDialogue: ConfirmDialogue
</script>

<ConfirmDialogue
    bind:this={confirmDialogue}
    label="Remove scene"
    warning="Do you really wish to remove the scene?"
></ConfirmDialogue>

<div
    class="container"
    onclick={async (e)=>{
        if(!scene) return
        const formData = new FormData();
        formData.append('scene-id', scene!.id);
        const res = await fetch('/api/change-scene', {
            method: 'POST',
            body: formData,
        })

        await res.json();
    }}
>
    <img src="{backgroundImage}" class="bg-img" alt=""/>
    <div class="shade"></div>
    {#if !filter.isEditMode}
        <div class="controls" onclick={e=>{e.stopPropagation()}}>
            {#if isFactory}
                <IconButton
                    icon={imageIcon}
                    height={1.5}
                    type='button'
                    color="var(--normal100)"
                    onclick={() => {
                        fileSelect.click()
                    }}
                ></IconButton>
                <div class:desibled={!(file && name)}>
                    <IconButton
                        icon={uploadIcon}
                        height={1.5}
                        type='button'
                        color="var(--normal100)"
                        onclick={() => {
                            sendNewSceneData()
                        }}
                        
                    ></IconButton>
                </div>
            {:else}
                <IconButton
                    icon={delteIcon}
                    height={1.5}
                    type='button'
                    color="var(--normal100)"
                    onclick={async () => {
                        const confirmRequest = await confirmDialogue.request()
                        if(confirmRequest !== true) return
                        deleteScene(scene!.id)
                    }}
                ></IconButton>
                <IconButton
                    icon={editIcon}
                    height={1.5}
                    type='button'
                    color="var(--normal100)"
                    onclick={() => {
                        sceneEditorManager.open(scene!.id)
                    }}
                ></IconButton>
            {/if}
        </div>
    {/if}
    <div class="file-input">
        <input
            type="file"
            bind:this={fileSelect}
            onchange={handleFileChange}
            onclick={e=>{e.stopPropagation()}}
            accept="image/*"
        >
    </div>
    <div class="name-banner">
        {#if isFactory}
            <input
                type="text"
                placeholder="Enter scene name"
                bind:value={name}
                onkeydown={e => {
                    if(e.key === 'Enter') sendNewSceneData()
                }}
            >
        {:else}
            <p>{scene!.name}</p>
        {/if}
    </div>
    {#if !isFactory && filter.isEditMode}
        <div onclick={e=>{e.stopPropagation()}} class="check-box">
            <IconButton
                icon={filter.isInCollection(scene!.id)?checkIcon:uncheckIcon}
                height={1.5}
                type='button'
                color="var(--normal100)"
                onclick={async () => {
                    const formData = new FormData()
                    formData.append('collection-id', filter.activeCollection.id);
                    formData.append('scene-id', scene!.id);
                    const res = await fetch('/api/collection-toggle-scene', {
                        method: 'POST',
                        body: formData,
                    })

                    const response = await res.json();
                    await filter.updateCollections()
                }}
            ></IconButton>
        </div>
    {/if}
</div>

<style lang="less">
    .container{
        position: relative;
        width: 15rem;
        height: 8rem;
        // background-color: var(--normal200);
        border-radius: 0.3rem;
        display: flex;
        align-items: center;
        justify-content: center;
        background-size: cover;
        // background-size: 100%;
        background-position: center;
        background-repeat: no-repeat;
        transition: background-size 0.4s ease;
        overflow: hidden;
        cursor: pointer;

        &:hover{
            background-size: 110%;
            transition: background-size 0.4s ease;
            .controls{
                opacity: 1;
            }
            .shade{
                background-color: var(--alpha500);
            }
            .name-banner{
                background-color: transparent;
                // height: 100%;
            }
            .bg-img{
                transform: scale(1.1);
            }
        }
    }
    .check-box{
        position: absolute;
        top: 0;
        right: 0;
        padding: 0.5rem;
    }
    .shade{
        background-color: transparent;
        position: absolute;
        width: 100%;
        height: 100%;
    }
    .name-banner{
        width: 100%;
        height: 3rem;
        background-color: var(--alpha500);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;

        input{
            width: 100%;
            outline: none;
            border: none;
            text-align: center;
            font-size: 1rem;
            background-color: transparent;
            color: var(--normal100);
        }
    }
    .file-input{
        display: none;
        position: absolute;
    }
    .controls{
        display: flex;
        justify-content: right;
        align-items: baseline;
        position: absolute;
        top: 0;
        right: 0;
        opacity: 0;
        // width: 100%;
        // height: 100%;
        padding: 0.3rem;
        // background-color: var(--alpha500);
        z-index: 100;
        cursor: auto;
        gap: 0.3rem;
    }
    .bg-img{
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.4s ease;
    }

    .desibled{
        pointer-events: none;
        opacity: 0.5;
    }
</style>