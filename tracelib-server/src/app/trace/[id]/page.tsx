import prisma from '@/utils/prisma';
import TraceTree, {TreeNode} from "@/components/TraceTree"; // Adjust import path as needed
import {TraceEvent} from "@prisma/client";
import {Box, Typography, Paper, Chip} from "@mui/material";
import {getStatusColor} from "@/utils/statusColor";
import React from "react";
import DetailView from "@/components/DetailView";


export default async function TracePage({ params }: never) {
    const { id  } = await params;
    const currentTrace = await prisma.traceEvent.findUnique({
        where: { id },
    });

    if (!currentTrace) {
       return <>NOT FOUND</>
    }

    const traces = await prisma.traceEvent.findMany({
        where: { requestId: currentTrace.requestId },
        orderBy: { timestamp: 'asc' },
    });

    const traceTree = buildTraceTree(traces);

    return (
        <Box component="div">
            <Box sx={{ mb: 4, display: "flex", justifyContent: "flex-start", gap: 3 }}>
                <Typography variant="body1">
                    <strong>Request ID:</strong> {currentTrace.requestId}
                </Typography>
                <>
                    {traceTree && <Chip
                    label={traceTree.statusCode}
                    color={getStatusColor(traceTree.statusCode || 0)}
                    size="small"
                    sx={{
                        borderRadius: 4,
                        minWidth: 60,
                        fontWeight: 'bold'
                    }}
                />}</>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 4, minWidth: 0 }}>
                    <Paper elevation={0} sx={{
                        bgcolor: 'grey.50',
                        p: 4,
                        borderRadius: 1,
                        height: '100%'
                    }}>
                        <Box component="pre" sx={{
                            fontSize: '0.875rem',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {traceTree && <TraceTree data={traceTree} selected={id}/>}
                        </Box>
                    </Paper>
                </Box>

                <Box sx={{ flex: 6, minWidth: 0 }}>
                    <Paper elevation={0} sx={{
                        bgcolor: 'grey.50',
                        p: 4,
                        borderRadius: 1,
                        height: '100%'
                    }}>
                        <Box sx={{ height: '100%' }}>
                            <Typography variant="h6" gutterBottom>
                                Details Panel
                            </Typography>
                            <Box sx={{ p: 2 }}>
                                <DetailView event={currentTrace}/>
                            </Box>
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
}

function buildTraceTree(traces: TraceEvent[]): TreeNode | null {
    const traceMap: Record<string, TreeNode> = {};
    traces.forEach(trace => {
        traceMap[trace.id] = {
            ...trace,
            children: []
        };
    });
    let root: TreeNode | null = null;

    traces.forEach(trace => {
        const node = traceMap[trace.id];

        if (trace.parentId === null) {
            root = node;
        }

        if (trace.parentId && traceMap[trace.parentId]) {
            traceMap[trace.parentId].children.push(node);
        }
    });
    Object.values(traceMap).forEach(node => {
        node.children.sort(
            (a, b) => (a.start && b.start && (a.start - b.start)) || 0
        );
    });

    return root;
}


export const dynamic = 'force-dynamic'
