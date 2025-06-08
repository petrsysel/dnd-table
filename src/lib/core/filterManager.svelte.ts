import type { Scene } from "./scene.svelte"
import type { SceneCollection } from "./sceneCollection.svelte"

export type Filter = (scene: Scene)=>boolean
class FilterManager{
    filter: Filter = $state(scene => true)
    collectionFilter: Filter = $state(scene => true)

    mainCollection: SceneCollection = {
        id: 'main',
        name: "All scenes",
        scenes: []
    }

    collections: SceneCollection[] = $state([])
    allCollections: SceneCollection[] = $derived([this.mainCollection, ...this.collections])

    isEditMode = $state(false)

    activeCollection: SceneCollection = $state(this.mainCollection)

    constructor(){
        
    }

    async updateCollections(){
        const res = await fetch('/api/get-all-collections', {
            method: 'GET'
        })
        const collections: SceneCollection[] = (await res.json()).collections;
        
        this.collections = collections
        const updatedActive = collections.find(c => c.id === this.activeCollection.id)
        if(!updatedActive){
            this.setActive(this.mainCollection)
        }
        else{
            this.setActive(updatedActive)
        }
        this.updateCollectionFilter()
    }

    setActive(collection: SceneCollection){
        this.activeCollection = collection

        this.updateCollectionFilter()
    }

    updateCollectionFilter(){
        if(this.isEditMode) return
        if(this.activeCollection.id === 'main'){
            this.setCollectionFilter(s => true)
        }
        else{
            this.setCollectionFilter(s => this.activeCollection.scenes.includes(s.id))
        }
    }

    setEditMode(toggle: boolean){
        this.isEditMode = toggle
        if(toggle){
            this.setCollectionFilter(s => true)
        }
        else this.updateCollectionFilter()
    }
    isInCollection(sceneId: string){
        const scene = this.activeCollection.scenes.findIndex(s=>s===sceneId)
        return !(scene < 0)
    }

    setFilter(filter: Filter){
        this.filter = filter
    }
    setCollectionFilter(filter: Filter){
        this.collectionFilter = filter
    }
}

export const filter = new FilterManager()