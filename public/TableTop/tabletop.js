function main(){
    let source = new EventSource('/connect')
    const sceneImage = document.getElementById('scene-placeholder')

    source.addEventListener('message', function(e) {
        const path = e.data
        sceneImage.src = `../${path}`
        
    }, false)

    sceneImage.onload = function() {
        const ratio = innerWidth/innerHeight
        const imgRatio = this.width / this.height
        sceneImage.classList.remove('wide', 'tall')
        if(ratio < imgRatio){
            sceneImage.classList.add('wide')
        }
        else sceneImage.classList.add('tall')
    }

    // source.addEventListener('open', function(e) {
    //     console.log("connected")
    // }, false)
}