import { formatDistanceToNow, format } from 'date-fns';

export const formatDate = (date: string): string => {
    return format(new Date(date), 'MMM d, yyyy');
};

export const formatDateTime = (date: string): string => {
    try {
        // Backend sends UTC, Date object converts to local timezone automatically
        const dateObj = new Date(date);

        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
            return 'Time unavailable';
        }

        // Format: "20 Jan 2024, 10:45 AM"
        return format(dateObj, 'd MMM yyyy, h:mm a');
    } catch {
        return 'Time unavailable';
    }
};

export const formatRelative = (date: string): string => {
    try {
        const dateObj = new Date(date);

        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
            return '';
        }

        // Returns: "2 hours ago", "yesterday", etc.
        return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch {
        return '';
    }
};

export const truncate = (text: string, length: number): string => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
};
