import { Readable } from 'stream';
import { createReadStream } from 'fs';
import parquet from 'parquetjs';

// Define the TLCTripRecord interface
interface TLCTripRecord {
    vendor_id: string;
    pickup_datetime: Date;
    dropoff_datetime: Date;
    passenger_count: number;
    trip_distance: number;
    rate_code: string;
    store_and_fwd_flag: string;
    Pu_location_id: number;
    Do_location_id: number;
    payment_type: string;
    fare_amount: number;
    extra: number;
    mta_tax: number;
    tip_amount: number;
    tolls_amount: number;
    improvement_surcharge: number;
    total_amount: number;
}

// Generator function to load TLC records from Parquet files
async function* loadTLCParquet(filePath: string): AsyncGenerator<TLCTripRecord[]> {
    const reader = await parquet.ParquetReader.openFile(filePath);
    const cursor = reader.getCursor();
    let batch: TLCTripRecord[];

    while (batch = await cursor.next()) {
        yield batch;
    }
    await reader.close();
}

// Generator function to load TLC records from CSV files (optional)
async function* loadTLCCSV(filePath: string): AsyncGenerator<TLCTripRecord[]> {
    const stream = createReadStream(filePath);
    // Implement CSV streaming logic here
    // For example, use csv-parser to parse CSV records
}

export { TLCTripRecord, loadTLCParquet, loadTLCCSV };