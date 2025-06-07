import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { sceneManager } from "$lib/server/sceneManager.svelte";

export const POST: RequestHandler = async ({request}) => {
    const formData = await request.formData()
    const sceneId = formData.get('scene-id') as string
    const state = formData.get('state') as string

    if(state === "show") await sceneManager.showHideAll(sceneId, true)
    else if(state === "hide") await sceneManager.showHideAll(sceneId, false)

    const scene = sceneManager.getScene(sceneId)
    if(scene){
        for(const layer of scene.fowLayers){
            sceneManager.emitVisibilityChange(layer.id, layer.visible)
        }
    }
    return json({
        result: true
    })
}