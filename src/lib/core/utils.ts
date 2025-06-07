import type { ImageSize } from "$lib/core/scene.svelte";
import imageSize from "image-size";

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

export async function loadAndWait(img: HTMLImageElement, src: string): Promise<void>{
  return new Promise(resolve => {
    img.onload = () => {
      resolve()
    }
    img.src = src
  })
}