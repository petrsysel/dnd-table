import { sceneCollections } from "$lib/server/collectionManager.svelte";
import { sceneManager } from "$lib/server/sceneManager.svelte";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({params}) => {
    return {
		scenes: sceneManager.getScenes(),
		collections: sceneCollections.get()
	};
}