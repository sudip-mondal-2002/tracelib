"use client";
import React from 'react';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    TableContainer, useTheme
} from '@mui/material';
import {TraceEvent} from "@prisma/client";
import {getLogLevelColor} from "@/utils/logLevelColor";

const DetailView = ({ event }: {
    event: TraceEvent
}) => {
    const theme = useTheme()
    if (!event) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body1">Select an event to view details</Typography>
            </Box>
        );
    }

    // Format timestamp to human readable date
    const formatTime = (timestamp: number) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp * 1000);
        return date.toLocaleString();
    };

    // Format duration in milliseconds with 4 decimal places
    const formatDuration = (duration: number) => {
        if (!duration) return 'N/A';
        return (duration * 1000).toFixed(4) + ' ms';
    };

    // Format JSON data for display
    const formatJson = (data: never) => {
        if (!data) return 'N/A';
        return JSON.stringify(data, null, 2);
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
                {event.name || event.type} Details
            </Typography>

            <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table size="small">
                    <TableBody>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>ID</TableCell>
                            <TableCell>{event.id}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                            <TableCell>{event.type}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Request ID</TableCell>
                            <TableCell>{event.requestId}</TableCell>
                        </TableRow>
                        {event.parentId && (
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Parent ID</TableCell>
                                <TableCell>{event.parentId}</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {event.type === 'TRACE' && (
                <>
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                        Function Details
                    </Typography>
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table size="small">
                            <TableBody>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Name</TableCell>
                                    <TableCell>{event.name || 'N/A'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Module</TableCell>
                                    <TableCell>{event.module || 'N/A'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Function</TableCell>
                                    <TableCell>{event.function || 'N/A'}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Typography variant="subtitle1" gutterBottom>
                        Timing Information
                    </Typography>
                    <TableContainer component={Paper} sx={{ mb: 3 }}>
                        <Table size="small">
                            <TableBody>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Start</TableCell>
                                    <TableCell>{event.start ? formatTime(event.start): 'N/A'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>End</TableCell>
                                    <TableCell>{event.end ? formatTime(event.end): 'N/A'}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Duration</TableCell>
                                    <TableCell>{event.duration ? formatDuration(event.duration): 'N/A'}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {event.statusCode && (
                <TableContainer component={Paper} sx={{ mb: 3 }}>
                    <Table size="small">
                        <TableBody>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>Status Code</TableCell>
                                <TableCell>{event.statusCode}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {event.message && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Message
                    </Typography>
                    <Paper sx={{ p: 2, backgroundColor: getLogLevelColor(event.level, theme) + "44" }}>
                        <Box component="pre" sx={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            fontSize: '0.875rem',
                            fontFamily: 'monospace',

                        }}>
                            {event.message}
                        </Box>
                    </Paper>
                </Box>
            )}

            {(event.args || event.kwargs) && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Inputs
                    </Typography>
                    <Paper sx={{ p: 2 }}>
                        {event.args && (event.args as never[]) .length ? (
                            <>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Arguments:</Typography>
                                {
                                    (event.args as never[]).map((arg)=>{
                                        return <Box key={arg} component="pre" sx={{
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            fontSize: '0.875rem',
                                            fontFamily: 'monospace'
                                        }}>
                                            {formatJson(arg)}
                                        </Box>
                                    })
                                }

                            </>
                        ):
                            <Typography variant="body2" >No positional Arguments</Typography>
                        }
                        {event.kwargs && Object.keys(event.kwargs).length ? (
                            <>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>Keyword Arguments:</Typography>
                                {
                                    Object.keys(event.kwargs).map((k: string)=>{
                                        return <Box key={k} component="pre" sx={{
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            fontSize: '0.875rem',
                                            fontFamily: 'monospace',
                                            backgroundColor: theme.palette.primary.light + "44",
                                            my: 1,
                                            borderRadius: 2,
                                            p: 1
                                        }}>
                                            <b>{k}</b>: {event.kwargs && formatJson((event.kwargs  as unknown as never)[k])}
                                        </Box>
                                    })
                                }

                            </>
                        ):
                            <Typography variant="body2" >No Keyword Arguments</Typography>
                        }
                    </Paper>
                </Box>
            )}

            {
                (event.type == 'TRACE' && !event.statusCode) && <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Output
                    </Typography>
                    <Paper sx={{ p: 2 }}>
                            <Box component="pre" sx={{
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                fontSize: '0.875rem',
                                fontFamily: 'monospace',
                                backgroundColor: theme.palette.success.light + "44",
                                my: 1,
                                borderRadius: 2,
                                p: 1
                            }}>
                                {event.result ? formatJson(event.result as unknown as never): "None"}
                            </Box>

                    </Paper>
                </Box>
            }
            {event.error && (
                <>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>Error:</Typography>
                    <Box component="pre" sx={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontSize: '0.875rem',
                        fontFamily: 'monospace',
                        backgroundColor: theme.palette.error.light + "44",
                        my: 1,
                        borderRadius: 2,
                        p: 1
                    }}>
                        {event.error}
                    </Box>
                </>
            )}
            {event.exception && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Exception Details
                    </Typography>
                    <Paper sx={{ p: 2 }}>
                        <Box component="pre" sx={{
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            fontSize: '0.875rem',
                            fontFamily: 'monospace',
                            backgroundColor: theme.palette.error.dark + "44",
                            my: 1,
                            borderRadius: 2,
                            p: 1
                        }}>
                            {formatJson(event.exception as unknown as never)}
                        </Box>
                    </Paper>
                </Box>
            )}
        </Box>
    );
};

export default DetailView;