# B2S FVE Detector

Detekce závad na fotovoltaických panelech z termálních snímků pořízených dronem. Aplikace využívá Claude Vision API pro analýzu obrazu a nabízí webové rozhraní pro nahrání snímků a zobrazení výsledků.

## Požadavky

- Python 3.10+
- Anthropic API klíč

## Instalace

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Doplň ANTHROPIC_API_KEY do .env
```

## Spuštění

```bash
python app.py
```

Server poběží na `http://localhost:5000`. Otevři tuto adresu v prohlížeči pro webové rozhraní.

## Webové rozhraní

Aplikace obsahuje kompletní webové UI dostupné na `GET /`:

- **Drag & drop** nebo kliknutí pro nahrání termálního snímku
- **Náhled** nahraného souboru před analýzou
- **Klientská validace** formátu a velikosti (max 20 MB)
- **Formátované výsledky** analýzy s barevnými badges pro závažnost (kritická, vysoká, střední, nízká)
- **Statistiky** použití (model, vstupní/výstupní tokeny)
- **Health check** indikátor v navbaru (zelený/červený, ping každých 30s)
- **Responzivní design** — Tailwind CSS + DaisyUI (CDN)

## API endpointy

### GET /

Webové rozhraní pro nahrání a analýzu snímků.

### GET /health

Health check.

```bash
curl http://localhost:5000/health
```

```json
{"status": "ok"}
```

### POST /analyze

Upload termálního snímku FVE panelu k analýze závad.

**Parametry:** `file` – obrázek (PNG, JPG, TIFF, BMP, WebP, max 20 MB)

```bash
curl -X POST http://localhost:5000/analyze \
  -F "file=@thermal_image.jpg"
```

**Odpověď:**

```json
{
  "request_id": "a1b2c3d4e5f6",
  "model": "claude-sonnet-4-5-20250929",
  "analysis": "Analýza termálního snímku...",
  "usage": {
    "input_tokens": 1500,
    "output_tokens": 800
  }
}
```

## Struktura projektu

```
b2s-fve-detector/
├── app.py                # Flask backend + API endpointy
├── templates/
│   └── index.html        # Webové UI (Tailwind + DaisyUI)
├── requirements.txt      # Python závislosti
├── .env.example          # Šablona environment proměnných
├── .gitignore            # Git ignore pravidla
├── README.md             # Dokumentace
├── claude.md             # Popis projektu pro AI asistenta
├── promt.md              # Zadání projektu
├── test_app.py           # Testy
└── test_thermal.png      # Testovací snímek
```

## Trénovací dataset

Projekt využívá dataset **Thermal PV Panel Detection Dataset for UAV Inspection** ve formátu YOLO:

- **Train:** 235 snímků + 233 labelů
- **Val:** 83 snímků + 83 labelů
- **Test:** 35 snímků + 35 labelů

Labely obsahují bounding boxy ve formátu YOLO (třída 0 = FVE panel/článek).
Dataset zatím slouží pro referenci a budoucí trénování vlastního detekčního modelu.
