export type WorkflowIteratorResult = {
  itemsProcessed: number;
  nextItemToProcess?: unknown;
  hasProcessedAllItems: boolean;
};
