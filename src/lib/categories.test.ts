import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { categories } from '../../db/schema';
import type { Database } from './db';
import { getAllCategories } from './categories';

describe('category data-access helpers', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it('returns all categories ordered alphabetically by name', async () => {
        await db.insert(categories).values([
            { name: 'Strategy', description: 'A tactical category.' },
            { name: 'Adventure', description: 'An exploratory category.' },
        ]);

        const all = await getAllCategories(db);

        expect(all.map((category) => category.name)).toEqual(['Adventure', 'Strategy']);
    });

    it('returns an empty array when no categories exist', async () => {
        await expect(getAllCategories(db)).resolves.toEqual([]);
    });
});
