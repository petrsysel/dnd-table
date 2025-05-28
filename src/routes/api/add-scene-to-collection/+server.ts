import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { sceneCollections } from "$lib/server/collectionManager.svelte";

export const POST: RequestHandler = async ({request}) => {
    const formData = await request.formData()
    const collectionId = formData.get('collection-id') as string
    const sceneId = formData.get('scene-id') as string

    await sceneCollections.addScene(collectionId, sceneId)
    
    return json({
        success: true
    });
}