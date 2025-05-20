export type Point = {
    x: number,
    y: number
}
export type FOW = {
    name: string,
    polygon: Point[],
    visible: boolean,
}
export type Scene = {
    id: string,
    name: string,
    path: string,
    fowLayers: FOW[]
}