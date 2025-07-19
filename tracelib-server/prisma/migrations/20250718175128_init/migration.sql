-- CreateTable
CREATE TABLE "TraceEvent" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "type" TEXT NOT NULL,
    "name" TEXT,
    "module" TEXT,
    "function" TEXT,
    "start" DOUBLE PRECISION,
    "end" DOUBLE PRECISION,
    "duration" DOUBLE PRECISION,
    "status_code" INTEGER,
    "level" TEXT,
    "message" TEXT,
    "args" JSONB,
    "kwargs" JSONB,
    "result" JSONB,
    "error" TEXT,
    "exception_type" TEXT,
    "exception" JSONB,
    "timestamp" DOUBLE PRECISION,

    CONSTRAINT "TraceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TraceEvent_request_id_idx" ON "TraceEvent"("request_id");

-- CreateIndex
CREATE INDEX "TraceEvent_timestamp_idx" ON "TraceEvent"("timestamp");

-- CreateIndex
CREATE INDEX "TraceEvent_type_idx" ON "TraceEvent"("type");
