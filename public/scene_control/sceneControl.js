const main = async () => {
    console.log("initialized")
    const id = loadId()
    const resources = await loadResources()
    const sceneInfo = getSceneInfo(resources, id)
    console.log(sceneInfo)
    renderSceneInfo(sceneInfo)

    initAddFog(sceneInfo)

    renderFogs(sceneInfo)
}

function renderFogs(sceneInfo){
    const fogs = sceneInfo.fogs
    const fogList = document.getElementById('fogcontainer')

    fogs.forEach(fog => {
        const fogContainer = document.createElement('tr')
        fogContainer.classList.add('fog')
        const delBtn = document.createElement('button')
        delBtn.innerHTML = 'Odstranit'
        const nameLbl = document.createElement('p')
        nameLbl.innerHTML = fog.name
        const editBtn = document.createElement('a')
        editBtn.href = `/fogedit/${sceneInfo.id}/${fog.id}`
        editBtn.innerHTML = "Upravit"
        const visibleBox = document.createElement('input')
        visibleBox.type = 'checkbox'
        visibleBox.checked = fog.visible

        const tdDel = document.createElement('td')
        const tdName = document.createElement('td')
        const tdEdit = document.createElement('td')
        const tdVis = document.createElement('td')

        tdDel.appendChild(delBtn)
        tdName.appendChild(nameLbl)
        tdEdit.appendChild(editBtn)
        tdVis.appendChild(visibleBox)

        fogContainer.append(
            tdDel,
            tdName,
            tdEdit,
            tdVis
        )
        fogList.appendChild(fogContainer)

        delBtn.addEventListener('click', () => {
            removeFog(sceneInfo, fog)
        })
        visibleBox.addEventListener('click', () => {
            updateVisibility(sceneInfo, fog, visibleBox.checked)
        })
    })

    async function updateVisibility(sceneInfo, fog, visible) {
        const fogs = sceneInfo.fogs
        const index = fogs.findIndex(f => f.id === fog.id)
        if(index >= 0) {
           fogs[index].visible = visible
           await uFogRequest(sceneInfo.id, fogs)
        //    location.reload()
        }
    }

    async function removeFog(sceneInfo, fog){
        const fogs = sceneInfo.fogs
        const index = fogs.findIndex(f => f.id === fog.id)
        if(index >= 0) {
           fogs.splice(index, 1)
           await uFogRequest(sceneInfo.id, fogs)
           location.reload()
        }
    }
}

function initAddFog(sceneInfo){
    const addButton = document.getElementById('addfog')
    const fogname = document.getElementById('newfogname')
    addButton.addEventListener('click', async () => {
        const newfog = {
            name: fogname.value,
            id: generateUUID(),
            data: [],
            visible: true
        }
        const fogs = sceneInfo.fogs ? sceneInfo.fogs : []
        await uFogRequest(sceneInfo.id, [...fogs, newfog])
        fogname.value = ''
        location.reload()
    })
}

async function uFogRequest(id, fogs){
    await fetch("/fogupdate", {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: id,
            fogs: fogs
        })
    })
}

function renderSceneInfo(info){
    const nameElem = document.getElementById("scenename")
    nameElem.innerHTML = info.name
}

async function loadResources(){
    const resourcerequest = fetch("/resources/resources.json")
    const data = await(await resourcerequest).json()
    return data
}

function loadId(){
    return window.location.href.split('/scene/')[1].replaceAll("/", "")
}

function getSceneInfo(resources, id){
    const sceneData = resources.find(r => r.id === id)
    return sceneData
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

onload = main