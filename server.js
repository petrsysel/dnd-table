import { handler } from './build/handler.js';
import express from 'express';

const app = express();

// add a route that lives separately from the SvelteKit app
app.get('/healthcheck', (req, res) => {

	res.end('ok');
});

// let SvelteKit handle everything else, including serving prerendered pages and static assets
app.use(express.static('/static/'))
app.use(handler);

app.listen(3000, () => {
	console.log(`
Welcome, Dungeon Master! 🧙
Your magical table is ready.

📜 Control Panel → http://127.0.0.1:3000
🎲 Tabletop View → http://127.0.0.1:3000/tt	
`)
});
