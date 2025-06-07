import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { sceneManager } from "$lib/server/sceneManager.svelte";

export const POST: RequestHandler = async ({request}) => {
    const formData = await request.formData()
    const sceneId = formData.get('scene-id') as string
    const fowId = formData.get('fow-id') as string

    await sceneManager.deleteFowLayer(sceneId, fowId)
    
    const scene = sceneManager.getScene(sceneId)
    if(scene) sceneManager.emitLayersChange(sceneId, scene.fowLayers)

    return json({
        result: true
    })
}