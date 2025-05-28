import type { SceneCollection } from "$lib/core/sceneCollection.svelte";
import fsExists from "fs.promises.exists";
import path from "path";
import fs from 'fs/promises'

class CollectionManager{
    filePath = path.join('static', 'collections.json')
    collections: SceneCollection[] = $state([])

    async new(name: string){
        const collection: SceneCollection = {
            id: crypto.randomUUID(),
            name: name,
            scenes: []
        }
        this.collections.push(collection)
        await this.save()
        return collection
    }
    async update(id: string, collection: SceneCollection){
        this.collections = this.collections.map(c => {
            if(c.id === id) return collection
            else return c
        })
        await this.save()
    }
    async remove(id: string){
        const toRemove = this.collections.findIndex(c => c.id === id)
        if(toRemove < 0) return
        this.collections.splice(toRemove,1)
        await this.save()
    }
    async load(){
        if(!(await fsExists(this.filePath))){
            await fs.writeFile(this.filePath, JSON.stringify([]))
        }
        const loadedRaw = await fs.readFile(this.filePath, 'utf-8')
        const collections: SceneCollection[] = JSON.parse(loadedRaw)
        this.collections = collections
    }
    async save(){
        await fs.writeFile(this.filePath, JSON.stringify(this.collections))
    }
    async addScene(collectionId: string, sceneId: string){
        const targetColl = this.collections.find(c => c.id === collectionId)
        if(!targetColl) return
        targetColl.scenes.push(sceneId)
        await this.save()
    }
    get(){
        return this.collections
    }
    getCollection(id: string){
        return this.collections.find(c => c.id === id)
    }
    async toggleScene(collectionId: string, sceneId: string){
        const collection = this.collections.find(c => c.id === collectionId)
        if(!collection) return
        const sceneIndex = collection.scenes.findIndex(s => s === sceneId)
        if(sceneIndex < 0){
            collection.scenes.push(sceneId)
        }
        else{
            collection.scenes.splice(sceneIndex, 1)
        }
        await this.save()
    }

    getAll(){
        return this.collections
    }
}

export const sceneCollections = new CollectionManager()