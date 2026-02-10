# Zadání projektu: B2S FVE Detector

## Cíl
Vytvořit Flask aplikaci s webovým rozhraním pro automatickou detekci závad na fotovoltaických (FVE) panelech z termálních snímků pořízených dronem.

## Požadavky

### API endpointy
1. **GET /** – webové rozhraní pro upload a analýzu snímků
2. **POST /analyze** – upload termální fotky, vrátí analýzu závad
3. **GET /health** – health check

### Externí služby
- Anthropic Claude Vision API pro analýzu termálních snímků

### Databáze
- Zatím žádná – pouze dočasné ukládání uploadů (automatické mazání po zpracování)

## Požadované soubory
- [x] `requirements.txt` – Python závislosti
- [x] `app.py` – Flask backend
- [x] `templates/index.html` – Webové UI (Tailwind + DaisyUI)
- [x] `.env.example` – šablona environment proměnných
- [x] `.gitignore` – pravidla pro git
- [x] `README.md` – dokumentace projektu
- [x] `claude.md` – popis projektu pro AI asistenta

## Funkční požadavky
- Validace formátu souboru (PNG, JPG, TIFF, BMP, WebP)
- Maximální velikost uploadu 20 MB
- Český systémový prompt pro Claude Vision API zaměřený na diagnostiku FVE závad
- Odpovědi API v češtině
- Chybové hlášky v češtině
- Identifikace typů závad: hot spoty, PID degradace, mikrotrhiny, znečištění, delaminace, bypassové diody, stínění
- U každé závady: typ, závažnost, pozice, doporučení opravy
- Celkové shrnutí stavu panelu a priorita zásahu

## Požadavky na webové UI
- [x] Drag & drop + kliknutí pro výběr souboru
- [x] Klientská validace formátu a velikosti
- [x] Náhled obrázku před uploadem
- [x] Loading stav se spinnerem
- [x] Formátované výsledky s barevnými badges pro závažnost
- [x] Statistiky použití (model, tokeny)
- [x] Health check indikátor
- [x] Responzivní design
- [x] Error handling s retry tlačítkem

## Nefunkční požadavky
- Stateless API (bez databáze)
- Konfigurace přes environment proměnné (.env)
- Dočasné soubory se automaticky mažou po zpracování

## Trénovací data
- Dataset: Thermal PV Panel Detection Dataset for UAV Inspection
- Formát: YOLO (bounding boxy)
- Rozdělení: train (235), val (83), test (35)
- Plánované využití: trénování vlastního detekčního modelu
