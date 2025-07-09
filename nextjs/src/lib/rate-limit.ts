// Rate limiting utility to prevent abuse
import { LRUCache } from 'lru-cache';

type RateLimitOptions = {
    // Maximum number of requests allowed within the window
    limit: number;
    // Time window in milliseconds
    windowMs: number;
};

export class RateLimiter {
    private cache: LRUCache<string, number[]>;
    private readonly limit: number;
    private readonly windowMs: number;

    constructor(options: RateLimitOptions) {
        this.limit = options.limit;
        this.windowMs = options.windowMs;

        this.cache = new LRUCache<string, number[]>({
            max: 500, // Maximum number of items to store in the cache
            ttl: this.windowMs, // Time to live in milliseconds
        });
    }

    /**
     * Check if the client has exceeded the rate limit
     * @param key Unique identifier for the client (e.g., IP address)
     * @returns Object containing hit count and whether the client is rate limited
     */
    check(key: string): { count: number; limited: boolean } {
        const now = Date.now();
        const timestamps = this.cache.get(key) || [];
        
        // Filter out timestamps that are outside the current window
        const recentTimestamps = timestamps.filter(
            (timestamp) => now - timestamp < this.windowMs
        );
        
        // Add the current timestamp
        recentTimestamps.push(now);
        
        // Update the cache
        this.cache.set(key, recentTimestamps);
        
        return {
            count: recentTimestamps.length,
            limited: recentTimestamps.length > this.limit,
        };
    }

    /**
     * Get the time remaining until the rate limit resets
     * @param key Unique identifier for the client
     * @returns Time in milliseconds until the rate limit resets, or 0 if not limited
     */
    getTimeRemaining(key: string): number {
        const timestamps = this.cache.get(key);
        if (!timestamps || timestamps.length <= this.limit) {
            return 0;
        }

        // Sort timestamps in ascending order
        const sortedTimestamps = [...timestamps].sort((a, b) => a - b);
        
        // Find the oldest timestamp that's still within the limit
        const oldestTimestampIndex = sortedTimestamps.length - this.limit - 1;
        if (oldestTimestampIndex < 0) {
            return 0;
        }

        const oldestTimestamp = sortedTimestamps[oldestTimestampIndex];
        const resetTime = oldestTimestamp + this.windowMs;
        const timeRemaining = resetTime - Date.now();
        
        return Math.max(0, timeRemaining);
    }
}
