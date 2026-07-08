import time
from contextlib import asynccontextmanager
from typing import Any, Dict


def log_event(event: str, **fields: Any) -> None:
    safe_fields = " ".join(f"{key}={value}" for key, value in fields.items())
    print(f"[PulseForge] event={event} {safe_fields}".strip())


@asynccontextmanager
async def timed_stage(stage: str, **fields: Any):
    started = time.perf_counter()
    log_event(f"{stage}.start", **fields)
    try:
        yield
        elapsed_ms = int((time.perf_counter() - started) * 1000)
        log_event(f"{stage}.success", elapsedMs=elapsed_ms, **fields)
    except Exception as exc:
        elapsed_ms = int((time.perf_counter() - started) * 1000)
        log_event(f"{stage}.error", elapsedMs=elapsed_ms, error=type(exc).__name__, **fields)
        raise


def stage_record(stage: str, started: float, status: str = "completed", detail: str = "") -> Dict[str, Any]:
    return {
        "stage": stage,
        "status": status,
        "detail": detail,
        "elapsedMs": int((time.perf_counter() - started) * 1000),
    }
