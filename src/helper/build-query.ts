import { FindMany } from "../interfaces/query.interface";

export const buildFirestoreQuery = (
  query: FirebaseFirestore.Query,
  options: FindMany
) => {
  if (options.search) {
    query = query.where("name", "==", options.search);
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
