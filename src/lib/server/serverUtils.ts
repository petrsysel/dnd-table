import type { ImageSize } from "$lib/core/scene.svelte"
import { imageSizeFromFile } from "image-size/fromFile"

export async function getImageSizeFromFile(filePath: string): Promise<ImageSize> {
  const size = await imageSizeFromFile(filePath)
  return {
    width: size.width,
    height: size.height
  }
}