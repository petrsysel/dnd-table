import type { Scene } from "$lib/core/scene.svelte";
import fs from 'fs/promises'
import path from "path"
import fsExists from 'fs.promises.exists'

class SceneManager{
    scenes: Scene[] = $state([])
    listFileName = path.join('static', 'scenes', 'scenes.json')

    constructor(){

    }

    newScene(name: string, path: string){
        const newScene: Scene = {
            id: crypto.randomUUID(),
            name: name,
            path: path,
            fowLayers: []
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
            console.log("Removing "+fileName)
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
}

export const sceneManager = new SceneManager()