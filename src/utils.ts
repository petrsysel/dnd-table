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