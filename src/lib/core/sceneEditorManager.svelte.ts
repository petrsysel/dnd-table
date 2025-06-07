import type { FOW, Scene } from "./scene.svelte"

class SceneEditorManager{
    isOpen = $state(false)
    openedScene: Scene | undefined = $state()
    onSceneChangedListeners: (()=>void)[] = []
    openedFowLayer: Map<string, string> = $state(new Map())
    activeFowLayer = $state('')

    async open(sceneId: string){
        const formData = new FormData();
        formData.append('id', sceneId);
        const res = await fetch('/api/get-scene', {
            method: 'POST',
            body: formData,
        })

        const response = await res.json()
        if(!response.result) return

        this.openedScene = response.scene
        this.isOpen = true
        this.changeSceneTrigger()
        this.setLastActiveFow()
    }

    close(){
        this.isOpen = false
    }

    changeSceneTrigger(){
        this.onSceneChangedListeners.forEach(l=>l())
    }
    onSceneChanged(listener: () => void){
        this.onSceneChangedListeners.push(listener)
    }

    async loadFow(){
        const scene = this.openedScene
        if(!scene) return
        const formData = new FormData();
        formData.append('id', scene.id);
        const res = await fetch('/api/get-fow', {
            method: 'POST',
            body: formData,
        })
        const response = await res.json()
        const result = response.result
        if(!result) return
        const fow: FOW[] = response.fow
        scene.fowLayers = fow
    }

    isActiveFow(fowId: string){
        return this.activeFowLayer === fowId
    }
    setActiveFow(fowId: string){
        this.activeFowLayer = fowId
        if(!this.openedScene) return
        this.openedFowLayer.set(this.openedScene.id, fowId)
        this.loadFow()
    }
    setLastActiveFow(){
        if(!this.openedScene) return
        const sceneId = this.openedScene.id
        const last = this.openedFowLayer.get(sceneId)
        
        if(!last){
            if(this.openedScene.fowLayers.length <= 0) return
            this.setActiveFow(this.openedScene.fowLayers[0].id)
        }
        else{
            this.setActiveFow(last)
        }
    }
}

export const sceneEditorManager = new SceneEditorManager()