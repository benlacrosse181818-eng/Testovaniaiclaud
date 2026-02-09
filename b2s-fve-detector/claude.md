# B2S FVE Detector

## Popis projektu
Flask backend pro detekci závad na fotovoltaických (FVE) panelech z termálních snímků pořízených dronem. Analýza probíhá přes Anthropic Claude Vision API.

## Struktura souborů
```
b2s-fve-detector/
├── app.py             - Flask backend (endpointy, upload, volání Claude API)
├── requirements.txt   - Python závislosti
├── .env.example       - Šablona environment proměnných
├── .gitignore         - Git ignore pravidla
├── README.md          - Dokumentace projektu
└── claude.md          - Tento soubor
```

## API endpointy
- `POST /analyze` – upload termální fotky, vrátí analýzu závad přes Claude Vision
- `GET /health` – health check

## Technické detaily
- Python 3.10+, Flask 3.1
- Anthropic SDK pro Claude Vision API (analýza obrazu)
- Dočasné ukládání uploadů (automatické mazání po zpracování)
- Český systémový prompt specializovaný na diagnostiku FVE závad
- Validace formátu (PNG, JPG, TIFF, BMP, WebP) a velikosti (max 20 MB)
- Bez databáze – stateless API

## Detekované typy závad
- Hot spoty
- PID degradace
- Mikrotrhiny
- Znečištění
- Delaminace
- Vadné bypassové diody
- Stínění

## Uživatelské preference
- České názvy v commitech a komunikaci
- Při změnách rovnou commitovat a pushovat na GitHub (příkaz: "pushni to")

## Možná budoucí vylepšení
- Databáze pro historii analýz
- Batch analýza více snímků najednou
- Generování PDF reportů
- Vizuální anotace závad přímo do snímku
- Autentizace a rate limiting
