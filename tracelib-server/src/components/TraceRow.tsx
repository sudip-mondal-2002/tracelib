import React from 'react';
import {Grid, Typography, Chip, Button} from '@mui/material';
import { getStatusColor } from '@/utils/statusColor';
interface TraceRowProps {
    traceId: string;
    requestId: string;
    name: string;
    statusCode: number;
    start: number | null;
    duration: number | null;
}

const TraceRow = ({ traceId, requestId, name, statusCode, start, duration }: TraceRowProps) => {
    // Determine color based on status code
    // Format timestamp to readable format
    const formatTime = (timestamp: number) => {
        return new Date(timestamp*1000).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <Grid
            container
            spacing={2}
            alignItems="center"
            sx={{
                py: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:hover': { backgroundColor: 'action.hover' }
            }}
        >
            <Grid>
                <a href={`/trace/${encodeURIComponent(traceId)}`}>
                    <Button  sx={{ textTransform: 'none' }}>
                    {requestId}
                </Button></a>
            </Grid>

            <Grid>
                <Typography variant="body2" noWrap title={name}>
                    {name}
                </Typography>
            </Grid>

            <Grid>
                <Chip
                    label={statusCode}
                    color={getStatusColor(statusCode)}
                    size="small"
                    sx={{
                        borderRadius: 4,
                        minWidth: 60,
                        fontWeight: 'bold'
                    }}
                />
            </Grid>

            <Grid>
                <Typography variant="body2">
                    {start ? formatTime(start) : 'N/A'}
                </Typography>
            </Grid>

            <Grid>
                <Typography variant="body2">
                    {duration? <>{Math.floor(duration*1000)/1000}ms</>: 'N/A'}
                </Typography>
            </Grid>
        </Grid>
    );
};

export default TraceRow;