import prisma from '@/utils/prisma';
import { Box } from '@mui/material';
import TraceRow from "@/components/TraceRow";

export default async function Home() {
    const traces = await prisma.traceEvent.findMany({
        where: {
            parentId: null
        },
        orderBy: { timestamp: 'desc' },
        take: 100,
    });

    return (
        <Box>
            {
                traces.map(trace => (
                    <TraceRow
                        key={trace.id}
                        traceId={trace.id}
                        requestId={trace.requestId}
                        name={trace.name || 'N/A'}
                        start={trace.start}
                        duration={trace.duration}
                        statusCode={trace.statusCode || 0}
                    />
                ))
            }
        </Box>
    );
}