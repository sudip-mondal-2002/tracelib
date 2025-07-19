import asyncio
import contextvars
import functools
import inspect
import json
import logging
import os
import time
import uuid
from typing import Optional, Callable, Any, Dict

tracing_context = contextvars.ContextVar("tracing_context", default=None)
current_span = contextvars.ContextVar("current_span", default=None)

class SafeEncoder(json.JSONEncoder):
    def default(self, obj):
        try:
            return super().default(obj)
        except TypeError:
            try:
                return repr(obj)
            except:
                return "Unrepresentable object"

def safe_serialize(data: Any) -> Any:
    if isinstance(data, (str, int, float, bool, type(None))):
        return data
    if isinstance(data, list):
        return [safe_serialize(item) for item in data]
    if isinstance(data, dict):
        return {k: safe_serialize(v) for k, v in data.items()}
    try:
        json.dumps(data, cls=SafeEncoder)
        return data
    except TypeError:
        return str(data)

class Logger:
    def __init__(self, name: str = "app"):
        self.name = name

    def _log(self, level: str, message: str, exc_info=None, **kwargs):
        ctx = tracing_context.get()
        if ctx is None:
            return

        parent_span_id = current_span.get(None)
        timestamp = time.time()

        safe_kwargs = {k: safe_serialize(v) for k, v in kwargs.items()}

        log_entry = {
            "id": str(uuid.uuid4()),
            "parent_id": parent_span_id,
            "type": "LOG",
            "name": self.name,
            "level": level,
            "message": message,
            "timestamp": timestamp,
            "context": safe_kwargs
        }

        if exc_info:
            if isinstance(exc_info, BaseException):
                exc_info = (type(exc_info), exc_info, exc_info.__traceback__)
            if exc_info != (None, None, None):
                log_entry["exception"] = {
                    "type": exc_info[0].__name__ if exc_info[0] else None,
                    "value": str(exc_info[1]) if exc_info[1] else None
                }

        ctx["traces"].append(log_entry)

    def info(self, message: str, **kwargs):
        self._log("INFO", message, **kwargs)

    def debug(self, message: str, **kwargs):
        self._log("DEBUG", message, **kwargs)

    def warning(self, message: str, **kwargs):
        self._log("WARNING", message, **kwargs)

    def error(self, message: str, **kwargs):
        self._log("ERROR", message, **kwargs)

    def exception(self, message: str, exc_info: Any = True, **kwargs):
        self._log("EXCEPTION", message, exc_info=exc_info, **kwargs)

def traceable(name: Optional[str] = None,
              capture_args: bool = True,
              capture_result: bool = True):
    def decorator(func: Callable):
        nonlocal name
        if name is None:
            name = func.__name__

        if inspect.iscoroutinefunction(func):
            @functools.wraps(func)
            async def async_wrapper(*args, **kwargs):
                return await _trace_call_async(func, name, capture_args, capture_result, args, kwargs)

            return async_wrapper
        else:
            @functools.wraps(func)
            def sync_wrapper(*args, **kwargs):
                return _trace_call_sync(func, name, capture_args, capture_result, args, kwargs)

            return sync_wrapper

    return decorator

async def _trace_call_async(func, name, capture_args, capture_result, args, kwargs):
    ctx = tracing_context.get()
    if ctx is None:
        return await func(*args, **kwargs)

    parent_span_id = current_span.get(None)
    span_id = str(uuid.uuid4())
    token = current_span.set(span_id)

    mono_start = time.monotonic()
    abs_start = ctx['abs_start'] + (mono_start - ctx['mono_start'])

    event: Dict[str, Any] = {
        "id": span_id,
        "parent_id": parent_span_id,
        "type": "TRACE",
        "name": name,
        "module": func.__module__,
        "function": func.__qualname__,
        "start": abs_start,
    }

    if capture_args:
        event['args'] = [safe_serialize(arg) for arg in args]
        event['kwargs'] = {k: safe_serialize(v) for k, v in kwargs.items()}

    try:
        result = await func(*args, **kwargs)
        mono_end = time.monotonic()
        abs_end = ctx['abs_start'] + (mono_end - ctx['mono_start'])
        event['end'] = abs_end
        event['duration'] = mono_end - mono_start
        if capture_result:
            event['result'] = safe_serialize(result)
        ctx['traces'].append(event)
        return result
    except Exception as e:
        mono_end = time.monotonic()
        abs_end = ctx['abs_start'] + (mono_end - ctx['mono_start'])
        event['end'] = abs_end
        event['duration'] = mono_end - mono_start
        event['error'] = str(e)
        event['exception_type'] = type(e).__name__
        ctx['traces'].append(event)
        raise
    finally:
        current_span.reset(token)


def _trace_call_sync(func, name, capture_args, capture_result, args, kwargs):
    ctx = tracing_context.get()
    if ctx is None:
        return func(*args, **kwargs)

    parent_span_id = current_span.get(None)
    span_id = str(uuid.uuid4())
    token = current_span.set(span_id)

    mono_start = time.monotonic()
    abs_start = ctx['abs_start'] + (mono_start - ctx['mono_start'])

    event: Dict[str, Any] = {
        "id": span_id,
        "parent_id": parent_span_id,
        "type": "TRACE",
        "name": name,
        "module": func.__module__,
        "function": func.__qualname__,
        "start": abs_start,
    }

    # Handle non-serializable args
    if capture_args:
        event['args'] = [safe_serialize(arg) for arg in args]
        event['kwargs'] = {k: safe_serialize(v) for k, v in kwargs.items()}

    try:
        result = func(*args, **kwargs)
        mono_end = time.monotonic()
        abs_end = ctx['abs_start'] + (mono_end - ctx['mono_start'])
        event['end'] = abs_end
        event['duration'] = mono_end - mono_start
        if capture_result:
            event['result'] = safe_serialize(result)
        ctx['traces'].append(event)
        return result
    except Exception as e:
        mono_end = time.monotonic()
        abs_end = ctx['abs_start'] + (mono_end - ctx['mono_start'])
        event['end'] = abs_end
        event['duration'] = mono_end - mono_start
        event['error'] = str(e)
        event['exception_type'] = type(e).__name__
        ctx['traces'].append(event)
        raise
    finally:
        current_span.reset(token)
