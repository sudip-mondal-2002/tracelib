## FastAPI TraceLib

TraceLib is a powerful tracing and logging library for FastAPI applications that captures detailed request 
traces and logs, sending them to a central server for visualization and analysis.

## Installation
```shell
pip install fastapi tracelib
```

## Quickstart
```python
from fastapi import FastAPI, Request
from tracelib import tracing_middleware, traceable, Logger, start_trace_sender, stop_trace_sender
import asyncio

# Initialize logger
logger = Logger(name="app")

# Create FastAPI app
app = FastAPI()
app.middleware("http")(tracing_middleware)

# Start/stop trace sender
@app.on_event("startup")
async def startup():
await start_trace_sender()

@app.on_event("shutdown")
async def shutdown():
await stop_trace_sender()

# Sample service class with traceable methods
class DataService:
@traceable(name="validate_input", capture_args=True)
def validate(self, data: dict):
if "value" not in data:
raise ValueError("Missing value field")
return data["value"]

    @traceable(name="process_value", capture_result=True)
    async def process(self, value: int):
        await asyncio.sleep(0.1)  # Simulate async work
        return value * 2

service = DataService()

# Traceable endpoint
@app.post("/compute")
@traceable(name="compute_endpoint", capture_args=True, capture_result=True)
async def compute(request: Request, data: dict):
value = service.validate(data)
result = await service.process(value)
logger.info("Computation completed", input=data, output=result)
return {"result": result}

# Regular endpoint (won't be traced)
@app.get("/health")
async def health_check():
return {"status": "ok"}
```


## Configuration
```env
TRACING_SERVER=http://your-tracing-server/api/traces
```

## Decorator Options
Customize tracing behavior with decorator parameters:

```python
@traceable(
    name="custom_name",       # Custom span name
    capture_args=True,        # Record function arguments
    capture_result=False      # Record return value
)
def your_function(...):
    ...
```

## Logger Methods
The Logger class provides standard logging methods with context:

```python
logger.info("Message", key="value")
logger.debug("Debug details", data=obj)
logger.warning("Warning message")
logger.error("Error occurred")
logger.exception("Critical failure", exc_info=e, context=data)
```

