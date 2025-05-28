import { json } from "@sveltejs/kit";
import path from "path";
import fs from 'fs/promises'
import { sceneManager } from "$lib/server/sceneManager.svelte";
import { sceneCollections } from "$lib/server/collectionManager.svelte";
import type {SceneCollection} from '$lib/core/sceneCollection.svelte'
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({request}) => {
    const collections = await sceneCollections.getAll()

    return json({
        success: true,
        collections: collections
    });
}