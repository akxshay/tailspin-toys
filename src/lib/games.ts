import { and, asc, eq, inArray } from 'drizzle-orm';
import type { Database } from './db';
import { games, categories, publishers } from '../../db/schema';
import type { Game } from '../types/game';

export interface GameFilters {
    categoryIds?: number[];
    publisherIds?: number[];
}

const gameSelection = {
    id: games.id,
    title: games.title,
    description: games.description,
    starRating: games.starRating,
    categoryId: categories.id,
    categoryName: categories.name,
    publisherId: publishers.id,
    publisherName: publishers.name,
};

type GameSelectionRow = {
    id: number;
    title: string;
    description: string;
    starRating: number | null;
    categoryId: number | null;
    categoryName: string | null;
    publisherId: number | null;
    publisherName: string | null;
};

function normalizeIds(values?: number[] | number): number[] {
    if (values === undefined || values === null) {
        return [];
    }

    const normalized = Array.isArray(values) ? values : [values];
    return [...new Set(normalized.filter((value) => Number.isInteger(value) && value > 0))];
}

function buildFilterConditions(filters: GameFilters) {
    const conditions = [];
    const categoryIds = normalizeIds(filters.categoryIds);
    const publisherIds = normalizeIds(filters.publisherIds);

    if (categoryIds.length > 0) {
        conditions.push(inArray(games.categoryId, categoryIds));
    }

    if (publisherIds.length > 0) {
        conditions.push(inArray(games.publisherId, publisherIds));
    }

    return conditions;
}

function mapGame(row: GameSelectionRow): Game {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        starRating: row.starRating,
        category:
            row.categoryId !== null && row.categoryName !== null
                ? { id: row.categoryId, name: row.categoryName }
                : null,
        publisher:
            row.publisherId !== null && row.publisherName !== null
                ? { id: row.publisherId, name: row.publisherName }
                : null,
    };
}

function baseGamesQuery(db: Database, filters: GameFilters = {}) {
    const query = db
        .select(gameSelection)
        .from(games)
        .leftJoin(categories, eq(games.categoryId, categories.id))
        .leftJoin(publishers, eq(games.publisherId, publishers.id));

    const filterConditions = buildFilterConditions(filters);
    if (filterConditions.length > 0) {
        return query.where(and(...filterConditions));
    }

    return query;
}

/**
 * Return games ordered by title, optionally narrowed to the selected category and publisher filters.
 *
 * @param db Injectable Drizzle database client used for the query.
 * @param filters Optional category and publisher ids to include.
 * @returns Games mapped to the app-facing type.
 */
export async function getGamesByFilters(db: Database, filters: GameFilters = {}): Promise<Game[]> {
    const rows = await baseGamesQuery(db, filters).orderBy(asc(games.title));
    return rows.map(mapGame);
}

/** All games ordered by title. */
export async function getAllGames(db: Database, filters: GameFilters = {}): Promise<Game[]> {
    return getGamesByFilters(db, filters);
}

/**
 * Return the ids for games in the same stable ordering, optionally narrowed by the selected filters.
 *
 * @param db Injectable Drizzle database client used for the query.
 * @param filters Optional category and publisher ids to include.
 * @returns Game ids ordered by title.
 */
export async function getAllGameIds(db: Database, filters: GameFilters = {}): Promise<number[]> {
    const query = db.select({ id: games.id }).from(games);
    const filterConditions = buildFilterConditions(filters);

    const rows = filterConditions.length > 0
        ? await query.where(and(...filterConditions)).orderBy(asc(games.title))
        : await query.orderBy(asc(games.title));

    return rows.map((row) => row.id);
}

/**
 * Return a single game by id, or null when it does not exist.
 *
 * @param db Injectable Drizzle database client used for the query.
 * @param id Game id to look up.
 * @param filters Optional category and publisher ids to scope results by.
 * @returns The matching game or null when no row exists.
 */
export async function getGameById(db: Database, id: number, filters: GameFilters = {}): Promise<Game | null> {
    const conditions = [...buildFilterConditions(filters), eq(games.id, id)];
    const row = await db
        .select(gameSelection)
        .from(games)
        .leftJoin(categories, eq(games.categoryId, categories.id))
        .leftJoin(publishers, eq(games.publisherId, publishers.id))
        .where(and(...conditions))
        .get();

    return row ? mapGame(row) : null;
}
