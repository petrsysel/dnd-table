import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import path from "path";
import fs from 'fs/promises'
import { sceneManager } from "$lib/server/sceneManager.svelte";
import { sceneCollections } from "$lib/server/collectionManager.svelte";
import type {SceneCollection} from '$lib/core/sceneCollection.svelte'

export const POST: RequestHandler = async ({request}) => {
    const formData = await request.formData()
    const collectionId = formData.get('collection-id') as string
    const sceneId = formData.get('scene-id') as string

    await sceneCollections.toggleScene(collectionId, sceneId)

    return json({
        success: true
    });
}