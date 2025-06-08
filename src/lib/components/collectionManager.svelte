<script lang="ts">
    import IconButton from "./iconButton.svelte";
    import editIcon from '$lib/assets/icons/edit.svg'
    import deleteIcon from '$lib/assets/icons/delete.svg'
    import plusIcon from '$lib/assets/icons/plus.svg'
    import okeyIcon from '$lib/assets/icons/okey.svg'
    import CollectionSelect from "./collectionSelect.svelte";
    import type { SceneCollection } from "$lib/core/sceneCollection.svelte";
    import TextDialogue from "./textDialogue.svelte";
    import { goto } from "$app/navigation";
    import { filter } from "$lib/core/filterManager.svelte";
    import ConfirmDialogue from "./confirmDialogue.svelte";

    const { collections }:{ collections: SceneCollection[] } = $props()

    let textDialogue: TextDialogue
    let confirmDialogue: ConfirmDialogue

    const reload = () => {
        goto(window.location.pathname,{
            noScroll:true,
            invalidateAll: true
        })
    }


</script>
<ConfirmDialogue
    bind:this={confirmDialogue}
    label="Remove collection"
    warning="Do you really wish to remove the collection?"
></ConfirmDialogue>

<div class="container">
    <TextDialogue
        bind:this={textDialogue}
        label="New collection"
        placeholder="Enter collection name"
        buttonLabel="Create"
    ></TextDialogue>
    {#key collections}
        <CollectionSelect
            {collections}
        ></CollectionSelect>
    {/key}
    <div class="wrapper" class:disabled={filter.isEditMode}>
        <IconButton
            icon={plusIcon}
            height={1.3}
            type="button"
            color="var(--normal100)"
            onclick={async () => {
                const name = await textDialogue.request()
                if(!name) return
                const formData = new FormData();
                formData.append('name', name);
                const res = await fetch('/api/new-collection', {
                    method: 'POST',
                    body: formData,
                })
                const result: SceneCollection = (await res.json()).collection;
                await filter.updateCollections()
                filter.setActive(result)
            }}
        ></IconButton>
    </div>
    {#if !filter.isEditMode}
        <div class="wrapper" class:disabled={filter.activeCollection.id==="main"}>
            <IconButton
                icon={editIcon}
                height={1.5}
                type="button"
                color="var(--normal100)"
                onclick={()=>{
                    filter.setEditMode(true)
                }}
            ></IconButton>
        </div>
    {:else}
        <IconButton
            icon={okeyIcon}
            height={1.5}
            type="button"
            color="var(--normal100)"
            onclick={()=>{
                filter.setEditMode(false)
            }}
        ></IconButton>
    {/if}
    <div class="wrapper" class:disabled={filter.isEditMode || filter.activeCollection.id === "main"}>
        <IconButton
            icon={deleteIcon}
            height={1.5}
            type="button"
            color="var(--normal100)"
            onclick={async () => {
                const confirmResult = await confirmDialogue.request()
                if(confirmResult !== true) return
                const formData = new FormData()
                formData.append('id', filter.activeCollection.id);
                const res = await fetch('/api/delete-collection', {
                    method: 'POST',
                    body: formData,
                })
                const result = await res.json()
                await filter.updateCollections()
            }}
        ></IconButton>
    </div>
</div>

<style lang="less">
    .container{
        display: flex;
        gap: 0.5rem;
        background-color: var(--normal900);
        border-radius: 0.3rem;
        padding: 0.1rem;
    }
    .wrapper{
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .disabled{
        pointer-events: none;
        opacity: 0.5;
    }
</style>