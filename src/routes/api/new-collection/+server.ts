import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { sceneCollections } from "$lib/server/collectionManager.svelte";

export const POST: RequestHandler = async ({request}) => {
    const formData = await request.formData()
    const name = formData.get('name') as string

    const newCollection = await sceneCollections.new(name)
    
    return json({
        success: true,
        collection: newCollection
    });
}