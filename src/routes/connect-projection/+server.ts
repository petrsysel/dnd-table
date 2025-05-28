import { produce } from "sveltekit-sse";
import type { RequestEvent } from "./$types";
import { sceneManager } from "$lib/server/sceneManager.svelte";
import type { Scene } from "$lib/core/scene.svelte";

function delay(milliseconds: number) {
    return new Promise(res => {
        setTimeout(res, milliseconds)
    })
}

export const POST = async (ev: RequestEvent) => {
    return produce(async (connection) => {
        sceneManager.onSceneChange((scene: Scene) => {
            const {error} = connection.emit('scene', JSON.stringify(scene))
            if(error){
                return
            }
        })
    })
}