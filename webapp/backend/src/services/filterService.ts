interface FilterOptions {
    search?: string;
    searchFields?: string[];
    sort?: string;
    skip?: string | number;
    limit?: string | number;
    [key: string]: unknown;
}

interface QueryResult {
    query: Record<string, unknown>;
    sort?: Record<string, string>[];
    skip: number;
    limit?: number;
}

export class FilterService {
    /**
     * Construit une requête de filtrage pour les données
     * @param filters - Les filtres à appliquer
     * @returns La requête construite sous forme d'objet
     */
    static buildQuery(filters: FilterOptions): Record<string, unknown> {
        const query: Record<string, unknown> = {};

        if (filters.search && filters.searchFields) {
            const searchValue = filters.search.toString().toLowerCase();
            const { searchFields } = filters;

            query.OR = searchFields.map((field: string) => ({
                [field]: { contains: searchValue },
            }));
        }

        for (const key in filters) {
            if (['sort', 'skip', 'limit', 'search', 'searchFields'].includes(key)) {
                continue;
            }
            query[key] = filters[key];
        }

        return query;
    }

    /**
     * Applique le tri et la pagination à une requête
     * @param query - La requête à filtrer
     * @param filters - Les filtres à appliquer
     * @returns Un objet contenant la requête modifiée et les paramètres de tri/pagination
     */
    static applySortingAndPagination(
        query: Record<string, unknown>,
        filters: FilterOptions
    ): QueryResult {
        const result: QueryResult = {
            query,
            skip: 0,
        };

        if (filters.sort) {
            result.sort = filters.sort.split(',').map((item: string) => {
                const [field, order] = item.split(':');
                return { [field.trim()]: (order || 'asc').trim() };
            });
        }

        if (filters.skip) {
            result.skip =
                typeof filters.skip === 'string'
                    ? parseInt(filters.skip, 10) || 0
                    : Number(filters.skip) || 0;
        }

        if (filters.limit) {
            result.limit =
                typeof filters.limit === 'string'
                    ? parseInt(filters.limit, 10) || undefined
                    : Number(filters.limit) || undefined;
        }

        return result;
    }
}
