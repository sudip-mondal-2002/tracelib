"use client";
import { Box, Typography, useTheme } from '@mui/material';
import { TraceEvent } from '@prisma/client';
import {useState} from "react";
import {useRouter} from "next/navigation";
import {getLogLevelColor} from "@/utils/logLevelColor";

export interface TreeNode extends TraceEvent {
    children: TreeNode[];
}



export default function TraceTree({ data, depth = 0, selected }: { data: TreeNode; depth?: number, selected?: string }) {
    const theme = useTheme();
    const isRoot = depth === 0;
    const isTrace = data.type === 'TRACE';
    const [isHover, setIsHover] = useState<boolean>(false)
    const router = useRouter();

    return (
        <Box sx={{
            position: 'relative',
            pl: isRoot ? 0 : 3,
            mb: 1.5
        }}>
            {/* Vertical connector line */}
            {!isRoot && (
                <Box sx={{
                    position: 'absolute',
                    top: -4,
                    left: 12,
                    bottom: 18,
                    width: '1px',
                    backgroundColor: theme.palette.divider,
                }} />
            )}

            {/* Horizontal connector line */}
            {!isRoot && (
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    width: 12,
                    height: '1px',
                    backgroundColor: theme.palette.divider,
                }} />
            )}

            {/* Node content */}
            <Box sx={{
                position: 'relative',
                display: 'inline-flex',
                maxWidth: '100%',
                zIndex: 1,
                cursor: 'pointer',
             }}
                 onMouseEnter={() => setIsHover(true)}
                 onMouseLeave={() => setIsHover(false)}
                 onClick={() => {
                     router.push(`/trace/${encodeURIComponent(data.id)}`);
                 }}
            >
                {isTrace ? (
                    <Box sx={{
                        border: `1px solid ${theme.palette.secondary.main}`,
                        borderRadius: 1,
                        boxShadow: theme.shadows[1],
                        py: isHover ? 1 : 0.5,
                        px: isHover ? 2 : 1.5,
                        m: isHover ? -0.5 : 0,
                        backgroundColor: selected === data.id ? theme.palette.secondary.light : 'transparent',
                    }}>
                        <Typography
                            component="span"
                            variant="body2"
                            fontWeight="medium"
                            noWrap
                            sx={{ color: (selected === data.id) ? theme.palette.secondary.contrastText : 'inherit' }}
                        >
                            {data.name}
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{
                        borderRadius: 1,
                        boxShadow: theme.shadows[1],
                        border: `1px solid ${getLogLevelColor(data.level, theme)}`,
                        borderLeft: `3px solid ${theme.palette.grey[500]}`,
                        py: isHover ? 1 : 0.5,
                        px: isHover ? 2 : 1.5,
                        m: isHover ? -0.5 : 0,
                        backgroundColor: selected === data.id ? getLogLevelColor(data.level, theme) : 'transparent',
                    }}>
                        <Typography
                            component="span"
                            variant="body2"
                            fontWeight={data.level === 'error' || data.level === 'exception' ? 'bold' : 'normal'}
                            noWrap
                            sx={{ color: (selected === data.id) ? theme.palette.secondary.contrastText : 'inherit' }}

                        >
                            {data.message || 'N/A'}
                            {data.level && (
                                <Box component="span" sx={{
                                    ml: 1,
                                    fontSize: '0.75rem',
                                    opacity: 0.8
                                }}>
                                    [{data.level}]
                                </Box>
                            )}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Children */}
            {data.children && data.children.length > 0 && (
                <Box sx={{
                    position: 'relative',
                    mt: 1.5,
                    pl: 3,
                    borderLeft: data.children.length > 0 ? `1px solid ${theme.palette.divider}` : 'none',
                    ml: 1
                }}>
                    {data.children.map((child) => (
                        <TraceTree key={child.id} data={child} depth={depth + 1} selected={selected} />
                    ))}
                </Box>
            )}
        </Box>
    );
}