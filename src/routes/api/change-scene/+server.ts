import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { sceneManager } from "$lib/server/sceneManager.svelte";

export const POST: RequestHandler = async ({request}) => {
    const formData = await request.formData()
    const sceneId = formData.get('scene-id') as string

    if (!sceneId) {
        return json({ error: 'Neplatné scene-id' }, { status: 400 });
    }

    sceneManager.emitSceneChange(sceneId)

    return json({
        result: true
    })
}