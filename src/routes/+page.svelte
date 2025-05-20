<script>
    import SceneHub from "$lib/components/sceneHub.svelte";

    const { data } = $props()
    console.log(data.scenes.map(s=>s.id))

</script>

<SceneHub
    scenes={data.scenes}
></SceneHub>

<style lang="less">
    :global(*){
        @font-face {
            font-family: Roboto;
            src: url(/fonts/roboto-flex.ttf);
        }
        --normal100: rgb(239, 239, 239);
        --normal200: rgb(205, 205, 205);
        --normal900: rgb(21, 21, 21);

        --alpha500: rgba(0, 0, 0, 0.558);
        transition: 0.3s;
        font-family: Roboto;
    }
    :global(body) {
        background-color: var(--normal900);
        color: var(--normal100);
    }
</style>