# run: pip install TalariaClient

# Then in Python:
from talaria_client import Client
import time

client = Client("talaria:8080")
batch = [
    {"event": "404 Error", "time": int(time.time())},
    {"event": "418 Error", "time": int(time.time()) + 1},
]

client.ingest_batch(batch)

print("Sent events to the grpc writer!")
