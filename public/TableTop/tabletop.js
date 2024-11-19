let konvaStage = null
let lastSceneId = null

let loadingOverlay = null

async function main(){
    loadingOverlay = document.getElementById('loading-overlay')
    
    let source = new EventSource('/connect')

    onbeforeunload = () => {
        source.close()
    }

    let fogs = []
    konvaStage = new Konva.Stage({
        container: 'konvacontainer', // ID HTML kontejneru
        width: innerWidth,
        height: innerHeight,
    });

    const sceneImage = document.getElementById('scene-placeholder')
    const ipOverlay = document.getElementById('ip-overlay')

    let config = null

    function hideAddressOverlay(){
        ipOverlay.style.display = "none"
    }

    async function loadConfig(){
        const configRequest = await fetch('/config')
        const cfg = await configRequest.json()
        config = cfg
    }

    source.addEventListener('message', function(e) {
        const data = JSON.parse(e.data)
        if(data.type == 'show-map'){
            hideBoard()
            const path = data.path
            lastSceneId = data.sceneid
            console.log(data)
            sceneImage.src = `../${path}`
            console.log("Connected")
            hideAddressOverlay()
        }
        else if(data.type == 'render-fog'){
            console.log(data.fogs)
            if(!data.fogs) konvaStage.clear()
            fogs = data.fogs
        }
        else if(data.type == 'fog-visibility'){
            console.log(data)
            console.log(lastSceneId)
            console.log(data.sceneid)
            if(lastSceneId == data.sceneid){
                fogs = data.fogs
                renderFogs()
            }
        }
    }, false)

    sceneImage.onload = function() {
        const ratio = innerWidth/innerHeight
        const imgRatio = this.width / this.height
        sceneImage.classList.remove('wide', 'tall')
        if(ratio < imgRatio){
            sceneImage.classList.add('wide')
        }
        else{
            sceneImage.classList.add('tall')
        }

        renderFogs()
    }

    function renderFogs(){
        const imgPositionData = sceneImage.getBoundingClientRect()
        const imgRect = {
            x: imgPositionData.x,
            y: imgPositionData.y,
            width: imgPositionData.width,
            height: imgPositionData.height
        }
        if(fogs && fogs.length > 0){
            konvaStage.destroy()
            konvaStage = konvaStage = new Konva.Stage({
                container: 'konvacontainer', // ID HTML kontejneru
                width: innerWidth,
                height: innerHeight,
            });
            fogs.filter(f => f.visible).forEach(f => {
                createKonvaPolygon(f.data, imgRect)
            })
            showBoard()
        }
        else showBoard()
    }

    async function getIp(){
        const ip = config.ip
        console.log(ip)
        if(!ip) ip = "Není dostupná WLAN adresa."
        return ip
    } 

    async function showAddress(){
        const ip = await getIp()
        ipOverlay.children.item(0).innerHTML = ip
    }

    await loadConfig()
    await showAddress()
}

function showBoard(){
    loadingOverlay.style.display = 'none'
}
function hideBoard(){
    loadingOverlay.style.display = 'block'
}

function createKonvaPolygon(points, imgRect) {
    // 2. Vytvoření vrstvy
    const layer = new Konva.Layer();

    // 3. Normalizace souřadnic na šířku a výšku stage
    const scaledPoints = points.flatMap(([x, y]) => [x * imgRect.width + imgRect.x, y * imgRect.height + imgRect.y]);

    // 4. Vytvoření polygonu
    const polygon = new Konva.Line({
        points: scaledPoints,
        fill: 'black', // Barva výplně
        stroke: 'none',                // Barva okraje
        strokeWidth: 2,
        closed: true,                  // Uzavře tvar
    });

    // 5. Přidání polygonu do vrstvy a vrstvy na stage
    layer.add(polygon);
    konvaStage.add(layer);
}