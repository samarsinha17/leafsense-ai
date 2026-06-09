import json
import sys
import traceback

from app.training.inference import EfficientNetInferenceEngine


def _write(payload: dict) -> None:
    sys.stdout.write(json.dumps(payload))
    sys.stdout.flush()


def main() -> int:
    if len(sys.argv) < 2:
        _write({"ok": False, "error": "Missing worker mode."})
        return 2
    mode = sys.argv[1]
    engine = EfficientNetInferenceEngine()
    try:
        if mode == "status":
            _write({"ok": True, "status": engine.status(load_model=True)})
            return 0
        if mode == "predict":
            if len(sys.argv) < 3:
                _write({"ok": False, "error": "Missing image path."})
                return 2
            top_k = int(sys.argv[3]) if len(sys.argv) > 3 else 5
            predictions = engine.predict_top(sys.argv[2], top_k=top_k)
            _write({"ok": True, "predictions": predictions})
            return 0
        _write({"ok": False, "error": f"Unknown worker mode: {mode}"})
        return 2
    except BaseException as exc:
        _write(
            {
                "ok": False,
                "error": "".join(traceback.format_exception_only(type(exc), exc)).strip(),
            }
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
