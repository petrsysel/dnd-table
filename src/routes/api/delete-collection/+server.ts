import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { sceneCollections } from "$lib/server/collectionManager.svelte";

export const POST: RequestHandler = async ({request}) => {
    const formData = await request.formData()
    const id = formData.get('id') as string

    if (!id) {
        return json({ error: 'Neplatné id kolekce' }, { status: 400 });
    }

    await sceneCollections.remove(id)

    return json({
        success: true
    })
}