const fs = require('fs')
const crypto = require('crypto')

class Resources{
  resources = []
  path = "public/resources/resources.json"
  constructor(){
    this.resources = []
  }
  get(id){
    return this.resources.find(r => r.id === id)
  }
  add(name, path, type){
    this.resources.push({
      name: name,
      path: path,
      type: type,
      id: crypto.randomUUID()
    })
  }
  remove(id){
    const index = this.resources.findIndex(r => r.id === id)
    if(index >= 0) this.resources.splice(index, 1)
  }
  cleanRemove(id){
    const resource = this.resources.find(r => r.id === id)
    if(resource){
      const sameImage = this.resources.filter(r => r.path === resource.path)
      if(sameImage.length == 1){
        fs.rm(`public/${resource.path}`, () => {

        })
      }
    }
    this.remove(id)
  }

  save(){
    return new Promise((resolve, reject) => {
      const json = JSON.stringify(this.resources, null, 4)
      fs.writeFile(this.path, json, () => {
        resolve()
      })
    })
  }
  async load(){
    if(!fs.existsSync(this.path)){
      await this.save()
    }
    fs.readFile(this.path, null, (err, data) => {
      const loaded = JSON.parse(data)
      if(loaded) this.resources = loaded
      else this.resources = []
    })
  }
}

class EventManager{
  listeners = []

  on(event, listener){
    this.listeners.push({
      event: event,
      listener: listener
    })
  }

  emit(event, data){
    this.listeners.forEach(l => {
      if(l.event === event) l.listener(data)
    })
  }
}

const express = require("express");
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')

const app = express();

const resources = new Resources()
const ttEvents = new EventManager()

resources.load()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(fileUpload())

app.get("/", (request, response) => {
    response.send("<h1>Hi there</h1>");
});

app.use("/tt", express.static("./public/TableTop/"))
app.use("/dm", express.static("./public/ControlPanel"))
app.use("/resources", express.static("./public/resources"))
app.use("/icons", express.static("./public/icons"))
app.use("/fonts", express.static("./public/fonts"))

app.get('/connect', function(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  })
  // res.write(`data: ahoj \n\n`)
  ttEvents.on('show', (data) => {
    res.write(`data: ${data} \n\n`)
  })
})
app.post('/addscene', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
    const sceneName = req.body.sceneName
    console.log(sceneName)
    let file = req.files.file;
    const path = `public/resources/${req.files.file.name}`
    file.mv(path, err => {
      if (err) return res.status(500).send(err);

        console.log(file.mimetype)
        resources.add(sceneName, path.replace('public/', ''), file.mimetype)
        resources.save()
        res.send("OK")
    });
})

app.post('/removescene', (req, res) => {
    const sceneId = req.body.id

    resources.cleanRemove(sceneId)
    resources.save()

    res.send("OK")
})

app.post('/showscene', (req, res) => {
  const sceneId = req.body.id
  const resource = resources.get(sceneId)
  console.log(resource)
  if(resource){
    ttEvents.emit('show', resource.path)
  }
  res.send("OK")
})
  
function countdown(res, count) {
  res.write("data: " + count + "\n\n")
  if (count)
    setTimeout(() => countdown(res, count-1), 1000)
  else
    res.end()
}



app.listen(3000, '0.0.0.0', () => {
    console.log("Listening on 0.0.0.0:3000...");
});

