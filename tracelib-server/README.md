# Tracelib Server Docker Image

A Docker image for running Tracelib Server with PostgreSQL database support.

## Quick Start with Docker Compose

1. Create a `docker-compose.yml` file with the following content:

```yaml
version: '3.8'

services:
  tracelib-server:
    image: sudipmondal2002/tracelib-server
    container_name: tracelib-server
    ports:
      - "3000:3000"  # Map your desired host port to container port 3000
    environment:
      - DATABASE_URL=postgres://tracelib:password@postgres/tracelib
      - PORT=3000
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:13
    container_name: tracelib-postgres
    environment:
      - POSTGRES_USER=tracelib
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=tracelib
    volumes:
      - tracelib-data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  tracelib-data:
```


2. Start the services:

```bash
docker-compose up -d
```

### Configuration Options
Instead of using a local postgres, you may use a managed postgresql server. 
Please update the DATABASE_URL in that case

### Accessing the Application
After starting the containers, the Tracelib Server will be available at:
```shell
http://localhost:3000
```
