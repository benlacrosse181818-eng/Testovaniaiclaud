# Zadání projektu: B2S FVE Detector

## Cíl
Vytvořit Flask backend pro automatickou detekci závad na fotovoltaických (FVE) panelech z termálních snímků pořízených dronem.

## Požadavky

### API endpointy
1. **POST /analyze** – upload termální fotky, vrátí analýzu závad
2. **GET /health** – health check

### Externí služby
- Anthropic Claude Vision API pro analýzu termálních snímků

### Databáze
- Zatím žádná – pouze dočasné ukládání uploadů (automatické mazání po zpracování)

## Požadované soubory
- [x] `requirements.txt` – Python závislosti
- [x] `app.py` – Flask backend
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

## Nefunkční požadavky
- Stateless API (bez databáze)
- Konfigurace přes environment proměnné (.env)
- Dočasné soubory se automaticky mažou po zpracování
