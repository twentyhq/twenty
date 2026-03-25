import { type OrderBy } from './OrderBy';

// Recursive type for nested orderBy values
// Supports: OrderBy | { field: OrderBy } | { field: { subField: OrderBy } } | ...
type OrderByValue = OrderBy | { [fieldName: string]: OrderByValue };

// Supports nested ordering for:
// - Scalar fields: { field: OrderBy }
// - Composite fields: { field: { subField: OrderBy } }
// - Relation + composite: { relation: { compositeLabel: { subField: OrderBy } } }
export type RecordGqlOperationOrderBy = Array<{
  [fieldName: string]: OrderByValue;
}>;
