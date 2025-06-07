import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { sceneManager } from "$lib/server/sceneManager.svelte";

export const POST: RequestHandler = async ({request}) => {
    const formData = await request.formData()
    const sceneId = formData.get('id') as string
    const name = formData.get('name') as string

    const newFow = await sceneManager.newFowLayer(sceneId, name)

    const scene = sceneManager.getScene(sceneId)
    if(scene) sceneManager.emitLayersChange(sceneId, scene.fowLayers)

    return json({
        result: true,
        fow: newFow
    })
}