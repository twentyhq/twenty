import { type WorkspaceDynamicRelationMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-dynamic-relation-metadata-args.interface';
import { type WorkspaceEntityMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-entity-metadata-args.interface';
import { type WorkspaceExtendedEntityMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-extended-entity-metadata-args.interface';
import { type WorkspaceFieldMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-field-metadata-args.interface';
import { type WorkspaceIndexMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-index-metadata-args.interface';
import { type WorkspaceJoinColumnsMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-join-columns-metadata-args.interface';
import { type WorkspaceRelationMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-relation-metadata-args.interface';

type Constructor = new (...args: unknown[]) => unknown;

export class MetadataArgsStorage {
  private readonly entities: WorkspaceEntityMetadataArgs[] = [];
  private readonly extendedEntities: WorkspaceExtendedEntityMetadataArgs[] = [];
  private readonly fields: WorkspaceFieldMetadataArgs[] = [];
  private readonly relations: WorkspaceRelationMetadataArgs[] = [];
  private readonly dynamicRelations: WorkspaceDynamicRelationMetadataArgs[] =
    [];
  private readonly indexes: WorkspaceIndexMetadataArgs[] = [];
  private readonly joinColumns: WorkspaceJoinColumnsMetadataArgs[] = [];

  addEntities(...entities: WorkspaceEntityMetadataArgs[]): void {
    this.entities.push(...entities);
  }

  addExtendedEntities(
    ...extendedEntities: WorkspaceExtendedEntityMetadataArgs[]
  ): void {
    this.extendedEntities.push(...extendedEntities);
  }

  addFields(...fields: WorkspaceFieldMetadataArgs[]): void {
    this.fields.push(...fields);
  }

  addRelations(...relations: WorkspaceRelationMetadataArgs[]): void {
    this.relations.push(...relations);
  }

  addIndexes(...indexes: WorkspaceIndexMetadataArgs[]): void {
    this.indexes.push(...indexes);
  }

  addDynamicRelations(
    ...dynamicRelations: WorkspaceDynamicRelationMetadataArgs[]
  ): void {
    this.dynamicRelations.push(...dynamicRelations);
  }

  addJoinColumns(...joinColumns: WorkspaceJoinColumnsMetadataArgs[]): void {
    this.joinColumns.push(...joinColumns);
  }

  filterEntities(
    target: Constructor | string,
  ): WorkspaceEntityMetadataArgs | undefined;

  filterEntities(
    target: (Constructor | string)[],
  ): WorkspaceEntityMetadataArgs[];

  filterEntities(
    target: (Constructor | string) | (Constructor | string)[],
  ): WorkspaceEntityMetadataArgs | undefined | WorkspaceEntityMetadataArgs[] {
    const objects = this.filterByTarget(this.entities, target);

    return Array.isArray(objects) ? objects[0] : objects;
  }

  filterExtendedEntities(
    target: Constructor | string,
  ): WorkspaceExtendedEntityMetadataArgs | undefined;

  filterExtendedEntities(
    target: (Constructor | string) | (Constructor | string)[],
  ):
    | WorkspaceExtendedEntityMetadataArgs
    | undefined
    | WorkspaceExtendedEntityMetadataArgs[] {
    const objects = this.filterByTarget(this.extendedEntities, target);

    return Array.isArray(objects) ? objects[0] : objects;
  }

  filterFields(target: Constructor | string): WorkspaceFieldMetadataArgs[];

  filterFields(
    target: (Constructor | string) | (Constructor | string)[],
  ): WorkspaceFieldMetadataArgs[] {
    return this.filterByTarget(this.fields, target);
  }

  filterRelations(
    target: Constructor | string,
  ): WorkspaceRelationMetadataArgs[];

  filterRelations(
    target: (Constructor | string)[],
  ): WorkspaceRelationMetadataArgs[];

  filterRelations(
    target: (Constructor | string) | (Constructor | string)[],
  ): WorkspaceRelationMetadataArgs[] {
    return this.filterByTarget(this.relations, target);
  }

  filterIndexes(target: Constructor | string): WorkspaceIndexMetadataArgs[];

  filterIndexes(
    target: (Constructor | string) | (Constructor | string)[],
  ): WorkspaceIndexMetadataArgs[] {
    return this.filterByTarget(this.indexes, target);
  }

  filterDynamicRelations(
    target: Constructor | string,
  ): WorkspaceDynamicRelationMetadataArgs[];

  filterDynamicRelations(
    target: (Constructor | string) | (Constructor | string)[],
  ): WorkspaceDynamicRelationMetadataArgs[] {
    return this.filterByTarget(this.dynamicRelations, target);
  }

  filterJoinColumns(
    target: Constructor | string,
  ): WorkspaceJoinColumnsMetadataArgs[];

  filterJoinColumns(
    target: (Constructor | string) | (Constructor | string)[],
  ): WorkspaceJoinColumnsMetadataArgs[] {
    return this.filterByTarget(this.joinColumns, target);
  }

  protected filterByTarget<T extends { target: Constructor | string }>(
    array: T[],
    target: (Constructor | string) | (Constructor | string)[],
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
  private collectFromClass<T extends { target: Constructor | string }>(
    array: T[],
    cls: Constructor,
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
  private collectFromString<T extends { target: Constructor | string }>(
    array: T[],
    targetString: string,
  ): T[] {
    return array.filter((item) => item.target === targetString);
  }
}

export const metadataArgsStorage = new MetadataArgsStorage();
