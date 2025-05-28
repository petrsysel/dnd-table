import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import path from "path";
import fs from 'fs/promises'
import { sceneManager } from "$lib/server/sceneManager.svelte";
import { sceneCollections } from "$lib/server/collectionManager.svelte";
import type {SceneCollection} from '$lib/core/sceneCollection.svelte'

export const POST: RequestHandler = async ({request}) => {
    const formData = await request.formData()
    const id = formData.get('id') as string

    const collection = await sceneCollections.getCollection(id)

    return json({
        success: collection !== undefined,
        collection: collection
    });
}