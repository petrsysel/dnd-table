<script lang="ts">
    import { filter } from '$lib/core/filterManager.svelte';
    import type { SceneCollection } from '$lib/core/sceneCollection.svelte';
    import { onMount } from 'svelte';

    let { collections, onSelect=(collection)=>{} }:{ collections:SceneCollection[], onSelect?:(collection: SceneCollection)=>void } = $props();

    let open = $state(false)
</script>

<div class="container" class:disabled={filter.isEditMode}>
    <div class="selected">
        {filter.activeCollection.name}
    </div>
    <div class="list" class:visible={open}>
        {#key filter.allCollections}
            {#each filter.allCollections.filter(c=>c.id!==filter.activeCollection.id) as collection (collection.id)}
                <div class="item" onclick={() => {
                    onSelect(collection)
                    filter.setActive(collection)
                }}>
                    {collection.name}
                </div>
            {/each}
        {/key}
    </div>
</div>

<style lang="less">
    .container{
        min-width: 14rem;
        position: relative;
        height: 2rem;
        box-sizing: border-box;

        &:hover{
            .list{
                display: flex;
            }
        }
    }
    .selected{
        display: flex;
        width: 100%;
        justify-content: center;
        align-items: center;
        height: 100%;
        box-sizing: border-box;
        cursor: pointer;
    }
    .list{
        position: absolute;
        top: 2rem;
        left: 0;
        width: 100%;
        display: none;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        div{
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: var(--normal700);
            width: 100%;
            height: 2rem;
            color: var(--normal200);
            &:hover{
                color: var(--normal100)
            }
        }
        div:nth-child(even) {
            background-color: var(--normal900);
        }
    }

    .disabled{
        pointer-events: none;
        opacity: 0.5;
    }
</style>