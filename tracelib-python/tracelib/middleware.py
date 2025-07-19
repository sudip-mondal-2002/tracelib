import asyncio
import time
import uuid
from fastapi import Request, Response
from .core import tracing_context, current_span, safe_serialize
from .utils import event_queue

async def tracing_middleware(request: Request, call_next) -> Response:
    request_id = request.headers.get('X-Request-ID', str(uuid.uuid4()))
    root_span_id = str(uuid.uuid4())

    abs_start = time.time()
    mono_start = time.monotonic()

    ctx_data = {
        "request_id": request_id,
        "traces": [],
        "abs_start": abs_start,
        "mono_start": mono_start,
    }

    tracing_token = tracing_context.set(ctx_data)
    span_token = current_span.set(root_span_id)

    try:
        response = await call_next(request)
        status_code = response.status_code
        error = None
    except Exception as e:
        status_code = 500
        error = e
        response = None

    abs_end = time.time()
    mono_end = time.monotonic()
    duration = mono_end - mono_start

    root_event = {
        "id": root_span_id,
        "parent_id": None,
        "type": "TRACE",
        "name": f"HTTP {request.method} {request.url.path}",
        "start": abs_start,
        "end": abs_end,
        "duration": duration,
        "status_code": status_code,
        "request_id": request_id,
    }
    if error:
        root_event['error'] = str(error)
        root_event['exception_type'] = type(error).__name__

    # Add request_id to all events
    all_events = [root_event] + ctx_data['traces']
    for event in all_events:
        event['request_id'] = request_id

    # Queue events for sending
    try:
        event_queue.put_nowait(all_events)
    except asyncio.QueueFull:
        logging.warning(f"Trace queue full, dropping events for {request_id}")

    current_span.reset(span_token)
    tracing_context.reset(tracing_token)

    if error:
        raise error from None
    return response or Response(status_code=status_code)
