export type Point = {
    x: number,
    y: number
}
export type FOW = {
    name: string,
    id: string,
    polygon: Point[],
    visible: boolean,
}
export type ImageSize = {
  width: number,
  height: number
}
export type Scene = {
    id: string,
    name: string,
    path: string,
    fowLayers: FOW[],
    mapSize: ImageSize
}