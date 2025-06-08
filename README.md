# DnD Table Projector

For english version, **scroll down**.

---

Jednoduchý software pro **promítání map při hraní Dungeons & Dragons** (nebo jiného TTRPG) na **televizi, monitor nebo projektor** – ideálně jako „digitální herní stůl“.

Navržený tak, aby byl **lehký, rychlý a přehledný**.  
Běží čistě **lokálně**, bez potřeby internetu.

## Funkce

- **Scény s mapami** – snadno přidávej a přepínej mapy
- **Přechody mezi scénami** – plynulý dissolve efekt
- **Organizace scén do kolekcí** – pořádek i při větší kampani či více kampaních
- **Fog of War vrstvy** – nastavitelné masky pro zakrývání oblastí
- **Rychlé přepínání vrstev** – podle fáze scény, části mapy apod.

---

## První spuštění

1. Klonuj repozitář:
```bash
git clone https://github.com/petrsysel/dnd-table.git
```
2. Nainstaluj závislosti
```bash
npm install
```
3. Sestav aplikaci
```bash
npm run build
```
4. Spusť aplikaci
```bash
npm run start
```

## Další spuštění
Pokud už máš jednou sestaveno, stačí:
```bash
npm run start
```
Aplikace poběží na lokální adrese, která se zobrazí po spuštění (Například: http://localhost:4173/). Adresu je třeba otevřít v prohlížeči.

Na základní adrese běží ovládací panel pro DM. Promítací plocha (tabletop) běží na stejné adrese na stránce `/tt` (Například: http://localhost:4173/tt).

Tuto stránku otevři na druhém monitoru nebo televizi a spusť ve fullscreenu pomocí klávesy F11.

---

Vytvořeno z lásky ke hře, přátelství a kouzlu posezení u jednoho stolu.


## English version

A simple tool for **projecting maps during Dungeons & Dragons** (or other TTRPG) sessions onto a **TV, monitor or projector** – ideal as a “digital game table”.

Designed to be **lightweight, fast and easy to use**.  
Runs **entirely locally**, with no internet connection required.

## Features

- **Map scenes** – easily add and switch between map images
- **Smooth scene transitions** – with dissolve effect
- **Organize scenes into collections** – stay tidy even across multiple campaigns
- **Fog of War layers** – mask out areas as needed
- **Quick layer switching** – for different phases or regions of a scene

---

## First run

1. Clone the repository:
```bash
git clone https://github.com/petrsysel/dnd-table.git
```
2. Install dependencies:
```bash
npm install
```
3. Build the application:
```bash
npm run build
```
4. Start the local server:
```bash
npm run start
```

## Subsequent runs
If already built, just run:
```bash
npm run start
```

The app will run locally at an address shown in the terminal (e.g. http://localhost:4173/).
Open this address in your browser.

The default page is the DM control panel.
The tabletop view is available at /tt (e.g. http://localhost:4173/tt).

Open the /tt page on your second monitor or TV, and enter fullscreen with F11.

---

Created out of love for games, storytelling, and the magic of gathering around a table.

# License

This project is licensed under the MIT License – see the [LICENSE](./LICENSE.txt) file for details.