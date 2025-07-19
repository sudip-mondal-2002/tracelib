import {Theme} from "@mui/system";

export const getLogLevelColor = (level: string | null | undefined, theme: Theme) => {
    if (!level) return theme.palette.grey[300];
    switch (level.toLowerCase()) {
        case 'info': return theme.palette.info.light;
        case 'debug': return theme.palette.grey[300];
        case 'warning': return theme.palette.warning.light;
        case 'error': return theme.palette.error.light;
        case 'exception': return theme.palette.error.dark;
        default: return theme.palette.grey[300];
    }
};