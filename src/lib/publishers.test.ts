import { beforeEach, describe, expect, it } from 'vitest';
import { publishers } from '../../db/schema';
import { createTestDatabase } from '../../db/test-helpers';
import type { Database } from './db';
import { getAllPublishers } from './publishers';

describe('publisher data-access helpers', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it('returns all publishers ordered alphabetically by name', async () => {
        await db.insert(publishers).values([
            { name: 'Zeta Games', description: 'A publisher.' },
            { name: 'Alpha Games', description: 'Another publisher.' },
        ]);

        const all = await getAllPublishers(db);

        expect(all).toEqual([
            {
                id: expect.any(Number),
                name: 'Alpha Games',
                description: 'Another publisher.',
            },
            {
                id: expect.any(Number),
                name: 'Zeta Games',
                description: 'A publisher.',
            },
        ]);
    });

    it('returns an empty array when no publishers exist', async () => {
        expect(await getAllPublishers(db)).toEqual([]);
    });
});
