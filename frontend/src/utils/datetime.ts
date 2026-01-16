/**
 * Datetime formatting utilities for consistent timestamp display
 * All timestamps from backend are in UTC and must be converted to user's local timezone
 */

/**
 * Format a UTC timestamp string to user-friendly local time
 * @param isoString - ISO 8601 timestamp string from backend (UTC)
 * @returns Formatted string like "15 Jan 2026, 2:30 PM" in user's local timezone
 */
export function formatTimestamp(isoString: string | null | undefined): string {
    if (!isoString) return "Time unavailable";

    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return "Invalid date";

        // Format: "15 Jan 2026, 2:30 PM" in user's local timezone
        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(date);
    } catch {
        return "Time unavailable";
    }
}

/**
 * Format a timestamp as relative time (e.g., "5 minutes ago")
 * Falls back to formatTimestamp for dates older than 1 week
 * @param isoString - ISO 8601 timestamp string from backend (UTC)
 * @returns Relative time string or formatted timestamp
 */
export function formatRelativeTime(isoString: string | null | undefined): string {
    if (!isoString) return "Time unavailable";

    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return "Invalid date";

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;

        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;

        const diffDays = Math.floor(diffHours / 24);
        if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

        // Older than 1 week: show formatted timestamp
        return formatTimestamp(isoString);
    } catch {
        return "Time unavailable";
    }
}

/**
 * Format timestamp in compact format for tables/lists
 * @param isoString - ISO 8601 timestamp string from backend (UTC)
 * @returns Formatted string like "15 Jan, 2:30 PM"
 */
export function formatCompactTimestamp(isoString: string | null | undefined): string {
    if (!isoString) return "N/A";

    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return "Invalid";

        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).format(date);
    } catch {
        return "N/A";
    }
}

/**
 * Parse and validate a timestamp from the backend
 * @param isoString - ISO 8601 timestamp string  
 * @returns Date object or null if invalid
 */
export function parseTimestamp(isoString: string | null | undefined): Date | null {
    if (!isoString) return null;

    try {
        const date = new Date(isoString);
        return isNaN(date.getTime()) ? null : date;
    } catch {
        return null;
    }
}
