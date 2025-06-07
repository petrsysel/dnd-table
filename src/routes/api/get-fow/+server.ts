import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { sceneManager } from "$lib/server/sceneManager.svelte";

export const POST: RequestHandler = async ({request}) => {
    const formData = await request.formData()
    const sceneId = formData.get('id') as string

    const fow = sceneManager.getFow(sceneId)

    return json({
        result: fow !== undefined,
        fow: fow
    })
}