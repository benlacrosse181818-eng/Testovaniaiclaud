# B2S FVE Detector

Detekce závad na fotovoltaických panelech z termálních snímků pořízených dronem. Backend využívá Claude Vision API pro analýzu obrazu.

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

Server poběží na `http://localhost:5000`.

## API endpointy

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
├── app.py             # Flask backend
├── requirements.txt   # Python závislosti
├── .env.example       # Šablona environment proměnných
├── .gitignore         # Git ignore pravidla
└── README.md          # Dokumentace
```
