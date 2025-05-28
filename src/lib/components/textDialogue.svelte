<script lang="ts">
    import Dialogue from "./dialogue.svelte";
    const {label, placeholder, buttonLabel}:{label:string, placeholder: string, buttonLabel: string} = $props()

    let dialogue: Dialogue
    let inputElement: HTMLInputElement
    let result: string | undefined = $state(undefined)

    export const request = ():Promise<string|undefined> => {
        dialogue.open()
        inputElement.value = ""
        setTimeout(() => {
            inputElement.focus()
        },0)
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
        <input type="text" {placeholder} bind:this={inputElement}
            onkeydown={e => {
                if(e.key !== 'Enter') return
                result = inputElement.value
                dialogue.close()
            }}
        >
        <button
            onclick={() => {
                result = inputElement.value
                dialogue.close()
            }}
        >{buttonLabel}</button>
    </div>
</Dialogue>

<style lang="less">
    .content{
        width: 100%;
        height: 6rem;
        display: flex;
        justify-content: center;
        align-items: center;
        gap:0.5rem;

        input{
            background-color: var(--normal800);
            color: var(--normal100);
            border: none;
            border-radius: 0.2rem;
            outline: none;
            font-size: 1rem;
            padding: 0.5rem;
        }
        button{
            cursor: pointer;
            background-color: var(--normal800);
            border: none;
            color: var(--normal200);
            border-radius: 0.2rem;
            font-size: 1rem;
            padding: 0.5rem;

            &:hover{
                color: var(--normal100);
            }
        }
    }
</style>