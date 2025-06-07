import { produce } from "sveltekit-sse";
import type { RequestEvent } from "./$types";
import { sceneManager } from "$lib/server/sceneManager.svelte";
import type { FOW, Point, Scene } from "$lib/core/scene.svelte";

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
        sceneManager.onFowVisibilityChange((fowId: string, visible: boolean) => {
            const {error} = connection.emit('visibility', JSON.stringify({
                fowId: fowId,
                visible: visible
            }))
            if(error){
                return
            }
        })
        sceneManager.onPolygonChange((fowId: string, polygon: Point[]) => {
            const {error} = connection.emit('polygon', JSON.stringify({
                fowId: fowId,
                polygon: polygon
            }))
            if(error){
                return
            }
        })
        sceneManager.onLayersChange((sceneId: string, layers: FOW[]) => {
            const {error} = connection.emit('layers', JSON.stringify({
                sceneId: sceneId,
                layers: layers
            }))
            if(error){
                return
            }
        })
    })
}