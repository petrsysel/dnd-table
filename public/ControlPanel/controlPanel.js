const showBtnElems = []

async function main(){
    let addSceneButton = document.getElementById("add-scene-btn")
    let addSceneName = document.getElementById('add-scene-name')
    let addSceneFile = document.getElementById("add-scene-file")
    let sceneContainer = document.getElementById("scene-container")
    const controlPanel = document.getElementById("control-panel")

    const rawResources = await fetch("../resources/resources.json")
    const resources = await rawResources.json()
    console.log(resources)
    render(sceneContainer, resources)


    addSceneButton.onclick = async () => {
        let photo = addSceneFile.files[0];
        const sceneName = addSceneName.value
        addSceneName.value = ""

        if(!photo | !sceneName) return

        await addScene(sceneName, photo)
        location.reload()
    }

    addSceneFile.onchange = function (e){
        var file = e.target.files[0];
    
        var reader = new FileReader();
        reader.onloadend = function(){
            controlPanel.style.backgroundImage = "url(" + reader.result + ")";
        }
        if(file){
            reader.readAsDataURL(file);
        }
    }
}

function removeSelectedClass(){
    showBtnElems.forEach(btn => {
        btn.children.item(0).classList.remove('selected-btn')
    })
}

/**
 * 
 * @param {HTMLElement} parentElement 
 * @param {any[]} resources
 */
function render(parentElement, resources){
    resources.reverse().forEach(resource => {
        const elem = document.createElement('div')
        const removeImg = document.createElement('img')
        removeImg.src = '../icons/remove-white.png'
        const showImg = document.createElement('img')
        showImg.src ='../icons/show-white.png'
        const removeButton = document.createElement('a')
        const nameLabel = document.createElement('p')
        const showButton = document.createElement('a')

        removeButton.append(removeImg)
        showButton.append(showImg)
        nameLabel.innerHTML = resource.name

        const banner = document.createElement('div')
        banner.classList.add('banner')
        banner.append(
            removeButton,
            nameLabel,
            showButton
        )

        elem.append(
            banner
        )
        elem.classList.add('scene')
        elem.style.backgroundImage = `url("../${resource.path}")`
        removeButton.onclick = async () => {
            await removeScene(resource.id)
            location.reload()
        }
        
        showBtnElems.push(showButton)

        showButton.onclick = async () => {
            await showScene(resource.id)
            removeSelectedClass()
            showButton.children.item(0).classList.add('selected-btn')
        }
        parentElement.appendChild(elem)
    })
}
function showScene(id){
    return new Promise((resolve, reject) => {
        let formData = new FormData()
        formData.append("id", id)

        fetch('/showscene', {method: "POST", body: formData})
        .then(res => {
            resolve()
        })
    })
}
function removeScene(id){
    return new Promise((resolve, reject) => {
        let formData = new FormData()
        formData.append("id", id)

        fetch('/removescene', {method: "POST", body: formData})
        .then(res => {
            resolve()
        })
    })
}
function addScene(name, image){
    return new Promise((resolve, reject) => {
        let formData = new FormData()
        formData.append("file", image)
        formData.append("sceneName", name)

        fetch('/addscene', {method: "POST", body: formData})
        .then(res => {
            resolve()
        })
    })
}