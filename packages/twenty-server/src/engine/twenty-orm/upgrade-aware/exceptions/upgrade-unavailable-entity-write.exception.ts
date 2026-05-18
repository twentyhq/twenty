// Thrown when a TypeORM write method is invoked on an entity that hasn't been
// introduced at the current upgrade position. Catching authoring mistakes
// early is cheaper than letting the underlying SQL fail with a confusing
// "relation does not exist" deep inside a workspace step.

export class UpgradeUnavailableEntityWriteException extends Error {
  constructor(entityName: string, method: string) {
    super(
      `Cannot ${method} on ${entityName}: this entity is decorated with ` +
        `@WasIntroducedInUpgrade and the introducing command has not been ` +
        `applied at the current upgrade position. Run the upgrade further ` +
        `before writing to it, or move the write later in the sequence.`,
    );

    this.name = 'UpgradeUnavailableEntityWriteException';
  }
}
