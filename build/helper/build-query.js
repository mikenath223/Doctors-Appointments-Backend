"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFirestoreQuery = void 0;
const buildFirestoreQuery = (query, options) => {
    if (options.search) {
        const searchText = options.search;
        query = query
            .orderBy("name")
            .startAt(searchText)
            .endAt(searchText + "\uf8ff");
    }
    if (options.sort) {
        options.sort.forEach((sortField) => {
            const [field, direction] = sortField.split(":");
            query = query.orderBy(field, direction === "desc" ? "desc" : "asc");
        });
    }
    if (options.offset) {
        query = query.offset(options.offset);
    }
    if (options.limit) {
        query = query.limit(options.limit);
    }
    return query;
};
exports.buildFirestoreQuery = buildFirestoreQuery;
