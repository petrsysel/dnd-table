import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { sceneManager } from "$lib/server/sceneManager.svelte";
import type { Point } from '$lib/core/scene.svelte'

export const POST: RequestHandler = async ({request}) => {
    const formData = await request.formData()
    const sceneId = formData.get('scene-id') as string
    const fowId = formData.get('fow-id') as string
    const polygonRaw = formData.get('polygon') as string
    const polygon: Point[] = JSON.parse(polygonRaw)

    console.log("request chaged")
    console.log(sceneId)
    console.log(fowId)
    console.log(polygon)
    await sceneManager.updateFowLayer(sceneId, fowId, polygon)
    sceneManager.emitPolygonChange(fowId, polygon)

    return json({
        result: true
    })
}