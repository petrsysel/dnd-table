async function main(){
    let source = new EventSource('/connect')
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
        const path = e.data
        sceneImage.src = `../${path}`
        console.log("Connected")
        hideAddressOverlay()
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