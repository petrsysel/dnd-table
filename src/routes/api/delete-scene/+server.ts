import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import path from "path";
import fs from 'fs/promises'
import { sceneManager } from "$lib/server/sceneManager.svelte";
import { sceneCollections } from "$lib/server/collectionManager.svelte";

export const POST: RequestHandler = async ({request}) => {
    const formData = await request.formData()
    const sceneId = formData.get('scene-id') as string

    if (!sceneId) {
        return json({ error: 'Neplatné scene-id' }, { status: 400 });
    }

    const result = await sceneManager.removeScene(sceneId)
    await sceneCollections.sceneRemoved(sceneId)

    return json({
        result: result
    })
}