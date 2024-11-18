// Globals... FUJTAJBL!
let polygon = null
let baseFog = [
    [0.25, 0.25],
    [0.75, 0.25],
    [0.75, 0.75],
    [0.25, 0.75]
]

const main = async () => {
    console.log("Initialized")
    const imgElem = document.getElementById('sceneimg')

    const ids = loadIds()
    const id = ids.sceneId
    const fogId = ids.fogId
    const resources = await loadResources()
    const sceneInfo = getSceneInfo(resources, id)
    console.log(sceneInfo)

    const imgPosition = await loadImg(imgElem, sceneInfo)
    const imgRect = {
        x: imgPosition.x,
        y: imgPosition.y,
        width: imgPosition.width,
        height: imgPosition.height
    }

    setBaseFog(sceneInfo, fogId)
    initEditor(imgRect)
    setControls(sceneInfo, imgRect, fogId)
}

function setBaseFog(sceneInfo, fogId){
    const fog = sceneInfo.fogs.find(f => f.id == fogId)
    if(fog.data.length >= 4){
        baseFog = fog.data
    }
}

function setControls(sceneInfo, imgRect, fogId){
    const saveAndBack = document.getElementById('saveandback')
    saveAndBack.onclick = async (ev) => {
        ev.preventDefault()
        const coords = pairCoordinates(polygon.attrs.points)
        const normalized = normalizeCoords(coords, imgRect)
        console.log(normalized)
        const fogs = sceneInfo.fogs
        const index = fogs.findIndex(fog => fog.id == fogId)
        
        fogs[index].data = normalized
        await uFogRequest(sceneInfo.id, fogs)
        window.location.href = `/scene/${sceneInfo.id}`
    }
    // saveAndBack.href = `/scene/${sceneInfo.id}`

    console.log(polygon)
}

function normalizeCoords(coords, imgRect){
    return coords.map(cp => {
        return [
            cp[0]/imgRect.width,
            cp[1]/imgRect.height
        ]
    })
}

function pairCoordinates(array) {
    return array.reduce((result, value, index) => {
        if (index % 2 === 0) { // Každý sudý index znamená začátek nové dvojice
            result.push([value, array[index + 1]]);
        }
        return result;
    }, []).filter(pair => pair[1] !== undefined); // Odstraníme nekompletní dvojice
}

async function loadImg(imgElem, sceneInfo){
    return new Promise((resolve, reject) => {
        imgElem.onload = function() {
            const ratio = innerWidth/innerHeight
            const imgRatio = this.width / this.height
            imgElem.classList.remove('wide', 'tall')
            if(ratio < imgRatio){
                imgElem.classList.add('wide')
            }
            else{
                imgElem.classList.add('tall')
            }
            resolve(imgElem.getBoundingClientRect())
        }
    
        imgElem.src = `/${sceneInfo.path}`
    })
    
}

function loadIds(){
    const both = window.location.href.split('/fogedit/')[1]. split('/')
    console.log(both)
    return {
        sceneId: both[0],
        fogId: both[1]
    }
}

async function loadResources(){
    const resourcerequest = fetch("/resources/resources.json")
    const data = await(await resourcerequest).json()
    return data
}

function getSceneInfo(resources, id){
    const sceneData = resources.find(r => r.id === id)
    return sceneData
}

function initEditor(imgRect){
    var stage = new Konva.Stage({
        container: 'editor-container',   // id of container <div>
        width: innerWidth,
        height: imgRect.height,
        x: imgRect.x,
        y: 0
    });
      
    var layer = new Konva.Layer();
      
    var circles = baseFog.map(cp => new Konva.Circle({
        x: cp[0] * imgRect.width,
        y: cp[1] * imgRect.height,
        radius: 5,
        stroke: 'white',
        // fill: 'white',
        zIndex: 10,
        strokeWidth: 1,
        draggable: true,
    }))
      
    const circlesToPoints = (circles) => {
        return circles.map(circle => 
            [circle.attrs.x, circle.attrs.y]
        ).reduce((prev, current) =>  prev.concat(current))
    }
      
    polygon = new Konva.Line({
        points: circlesToPoints(circles),
        fill: '#AAAAAAAA',
        // stroke: 'none',
        strokeWidth: 1,
        draggable: false,
        closed: true,
        dash:[]
    });
      
    var touched = false;
      
    const addEventToCircle = (circle) => {
        circle.on('dragmove', (e) => {
            console.log(JSON.stringify(e))
            console.log(`drag move. x: ${circle.attrs.x}, y: ${circle.attrs.y}`)
            polygon.points(circlesToPoints(circles))
            layer.draw()
        })
        circle.on('mouseover', (e)  => {
            circle.radius(10)
            layer.draw()
        })
        circle.on('mouseout', ()  => {
            circle.radius(5)
            layer.draw()
        })
    }
      
    circles.map((circle) => addEventToCircle(circle))
      
    polygon.on('click', (e) => {
        console.log('click')
        console.log(e)
        var mousePos = stage.getPointerPosition();
        const x = mousePos.x - imgRect.x
        const y = mousePos.y
        const points = polygon.attrs.points
        for (i=0; i < points.length / 2; i++) {
            const s_x = points[i * 2]
            const s_y = points[i * 2 + 1]
            const e_x = points[(i * 2 + 2) % points.length]
            const e_y = points[(i * 2 + 3) % points.length]
          
            console.log(`i: ${i}, x: ${x}, y: ${y}, sx: ${s_x}, sy: ${s_y}, ex: ${e_x}, ey: ${e_y}`)

            if (((s_x <= x && x <= e_x) || (e_x <= x && x <= s_x)) && ((s_y <= y && y <= e_y) || (e_y <= y && y <= s_y))) {
                point = new Konva.Circle({
                    x: x,
                    y: y,
                    radius: 3,
                    stroke: 'white',
                    strokeWidth: 1,
                    draggable: true,
                });
                addEventToCircle(point)
                console.log(`insert at ${i + 1}`)
                circles.splice(i + 1, 0, point)
                polygon.points(circlesToPoints(circles))
                layer.add(point)
                layer.draw()
                break;
            }
        }
    })
      
      
    layer.add(polygon, ...circles);
    stage.add(layer);
    layer.draw();
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

onload = main