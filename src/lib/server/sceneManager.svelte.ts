import type { FOW, ImageSize, Point, Scene } from "$lib/core/scene.svelte";
import fs from 'fs/promises'
import path from "path"
import fsExists from 'fs.promises.exists'

class SceneManager{
    scenes: Scene[] = $state([])
    listFileName = path.join('static', 'scenes', 'scenes.json')

    sceneChangeListeners: ((scene:Scene) => void)[] = []
    visibilityChangeListeners: ((fowId: string, visible: boolean) => void)[] = []
    polygonChangeListeners: ((fowId: string, polygon: Point[]) => void)[] = []
    layersChangeListeners: ((sceneId: string, layers: FOW[]) => void)[] = []

    constructor(){

    }

    newScene(name: string, path: string, mapSize: ImageSize){
        const newScene: Scene = {
            id: crypto.randomUUID(),
            name: name,
            path: path,
            fowLayers: [],
            mapSize: mapSize
        }
        this.scenes.push(newScene)

        this.saveScene(newScene)

        return newScene
    }
    async saveScene(scene: Scene){
        const sceneFileName = path.join('static', 'scenes', scene.id + '.json')
        await fs.writeFile(sceneFileName, JSON.stringify(scene))
        await this.saveSceneList()
    }
    async saveSceneList(){
        const sceneList = this.scenes.map(s => `${s.id}.json`)
        fs.writeFile(this.listFileName, JSON.stringify(sceneList))
    }
    async load(){
        const content = await fs.readFile(this.listFileName, 'utf-8')
        const list: string[] = JSON.parse(content)
        this.scenes = []
        for(const fileName of list){
            const sceneContent = await fs.readFile(path.join('static','scenes',fileName), 'utf-8')
            const scene: Scene = JSON.parse(sceneContent)
            this.scenes.push(scene)
        }
    }

    async removeScene(sceneId: string){
        // odstranit scene ze seznamu
        // zapsat nový seznam
        // smazat soubor
        // případně smazat obrázek

        const sceneIndex = this.scenes.findIndex(s=>s.id === sceneId)
        if(sceneIndex < 0) return false

        const scene = this.scenes[sceneIndex]
        const mapPath = scene.path
        const frequency = this.scenes.filter(s=>s.path === mapPath).length
        if(frequency === 1){
            const fileName = path.join('static', mapPath)
            if(await fsExists(fileName)){
                await fs.rm(fileName)
            }
            
        }
        await fs.rm(path.join('static', "scenes",scene.id+".json"))
        this.scenes.splice(sceneIndex,1)
        this.saveSceneList()
    }

    getScenes(){
        return this.scenes
    }

    onSceneChange(listener: (scene:Scene) => void){
        this.sceneChangeListeners.push(listener)
    }
    emitSceneChange(sceneId: string){
        const scene = this.scenes.find(s => s.id === sceneId)

        if(scene) this.sceneChangeListeners.forEach(l => l(scene))
        else this.sceneChangeListeners.forEach(l => l(this.scenes[0]))
    }
    getScene(id: string){
        return this.scenes.find(s => s.id === id)
    }
    getFow(id: string){
        return this.scenes.find(s => s.id === id)?.fowLayers
    }
    async newFowLayer(sceneId: string, name: string){
        const scene = this.scenes.find(s => s.id === sceneId)
        if(!scene) return
        const newFow = {
            name: name,
            id: crypto.randomUUID(),
            polygon: [],
            visible: false
        }
        scene.fowLayers.push(newFow)
        await this.saveScene(scene)
        return newFow
    }
    async deleteFowLayer(sceneId: string, fowId: string){
        const scene = this.scenes.find(s => s.id === sceneId)
        if(!scene) return
        const fowIndex = scene.fowLayers.findIndex(f => f.id === fowId)
        if(fowIndex < 0) return
        scene.fowLayers.splice(fowIndex, 1)
        await this.saveScene(scene)
    }
    async updateFowLayer(sceneId: string, fowId: string, polygon: Point[]){
        const scene = this.scenes.find(s => s.id === sceneId)
        if(!scene) return
        const fow = scene.fowLayers.find(f => f.id === fowId)
        if(!fow) return
        fow.polygon = polygon
        await this.saveScene(scene)
    }
    async toggleFowLayer(sceneId: string, fowId: string){
        const scene = this.scenes.find(s => s.id === sceneId)
        if(!scene) return
        const fow = scene.fowLayers.find(f => f.id === fowId)
        if(!fow) return
        fow.visible = !fow.visible
        await this.saveScene(scene)
        return fow.visible
    }

    onFowVisibilityChange(listener: (fowId: string, visible: boolean)=>void){
        this.visibilityChangeListeners.push(listener)
    }
    emitVisibilityChange(fowId: string, visible: boolean){
        this.visibilityChangeListeners.forEach(l => l(fowId, visible))
    }

    onPolygonChange(listener: (fowId: string, polygon: Point[])=>void){
        this.polygonChangeListeners.push(listener)
    }
    emitPolygonChange(fowId: string, polygon: Point[]){
        this.polygonChangeListeners.forEach(l => l(fowId, polygon))
    }

    onLayersChange(listener: (sceneId: string, layers: FOW[])=>void){
        this.layersChangeListeners.push(listener)
    }
    emitLayersChange(sceneId: string, layers: FOW[]){
        this.layersChangeListeners.forEach(l => l(sceneId, layers))
    }

    async showHideAll(sceneId: string, visible: boolean){
        const scene = this.scenes.find(s => s.id === sceneId)
        if(!scene) return
        scene.fowLayers.forEach(l => {
            l.visible = visible
        })
        await this.saveScene(scene)
    }
}

export const sceneManager = new SceneManager()