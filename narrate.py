"""Generate narration with Kokoro (local TTS).

Usage: .venv\\Scripts\\python.exe narrate.py "Your sentence." public\\narration.wav
"""
import sys
from pathlib import Path

import soundfile as sf
from kokoro_onnx import Kokoro

HERE = Path(__file__).parent
text = sys.argv[1] if len(sys.argv) > 1 else "Merge sort splits a list in half, sorts each half, and merges them back together."
out = Path(sys.argv[2]) if len(sys.argv) > 2 else HERE / "public" / "narration.wav"
out.parent.mkdir(parents=True, exist_ok=True)

kokoro = Kokoro(str(HERE / "models" / "kokoro-v1.0.int8.onnx"), str(HERE / "models" / "voices-v1.0.bin"))
samples, sr = kokoro.create(text, voice="af_heart", speed=1.0, lang="en-us")
sf.write(out, samples, sr)
print(f"wrote {out} ({len(samples) / sr:.2f}s)")
