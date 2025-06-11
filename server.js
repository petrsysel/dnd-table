import { handler } from './build/handler.js'
import express from 'express'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

app.get('/healthcheck', (req, res) => {

	res.end('ok')
})

console.log(__dirname + '/static')
app.use(express.static(__dirname + '/static'))

app.use(handler)

app.listen(3000, () => {
	console.log(`
Welcome, Dungeon Master! 🧙
Your magical table is ready.

📜 Control Panel → http://127.0.0.1:3000
🎲 Tabletop View → http://127.0.0.1:3000/tt	
`)
})