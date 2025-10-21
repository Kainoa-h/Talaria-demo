# run: pip install TalariaClient

# Then in Python:
from talaria_client import Client

client = Client("talaria:8080")
batch = [
    {
        "event": "testEvent1",
        "time": 1,
    },
    {"event": "testEvent2", "time": 2},
]

client.ingest_batch(batch)
