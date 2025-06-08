<script lang="ts">
    import Dialogue from "./dialogue.svelte";
    const {label, warning}:{label:string, warning: string} = $props()

    let dialogue: Dialogue
    let result: boolean | undefined = $state(undefined)

    export const request = ():Promise<boolean|undefined> => {
        dialogue.open()
        result = undefined
        return new Promise(resolve => {
            dialogue.onClose(() => {
                resolve(result)
            })
        })
    }
    
</script>

<Dialogue bind:this={dialogue}
    {label}>
    <div class="content">
        <p>{warning}</p>
            <div class="actions">
                <button
                onclick={() => {
                    result = true
                    dialogue.close()
                }}
            >Yes</button>
            <button
                onclick={() => {
                    result = false
                    dialogue.close()
                }}
            >No</button>
        </div>
    </div>
</Dialogue>

<style lang="less">
    .content{
        box-sizing: border-box;
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 1.5rem;

        
        // margin: 1rem 0.5rem;
        padding: 1rem;
        

        button{
            cursor: pointer;
            background-color: var(--normal800);
            border: 1px solid var(--normal100);
            color: var(--normal200);
            border-radius: 0.2rem;
            font-size: 1rem;
            padding: 0.5rem;
            width: 5rem;


            &:hover{
                color: var(--normal100);
                background-color: var(--normal900);
            }
        }
    }
    .actions{
        width: 100%;
        display: flex;
        justify-content: center;
        gap: 2rem;
    }
</style>