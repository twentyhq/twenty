/* eslint-disable @typescript-eslint/ban-types */

import { WorkspaceFieldMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-field-metadata-args.interface';
import { WorkspaceObjectMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-object-metadata-args.interface';
import { WorkspaceRelationMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-relation-metadata-args.interface';

export class MetadataArgsStorage {
  readonly objects: WorkspaceObjectMetadataArgs[] = [];
  readonly fields: WorkspaceFieldMetadataArgs[] = [];
  readonly relations: WorkspaceRelationMetadataArgs[] = [];

  filterObjects(
    target: Function | string,
  ): WorkspaceObjectMetadataArgs | undefined;

  filterObjects(target: (Function | string)[]): WorkspaceObjectMetadataArgs[];

  filterObjects(
    target: (Function | string) | (Function | string)[],
  ): WorkspaceObjectMetadataArgs | undefined | WorkspaceObjectMetadataArgs[] {
    const objects = this.filterByTarget(this.objects, target);

    return Array.isArray(objects) ? objects[0] : objects;
  }

  filterFields(target: Function | string): WorkspaceFieldMetadataArgs[];

  filterFields(target: (Function | string)[]): WorkspaceFieldMetadataArgs[];

  filterFields(
    target: (Function | string) | (Function | string)[],
  ): WorkspaceFieldMetadataArgs[] {
    return this.filterByTarget(this.fields, target);
  }

  filterRelations(target: Function | string): WorkspaceRelationMetadataArgs[];

  filterRelations(
    target: (Function | string)[],
  ): WorkspaceRelationMetadataArgs[];

  filterRelations(
    target: (Function | string) | (Function | string)[],
  ): WorkspaceRelationMetadataArgs[] {
    return this.filterByTarget(this.relations, target);
  }

  protected filterByTarget<T extends { target: Function | string }>(
    array: T[],
    target: (Function | string) | (Function | string)[],
  ): T[] {
    if (Array.isArray(target)) {
      return target.flatMap((targetItem) => {
        if (typeof targetItem === 'function') {
          return this.collectFromClass(array, targetItem);
        }

        return this.collectFromString(array, targetItem);
      });
    } else {
      return typeof target === 'function'
        ? this.collectFromClass(array, target)
        : this.collectFromString(array, target);
    }
  }

  // Private helper to collect metadata from class prototypes
  private collectFromClass<T extends { target: Function | string }>(
    array: T[],
    cls: Function,
  ): T[] {
    const collectedMetadata: T[] = [];
    let currentTarget = cls;

    // Collect metadata from the current class and all its parent classes
    while (currentTarget !== Function.prototype) {
      collectedMetadata.push(
        ...array.filter((item) => item.target === currentTarget),
      );
      currentTarget = Object.getPrototypeOf(currentTarget);
    }

    return collectedMetadata;
  }

  // Private helper to collect metadata directly by string comparison
  private collectFromString<T extends { target: Function | string }>(
    array: T[],
    targetString: string,
  ): T[] {
    return array.filter((item) => item.target === targetString);
  }
}

export const metadataArgsStorage = new MetadataArgsStorage();
