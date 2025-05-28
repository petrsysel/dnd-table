import { sceneCollections } from "$lib/server/collectionManager.svelte";
import { sceneManager } from "$lib/server/sceneManager.svelte";
import type { ServerInit } from "@sveltejs/kit";

export const init: ServerInit = async () => {
    await sceneManager.load()
    await sceneCollections.load()
}