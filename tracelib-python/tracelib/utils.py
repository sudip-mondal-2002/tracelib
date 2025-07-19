import asyncio
import logging
import os
import aiohttp
from .core import SafeEncoder

TRACING_SERVER = os.getenv("TRACING_SERVER", "http://localhost:3000/api/traces")
QUEUE_MAX_SIZE = int(os.getenv("TRACE_QUEUE_SIZE", "1000"))
BATCH_SIZE = int(os.getenv("TRACE_BATCH_SIZE", "100"))
MAX_RETRIES = int(os.getenv("TRACE_MAX_RETRIES", "3"))
SEND_TIMEOUT = float(os.getenv("TRACE_SEND_TIMEOUT", "1.0"))
RETRY_DELAY = float(os.getenv("TRACE_RETRY_DELAY", "0.5"))

event_queue = asyncio.Queue(maxsize=QUEUE_MAX_SIZE)
sender_task = None

async def start_trace_sender():
    global sender_task
    sender_task = asyncio.create_task(send_events_loop())


async def stop_trace_sender():
    global sender_task
    if sender_task:
        sender_task.cancel()
        try:
            await sender_task
        except asyncio.CancelledError:
            pass


async def send_events_loop():
    async with aiohttp.ClientSession(json_serialize=lambda o: json.dumps(o, cls=SafeEncoder)) as session:
        while True:
            try:
                batch = []
                while len(batch) < BATCH_SIZE and not event_queue.empty():
                    events = event_queue.get_nowait()
                    batch.extend(events)

                if batch:
                    await send_events_with_backoff(session, batch)

                await asyncio.sleep(0.01 * max(1, event_queue.qsize() // 10))
            except asyncio.QueueEmpty:
                await asyncio.sleep(0.1)
            except asyncio.CancelledError:
                while not event_queue.empty():
                    events = event_queue.get_nowait()
                    batch.extend(events)
                if batch:
                    await send_events_with_backoff(session, batch)
                break
            except Exception as e:
                logging.error(f"Trace sender error: {str(e)}")
                await asyncio.sleep(1)


async def send_events_with_backoff(session, events, retry_count=0):
    if retry_count >= MAX_RETRIES:
        logging.warning(f"Max retries exceeded for {len(events)} events")
        return

    try:
        async with session.post(
                TRACING_SERVER,
                json=events,
                timeout=aiohttp.ClientTimeout(total=SEND_TIMEOUT)
        ) as response:
            if response.status >= 400:
                raise Exception(f"Server returned {response.status}")
    except Exception as e:
        delay = RETRY_DELAY * (2 ** retry_count)
        logging.warning(f"Trace send failed (attempt {retry_count + 1}): {str(e)}. Retrying in {delay:.1f}s")
        await asyncio.sleep(delay)
        await send_events_with_backoff(session, events, retry_count + 1)
