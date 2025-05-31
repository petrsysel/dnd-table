import type { Scene } from "./scene.svelte"

class SceneEditorManager{
    isOpen = $state(false)
    openedScene: Scene | undefined = $state()
    onSceneChangedListeners: (()=>void)[] = []

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
        console.log(this.openedScene?.name)
        this.isOpen = true
        this.changeSceneTrigger()
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
}

export const sceneEditorManager = new SceneEditorManager()