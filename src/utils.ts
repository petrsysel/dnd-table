import type { ImageSize } from "$lib/core/scene.svelte";
import sharp from "sharp";

export function isJsonString(str: string) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

export function loadImage (src: string) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = function () {
      resolve(this);
    };
    img.src = src;
  });
}

export async function getImageSizeFromFile(filePath: string): Promise<ImageSize> {
  const metadata = await sharp(filePath).metadata();
  return {
    width: metadata.width ?? 0,
    height: metadata.height ?? 0
  };
}