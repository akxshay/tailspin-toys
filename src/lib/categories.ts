import { asc } from 'drizzle-orm';
import { categories } from '../../db/schema';
import type { CategoryRecord } from '../types/category';
import type { Database } from './db';

/**
 * Return all categories in stable alphabetical order.
 *
 * @param db Injectable Drizzle database client used for the query.
 * @returns Categories mapped to the application-facing category type.
 */
export async function getAllCategories(db: Database): Promise<CategoryRecord[]> {
    const rows = await db
        .select({
            id: categories.id,
            name: categories.name,
            description: categories.description,
        })
        .from(categories)
        .orderBy(asc(categories.name));

    return rows;
}
