export const hasMovedDropdownNode = (records: MutationRecord[]) =>
  records.some((record) =>
    Array.from(record.removedNodes).some((node) => node.isConnected),
  );
