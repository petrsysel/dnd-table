<script lang="ts">
    type IconButtonType = 'a' | 'button'

    let {
        icon,
        type = 'button',
        onclick = () => {},
        href = '/',
        height = 1.2,
        color = 'var(--normal900)'
    }:{
        icon: string,
        type?: IconButtonType,
        onclick?: () => void,
        href?: string,
        height?: number,
        color?: string
    } = $props()

</script>

<div class="container" onclick={(e) => {e.stopPropagation()}}>
    {#if type === 'a'}
        <a {href}>
            <div
                class="img"
                style="
                    width: {height}rem;
                    height: {height}rem;
                    mask: url({icon}) no-repeat center / contain;
                    {color?'background-color: '+color+';':''}
                "
            >
        </a>
    {:else}
        <button {onclick}>
            <div
                class="img"
                style="
                    width: {height}rem;
                    height: {height}rem;
                    mask: url({icon}) no-repeat center / contain;
                    {color?'background-color: '+color+';':''}
                "
            >
            </div>
        </button>
    {/if}
</div>

<style lang="less">
    .container{
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 100;

        &:hover{
            .img{
                background-color: var(--normal100);
            }
        }
    }

    .img{
        transition: 0.2s ease-in-out;
        background-color: var(--normal900);
        &.hoverd{
            transition: 0.2s ease-in-out;
            background-color: var(--normal100);
        }
    }
    button{
        border: none;
        background-color: transparent;
        cursor: pointer;
    }
</style>