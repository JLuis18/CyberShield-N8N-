/**
 * Utility functions for CyberShield browser extension
 */

/**
 * Cache management for scan results
 */
class ScanCache {
    constructor() {
        this.cache = new Map();
        this.maxAge = 24 * 60 * 60 * 1000; // 24 hours
    }

    set(url, result) {
        this.cache.set(url, {
            result,
            timestamp: Date.now()
        });
    }

    get(url) {
        const cached = this.cache.get(url);
        if (!cached) return null;

        const age = Date.now() - cached.timestamp;
        if (age > this.maxAge) {
            this.cache.delete(url);
            return null;
        }

        return cached.result;
    }

    clear() {
        this.cache.clear();
    }

    size() {
        return this.cache.size;
    }
}

/**
 * Extract domain from URL
 */
function extractDomain(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch {
        return url;
    }
}

/**
 * Get risk color based on level
 */
function getRiskColor(riskLevel) {
    const colors = {
        low: '#10b981',      // Green
        medium: '#f59e0b',   // Yellow
        high: '#ef4444',     // Red
        critical: '#dc2626', // Dark red
        safe: '#10b981',     // Green
        warning: '#f59e0b',  // Yellow
        unknown: '#6b7280'   // Gray
    };
    return colors[riskLevel] || colors.unknown;
}

/**
 * Get risk emoji based on level
 */
function getRiskEmoji(riskLevel) {
    const emojis = {
        low: '🟢',
        medium: '🟡',
        high: '🔴',
        critical: '🧨',
        safe: '✅',
        warning: '⚠️',
        unknown: '❓'
    };
    return emojis[riskLevel] || emojis.unknown;
}

/**
 * Format timestamp to readable string
 */
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays}d`;
}

/**
 * Truncate URL for display
 */
function truncateURL(url, maxLength = 50) {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
}

/**
 * Show browser notification
 */
async function showNotification(title, message, iconUrl = null) {
    try {
        await chrome.notifications.create({
            type: 'basic',
            iconUrl: iconUrl || chrome.runtime.getURL('icons/icon128.png'),
            title,
            message,
            priority: 2
        });
    } catch (error) {
        console.error('Failed to show notification:', error);
    }
}

/**
 * Update extension badge
 */
async function updateBadge(text, color, tabId = null) {
    try {
        if (tabId) {
            await chrome.action.setBadgeText({ text, tabId });
            await chrome.action.setBadgeBackgroundColor({ color, tabId });
        } else {
            await chrome.action.setBadgeText({ text });
            await chrome.action.setBadgeBackgroundColor({ color });
        }
    } catch (error) {
        console.error('Failed to update badge:', error);
    }
}

/**
 * Validate URL format
 */
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch {
        return false;
    }
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ScanCache,
        extractDomain,
        getRiskColor,
        getRiskEmoji,
        formatTimestamp,
        truncateURL,
        showNotification,
        updateBadge,
        isValidURL
    };
}
