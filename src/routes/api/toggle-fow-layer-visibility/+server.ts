import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { sceneManager } from "$lib/server/sceneManager.svelte";
import type { Point } from '$lib/core/scene.svelte'

export const POST: RequestHandler = async ({request}) => {
    const formData = await request.formData()
    const sceneId = formData.get('scene-id') as string
    const fowId = formData.get('fow-id') as string

    const visibility = await sceneManager.toggleFowLayer(sceneId, fowId)
    sceneManager.emitVisibilityChange(fowId, visibility?visibility:false)
    return json({
        result: true
    })
}