import os
import base64
import uuid
import shutil
from pathlib import Path

from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import anthropic

load_dotenv()

app = Flask(__name__)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "tiff", "tif", "bmp", "webp"}
MAX_CONTENT_LENGTH = 20 * 1024 * 1024  # 20 MB
app.config["MAX_CONTENT_LENGTH"] = MAX_CONTENT_LENGTH

ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-5-20250929")

SYSTEM_PROMPT = """Jsi expert na diagnostiku fotovoltaických (FVE) panelů z termálních snímků pořízených dronem.

Analyzuj přiložený termální snímek a identifikuj závady. Pro každou nalezenou závadu uveď:
1. Typ závady (hot spot, PID degradace, mikrotrhiny, znečištění, delaminace, bypassová dioda, stínění, atd.)
2. Závažnost (nízká / střední / vysoká / kritická)
3. Přibližná pozice na panelu
4. Doporučený postup opravy

Na konci shrň celkový stav panelu a prioritu zásahu.

Odpovídej vždy v češtině. Buď stručný a konkrétní."""


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def encode_image(file_path: Path) -> tuple[str, str]:
    """Načte soubor a vrátí (base64_data, media_type)."""
    suffix = file_path.suffix.lower()
    media_types = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp",
        ".tiff": "image/tiff",
        ".tif": "image/tiff",
        ".bmp": "image/bmp",
    }
    media_type = media_types.get(suffix, "image/jpeg")
    data = base64.standard_b64encode(file_path.read_bytes()).decode("utf-8")
    return data, media_type


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/analyze", methods=["POST"])
def analyze():
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return jsonify({"error": "ANTHROPIC_API_KEY není nakonfigurován"}), 500

    if "file" not in request.files:
        return jsonify({"error": "Chybí soubor. Pošli POST s polem 'file'."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Nebyl vybrán žádný soubor."}), 400

    if not allowed_file(file.filename):
        return jsonify({
            "error": f"Nepodporovaný formát. Povolené: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        }), 400

    # Uložení souboru do dočasné složky
    request_id = uuid.uuid4().hex[:12]
    safe_name = secure_filename(file.filename)
    file_path = UPLOAD_DIR / f"{request_id}_{safe_name}"
    file.save(file_path)

    try:
        image_data, media_type = encode_image(file_path)

        client = anthropic.Anthropic(api_key=api_key)
        message = client.messages.create(
            model=ANTHROPIC_MODEL,
            max_tokens=2048,
            system=SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": media_type,
                                "data": image_data,
                            },
                        },
                        {
                            "type": "text",
                            "text": "Analyzuj tento termální snímek FVE panelu a identifikuj všechny závady.",
                        },
                    ],
                }
            ],
        )

        analysis_text = message.content[0].text

        return jsonify({
            "request_id": request_id,
            "model": ANTHROPIC_MODEL,
            "analysis": analysis_text,
            "usage": {
                "input_tokens": message.usage.input_tokens,
                "output_tokens": message.usage.output_tokens,
            },
        })

    except anthropic.APIError as e:
        return jsonify({"error": f"Chyba Anthropic API: {e.message}"}), 502

    finally:
        # Smazání dočasného souboru
        file_path.unlink(missing_ok=True)


if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=debug)
