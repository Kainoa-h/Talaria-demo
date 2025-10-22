# Talaria Demo

This repository demonstrates a real-time data ingestion and querying system using [Talaria](https://github.com/kelindar/talaria), a distributed, highly available, and low-latency time-series database optimized for event-based data.

## Architecture

The demo consists of three main components:

- **Talaria**: In-memory columnar storage engine with gRPC/AWS SQS ingestion and Presto Thrift connector for querying
- **Presto**: Distributed SQL query engine that queries hot data from Talaria via Thrift
- **Python Client**: Data ingestion script that sends events to Talaria via gRPC

## Contents

```
config/
├── presto/              # Presto configuration files
│   ├── catalog/
│   │   └── thrift.properties
│   ├── config.properties
│   └── jvm.config
├── conf.yaml            # Talaria configuration
├── schema.yaml          # Event schema definition
└── entrypoint.sh        # Talaria container startup script

injest_scripts/
└── test.py              # Python script to ingest test events

compose.yaml             # Docker Compose setup
presto-proxy.js          # Node.js CORS proxy for Presto UI
presto-query.html        # Web UI for ad-hoc SQL queries
```

### Configuration

**Schema** (`config/schema.yaml`):

```yaml
event: string
time: int64
```

**Talaria Config** (`config/conf.yaml`):

- gRPC writer on port 8080
- Presto Thrift reader on port 8042
- Table: `eventlog` with 1-hour TTL

## How to Run the Demo

### Prerequisites

- Docker and Docker Compose
- Node.js (for the Presto proxy)
- `watch` command (usually pre-installed on macOS/Linux)

### Step 1: Build or Configure Talaria Image

The `compose.yaml` file references `talaria:custom`. You have two options:

**Option A: Build from source**

```bash
# Clone Talaria repository and build
git clone https://github.com/kelindar/talaria.git
cd talaria
docker build -t talaria:custom .
cd ../talaria-demo
```

**Option B: Use pre-built image**

Edit `compose.yaml` and change the image line:

```yaml
image: kelindar/talaria:latest
```

### Step 2: Start the Services

```bash
docker compose up
```

This will start:

- Talaria (gRPC: `localhost:8081`, Thrift: `localhost:8042`)
- Presto (UI: `http://localhost:8080`)
- Python client container (for ingestion)

### Step 3: Ingest Test Data

Run the following command to continuously send events to Talaria every 3 seconds:

```bash
watch -n 3 docker exec -it talaria-python python test.py
```

This will ingest batches of events with:

- `event`: `testEvent1` or `testEvent2`
- `time`: current Unix timestamp

### Step 4: Query the Data

Start the Node.js CORS proxy (required for browser access to Presto):

```bash
node presto-proxy.js
```

The proxy runs on `http://localhost:9090` and forwards requests to Presto at `http://localhost:8080`.

Open `presto-query.html` in your browser. You can run ad-hoc SQL queries such as:

```sql
SELECT * FROM eventlog WHERE event = 'testEvent1' AND (time % 10) = 7
```

The web UI will display results in a table format and show the raw JSON response.

### Example Queries

```sql
-- Get all events
SELECT * FROM eventlog

-- Filter by event type
SELECT * FROM eventlog WHERE event IN ('404 Error', '418 Error')

-- Filter by both
SELECT count(*) FROM eventlog WHERE event = '404 Error' AND (time % 10) = 7

```

## Stopping the Demo

```bash
# Stop the watch command: Ctrl+C
# Stop the Node.js proxy: Ctrl+C
# Stop Docker services
docker compose down
```

## Notes

- Talaria keeps data in memory with a 1-hour TTL (configurable in `config/conf.yaml`)
- The `eventlog` table is hash-partitioned by the `event` field
- Presto queries the hot data directly from Talaria's memory via Thrift
- Data is stored in `./data` directory (mounted volume)
