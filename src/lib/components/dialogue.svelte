<script lang="ts">
    import IconButton from "./iconButton.svelte";
    import closeIcon from '$lib/assets/icons/close.svg'
    import type { Snippet } from "svelte";

    const { children, label }:{ children: Snippet, label: string } = $props()

    let closeListeners:(()=>void)[] = []

    export const onClose = (listener: (()=>void)) => {
        closeListeners.push(listener)
    }

    let closed = $state(true)

    export const open = () => {
        closed = false
    }

    export const close = () => {
        closeListeners.forEach(l => l())
        closed = true
    }
</script>

<div class="overlay" class:visible={!closed}>
    <div class="window">
        <div class="header">
            <p>{label}</p>
            <IconButton
                icon={closeIcon}
                height={1.5}
                type="button"
                color="var(--normal100)"
                onclick={()=>{
                    close()
                }}
            ></IconButton>
        </div>
        <div class="body">
            {@render children()}
        </div>
    </div>
</div>

<style lang="less">
    .overlay{
        position: fixed;
        width: 100vw;
        height: 100vh;
        top: 0;
        left: 0;
        display: none;
        justify-content: center;
        align-items: center;
        background-color: var(--alpha500);
        z-index: 210;
    }
    .window{
        min-width: 20rem;
        background-color: var(--normal900);
    }
    .header{
        height: 3rem;
        width: 100%;
        background-color: black;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 0.5rem;
        box-sizing: border-box;
    }
    .body{
        min-height: 5rem;
    }

    .visible{
        display: flex;
    }
</style>