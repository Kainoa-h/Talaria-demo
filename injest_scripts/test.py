# run: pip install TalariaClient

# Then in Python:
from talaria_client import Client
import time

client = Client("talaria:8080")
batch = [
    {"event": "testEvent1", "time": int(time.time())},
    {"event": "testEvent2", "time": int(time.time()) + 1},
]

client.ingest_batch(batch)
