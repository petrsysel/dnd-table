import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import path from "path";
import fs from 'fs/promises'
import { sceneManager } from "$lib/server/sceneManager.svelte";
import { getImageSizeFromFile } from "../../../utils";

export const POST: RequestHandler = async ({request}) => {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const name = formData.get('name') as string

    if (!file || !(file instanceof File)) {
		return json({ error: 'Soubor nebyl přijat nebo je neplatný.' }, { status: 400 });
	}

    const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

    const uploadDir = 'static/maps';
	const fileName = file.name
    console.log(file)
	const filePath = path.join(uploadDir, fileName);

    await fs.mkdir(uploadDir, { recursive: true });
	await fs.writeFile(filePath, buffer);
    const imageUrl = `/maps/${fileName}`

    const size = await getImageSizeFromFile(filePath)

    const newScene = sceneManager.newScene(name, imageUrl, size)

    return json({
		success: true,
		scene: newScene
	});
}