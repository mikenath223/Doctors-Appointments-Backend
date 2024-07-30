import { FindMany } from "../interfaces/query.interface";

export const buildFirestoreQuery = (
  query: FirebaseFirestore.Query,
  options: FindMany
) => {
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
