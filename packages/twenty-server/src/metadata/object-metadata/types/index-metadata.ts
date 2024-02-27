export type IndexType = 'btree' | 'gin';

export type IndexMetadata = {
  // Name of the index, can be delegated to the engine.
  name?: string;

  // Specifies the type of index, e.g., B-Tree, Hash, etc.
  type?: IndexType;

  // Column(s) the index is on. The order matters here.
  columns?: string[];

  // For expression-based indexes, e.g., lower(columnName).
  expression?: string;

  // Create index without locking writes on the table.
  concurrently?: boolean;

  // Whether the index should be unique.
  unique?: boolean;

  // Controls whether NULL values should be placed first or last.
  nullsOrder?: 'NULLS FIRST' | 'NULLS LAST';

  // Condition for partial indexes.
  where?: string;

  // Operator class names for each column.
  operatorClasses?: Record<string, string>;
};
