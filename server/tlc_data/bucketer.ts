import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Load dayjs plugins
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Assigns a time bucket based on the given timestamp.
 * @param {string} timestamp - The timestamp to be bucketted (in UTC format).
 * @param {string} timeZone - The time zone to use for bucket assignment.
 * @returns {string} - The time bucket label.
 */
function assignTimeBucket(timestamp, timeZone) {
    // Convert timestamp to dayjs object and set the timezone
    const time = dayjs.utc(timestamp).tz(timeZone);

    // Example of time bucketing: buckets of 1 hour
    const hour = time.hour();
    return `${time.format('YYYY-MM-DD')} ${hour < 10 ? '0' : ''}${hour}:00`; // e.g., "2026-02-08 18:00"
}

/**
 * Aggregates demand by zone based on trip data.
 * @param {Array} trips - The array of trip objects containing zone and timestamp.
 * @param {string} timeZone - The time zone to use for aggregation.
 * @returns {Object} - Aggregated demand by zone and time bucket.
 */
function aggregateDemandByZone(trips, timeZone) {
    const demandAggregation = {};

    trips.forEach(trip => {
        const bucket = assignTimeBucket(trip.timestamp, timeZone);
        const zone = trip.zone;

        if (!demandAggregation[zone]) {
            demandAggregation[zone] = {};
        }

        if (!demandAggregation[zone][bucket]) {
            demandAggregation[zone][bucket] = 0;
        }

        demandAggregation[zone][bucket] += 1; // Count the demand
    });

    return demandAggregation;
}

export { assignTimeBucket, aggregateDemandByZone };