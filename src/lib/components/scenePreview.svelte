<script lang="ts">
    import IconButton from "./iconButton.svelte";
    import imageIcon from '$lib/assets/icons/imageIcon.svg'
    import uploadIcon from '$lib/assets/icons/upload.svg'
    import delteIcon from '$lib/assets/icons/delete.svg'
    import editIcon from '$lib/assets/icons/edit.svg'

    import defaultBackground from '$lib/assets/images/rectangle.svg'
    import { onMount } from "svelte";
    import { goto, invalidateAll } from "$app/navigation";
    import type { Scene } from "$lib/core/scene.svelte";


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
    const reload = () => {
        goto(window.location.pathname,{
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

        const result = await res.json();
        
        reload()
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

    //nolint:
</script>

<div
    class="container"
    onclick={(e)=>{
        console.log("clicked scene")
    }}
>
    <img src="{backgroundImage}" class="bg-img" alt=""/>
    <div class="shade"></div>
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
                onclick={() => {
                    deleteScene(scene!.id)
                }}
            ></IconButton>
            <IconButton
                icon={editIcon}
                height={1.5}
                type='button'
                color="var(--normal100)"
                onclick={() => {
                    console.log("edit scene")
                }}
            ></IconButton>
        {/if}
    </div>
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
                placeholder="Zadej název scény"
                bind:value={name}
            >
        {:else}
            <p>{scene!.name}</p>
        {/if}
    </div>
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