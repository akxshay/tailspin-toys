import { asc } from 'drizzle-orm';
import { publishers } from '../../db/schema';
import type { PublisherRecord } from '../types/publisher';
import type { Database } from './db';

/**
 * Return all publishers in stable alphabetical order.
 *
 * @param db Injectable Drizzle database client used for the query.
 * @returns Publishers mapped to the application-facing publisher type.
 */
export async function getAllPublishers(db: Database): Promise<PublisherRecord[]> {
    const rows = await db
        .select({
            id: publishers.id,
            name: publishers.name,
            description: publishers.description,
        })
        .from(publishers)
        .orderBy(asc(publishers.name));

    return rows;
}
