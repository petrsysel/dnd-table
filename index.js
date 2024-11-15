import fs from "fs"
import crypto from "crypto"
import os from "os"
import cookieParser from "cookie-parser"
import open from "open"
import { dirname } from "path"

import config from "./config.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const port = config.port
// open.default("google.com")
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

  updateFogs(id, fogs){
    const index = this.resources.findIndex(r => r.id === id)
    if(index >= 0) {
      this.resources[index].fogs = fogs
    }
  }

  async save(){
    return new Promise((resolve, reject) => {
      const json = JSON.stringify(this.resources, null, 4)
      console.log("Saving...")
      console.log(json)
      fs.writeFile(this.path, json, {flag: 'w'}, (err) => {
        if(err) console.log(err)
        resolve()
        console.log("Saved to " + this.path + ". Data:")
        console.log(json)
      })
    })
  }
  async load(){
    if(!fs.existsSync(this.path)){
      console.log("Path is not exist")
      fs.mkdirSync('public/resources')
      await this.save()
    }
    fs.readFile(this.path, null, (err, data) => {

      console.log(data)
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


import express from "express"
import bodyParser from "body-parser"
import fileUpload from "express-fileupload"
import { fileURLToPath } from "url"

const app = express();

const resources = new Resources()
const ttEvents = new EventManager()

resources.load()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(cookieParser())
app.use(fileUpload())

// app.get("/", (request, response) => {
//     response.send(`<h1>${getWirelessIPAddress()}</h1>`);
// });

function getWirelessIPAddress() {
  const interfaces = os.networkInterfaces();
  let wirelessIP = null;

  console.log("Interfaces:")
  for (const name of Object.keys(interfaces)) {
      // Pokud hledáš specifické rozhraní, můžeš zkontrolovat jméno (např. 'wlan0')
      console.log(name)
      if (name.toLowerCase().startsWith('wi-fi') || name.toLowerCase().startsWith('wlan')) { // nebo specifický název rozhraní
          for (const net of interfaces[name]) {
              // Kontrolujeme, zda jde o IPv4 a ne jedná se o interní (local) adresu
              if (net.family === 'IPv4' && !net.internal) {
                  wirelessIP = net.address;
                  break;
              }
          }
      }
      if (wirelessIP) break; // Přeruš cyklus, pokud IP adresu najdeme
  }

  return wirelessIP;
}

app.use("/tt", express.static("./public/TableTop/"))
app.use("/scene/:id", express.static("./public/scene_control"))
// app.use("/", express.static("./public/ControlPanel"))
app.use("/resources", express.static("./public/resources"))
app.use("/icons", express.static("./public/icons"))
app.use("/fonts", express.static("./public/fonts"))
app.use("/static/cp", express.static("./public/ControlPanel"))

function checkPin(req, res, next){
  const pin = req.cookies['pin']
  
  if(config.password === pin){
    next()
  }
  else{
    // next()
    console.log(__dirname)
    res.status(401).sendFile(__dirname + "/views/accessDenied.html")
  }
}

app.get('/', checkPin, express.static("./public/ControlPanel"))

app.put('/fogupdate', async (req, res) => {
  const sceneId = req.body.id
  const fogs = req.body.fogs

  console.log("Scene ID:")
  console.log(sceneId)
  console.log("Fog definitions:")
  console.log(fogs)
  
  resources.updateFogs(sceneId, fogs)
  try{
    await resources.save()
    res.sendStatus(200)
  }
  catch(e){
    console.log("Saving error")
    console.log(e)
    res.sendStatus(500)
  }
})

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
app.get('/config', (req, res) => {
  const ipJson = `
  {
    "ip": "${getWirelessIPAddress()}:${port}",
    "maximize": "${config.maximize}"
  }
  `
  console.log(ipJson)
  res.send(ipJson)
})
app.post('/addscene', (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }
    const sceneName = req.body.sceneName
    console.log("Scene Name:")
    console.log(sceneName)
    let file = req.files.file;
    const path = `public/resources/${req.files.file.name}`
    file.mv(path, err => {
      if (err) return res.status(500).send(err);

        console.log("File mimetype:")
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
  console.log("ShowScene - resource:")
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



app.listen(port, '0.0.0.0', () => {
  console.log(`Listening on 0.0.0.0:${port}...`);
  const fullscreenParams = config.fullscreen ?
    ["-kiosk", "-private-window"]:[]

  if(config.openOnBootup) open(`http://localhost:${port}/tt`, {
    app: {
      name: config.browserName,
      arguments: fullscreenParams
    }
  })
});

