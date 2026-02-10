# B2S FVE Detector

## Popis projektu
Flask aplikace s webovým UI pro detekci závad na fotovoltaických (FVE) panelech z termálních snímků pořízených dronem. Analýza probíhá přes Anthropic Claude Vision API, výsledky se zobrazují přímo v prohlížeči.

## Struktura souborů
```
b2s-fve-detector/
├── app.py                - Flask backend (endpointy, upload, volání Claude API)
├── templates/
│   └── index.html        - Webové UI (Tailwind CSS + DaisyUI, vanilla JS)
├── requirements.txt      - Python závislosti
├── .env.example          - Šablona environment proměnných
├── .gitignore            - Git ignore pravidla
├── README.md             - Dokumentace projektu
├── claude.md             - Tento soubor
├── promt.md              - Zadání projektu
├── test_app.py           - Testy
└── test_thermal.png      - Testovací snímek
```

## API endpointy
- `GET /` – webové rozhraní (šablona index.html)
- `POST /analyze` – upload termální fotky, vrátí analýzu závad přes Claude Vision
- `GET /health` – health check

## Webové UI (templates/index.html)
- Tailwind CSS + DaisyUI (CDN, theme `corporate`)
- 4 stavové obrazovky: upload, loading, results, error
- Drag & drop + kliknutí pro výběr souboru
- Klientská validace (formát, velikost 20 MB)
- Náhled obrázku před uploadem
- Markdown → HTML formátování analýzy
- Barevné badges pro závažnost (kritická/vysoká/střední/nízká)
- Health check indikátor (ping /health každých 30s)
- Vše v češtině, responzivní design

## Technické detaily
- Python 3.10+, Flask 3.1
- Anthropic SDK pro Claude Vision API (analýza obrazu)
- Dočasné ukládání uploadů (automatické mazání po zpracování)
- Český systémový prompt specializovaný na diagnostiku FVE závad
- Validace formátu (PNG, JPG, TIFF, BMP, WebP) a velikosti (max 20 MB)
- Error handler pro 413 (soubor příliš velký) → vrací JSON
- Bez databáze – stateless API

## Detekované typy závad
- Hot spoty
- PID degradace
- Mikrotrhiny
- Znečištění
- Delaminace
- Vadné bypassové diody
- Stínění

## Trénovací dataset
- **Thermal PV Panel Detection Dataset for UAV Inspection** (YOLO formát)
- Train: 235 snímků + 233 labelů, Val: 83 + 83, Test: 35 + 35
- Labely: bounding boxy, třída 0 = FVE panel/článek
- Lokace: `/Desktop/B2S-zadání/Data na trenovaní/Fotky/`
- Zatím slouží pro referenci, plánováno pro trénování vlastního modelu

## Uživatelské preference
- České názvy v commitech a komunikaci
- Při změnách rovnou commitovat a pushovat na GitHub (příkaz: "pushni to")

## Aktuální stav vývoje
- [x] Flask backend s Claude Vision API
- [x] Webové UI s drag & drop uploadem
- [x] Health check s vizuálním indikátorem
- [x] Formátované výsledky analýzy s badges
- [x] Error handling (413, API chyby)
- [ ] Trénování vlastního detekčního modelu (YOLO)
- [ ] Batch analýza více snímků
- [ ] Generování PDF reportů
- [ ] Vizuální anotace závad do snímku
- [ ] Databáze pro historii analýz
- [ ] Autentizace a rate limiting
