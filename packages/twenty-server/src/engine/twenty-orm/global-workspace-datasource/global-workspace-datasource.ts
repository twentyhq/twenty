import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  DataSource,
  type DataSourceOptions,
  type EntityMetadata,
  type EntitySchema,
  type EntityTarget,
  type ObjectLiteral,
  type QueryRunner,
  type ReplicationMode,
  type SelectQueryBuilder,
} from 'typeorm';
import { EntityManagerFactory } from 'typeorm/entity-manager/EntityManagerFactory';
import { EntitySchemaTransformer } from 'typeorm/entity-schema/EntitySchemaTransformer';
import { EntityMetadataNotFoundError } from 'typeorm/error/EntityMetadataNotFoundError';
import { EntityMetadataBuilder } from 'typeorm/metadata-builder/EntityMetadataBuilder';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { type WorkspaceInternalContext } from 'src/engine/twenty-orm/interfaces/workspace-internal-context.interface';

import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { type EntitySchemaFactory } from 'src/engine/twenty-orm/factories/entity-schema.factory';
import { type WorkspaceQueryRunner } from 'src/engine/twenty-orm/query-runner/workspace-query-runner';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/workspace-context.storage';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { type WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

type CreateQueryBuilderOptions = {
  calledByWorkspaceEntityManager?: boolean;
};

const ENTITY_METADATA_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

type CachedEntityMetadata = {
  entityMetadataMap: Map<EntityTarget<ObjectLiteral>, EntityMetadata>;
  timestamp: number;
};

export class GlobalWorkspaceDataSource extends DataSource {
  private entityMetadataCache: Map<string, CachedEntityMetadata>;
  private eventEmitterService: WorkspaceEventEmitter;
  private entitySchemaFactory: EntitySchemaFactory;
  private _isConstructing = true;
  dataSourceWithOverridenCreateQueryBuilder: GlobalWorkspaceDataSource;

  constructor(
    options: DataSourceOptions,
    eventEmitterService: WorkspaceEventEmitter,
    entitySchemaFactory: EntitySchemaFactory,
  ) {
    super(options);
    this.eventEmitterService = eventEmitterService;
    this.entitySchemaFactory = entitySchemaFactory;
    this.entityMetadataCache = new Map();
    this._isConstructing = false;

    Object.defineProperty(this, 'manager', {
      get: () => this.createEntityManager(),
    });
  }

  get featureFlagMap(): FeatureFlagMap {
    const context = getWorkspaceContext();

    return context.featureFlagsMap;
  }

  get permissionsPerRoleId(): ObjectsPermissionsByRoleId {
    const context = getWorkspaceContext();

    return context.permissionsPerRoleId;
  }

  override getRepository<Entity extends ObjectLiteral>(
    target: EntityTarget<Entity>,
    permissionOptions?: RolePermissionConfig,
    authContext?: AuthContext,
  ): WorkspaceRepository<Entity> {
    const manager = this.createEntityManager();

    return manager.getRepository(target, permissionOptions, authContext);
  }

  override findMetadata(
    target: EntityTarget<ObjectLiteral>,
  ): EntityMetadata | undefined {
    const context = getWorkspaceContext();
    const { workspaceId, metadataVersion } = context;
    const cacheKey = `${workspaceId}-${metadataVersion}`;

    const cachedEntityMetadata = this.getCachedEntityMetadata(cacheKey);

    if (!cachedEntityMetadata) {
      return undefined;
    }

    return cachedEntityMetadata.entityMetadataMap.get(target);
  }

  override getMetadata(target: EntityTarget<ObjectLiteral>): EntityMetadata {
    const metadata = this.findMetadata(target);

    if (!metadata) {
      throw new EntityMetadataNotFoundError(target);
    }

    return metadata;
  }

  override createEntityManager(
    queryRunner?: QueryRunner,
  ): WorkspaceEntityManager {
    if (this._isConstructing !== false) {
      return super.createEntityManager(queryRunner) as WorkspaceEntityManager;
    }

    const context = getWorkspaceContext();
    const fullContext: WorkspaceInternalContext = {
      ...context,
      eventEmitterService: this.eventEmitterService,
    };

    return new WorkspaceEntityManager(fullContext, this, queryRunner);
  }

  override createQueryRunner(
    mode = 'master' as ReplicationMode,
  ): WorkspaceQueryRunner {
    const queryRunner = this.driver.createQueryRunner(mode);
    const manager = this.createEntityManager(queryRunner);

    Object.assign(queryRunner, { manager: manager });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return queryRunner as any as WorkspaceQueryRunner;
  }

  // Do not use, only for specific permission-related purpose
  createQueryRunnerForEntityPersistExecutor(
    mode = 'master' as ReplicationMode,
  ) {
    if (this.dataSourceWithOverridenCreateQueryBuilder) {
      const queryRunner = this.driver.createQueryRunner(mode);
      const manager = new EntityManagerFactory().create(
        this.dataSourceWithOverridenCreateQueryBuilder,
        queryRunner,
      );

      Object.assign(queryRunner, { manager: manager });

      return queryRunner;
    }

    const dataSourceWithOverridenCreateQueryBuilder = Object.assign(
      Object.create(Object.getPrototypeOf(this)),
      this,
      {
        createQueryBuilder: (
          entityOrRunner: EntityTarget<ObjectLiteral> | QueryRunner,
          alias?: string,
          queryRunner?: QueryRunner,
        ) => {
          if (isDefined(alias) && typeof alias === 'string') {
            const entity = entityOrRunner as EntityTarget<ObjectLiteral>;

            return this.createQueryBuilder(entity, alias, queryRunner, {
              calledByWorkspaceEntityManager: true,
            });
          } else {
            const runner = entityOrRunner as QueryRunner;

            return this.createQueryBuilder(runner, {
              calledByWorkspaceEntityManager: true,
            });
          }
        },
      },
    );
    const queryRunner = this.driver.createQueryRunner(mode);
    const manager = new EntityManagerFactory().create(
      dataSourceWithOverridenCreateQueryBuilder,
      queryRunner,
    );

    Object.assign(queryRunner, { manager: manager });

    return queryRunner;
  }

  override createQueryBuilder<Entity extends ObjectLiteral>(
    entityClass: EntityTarget<Entity>,
    alias: string,
    queryRunner?: QueryRunner,
    options?: CreateQueryBuilderOptions,
  ): SelectQueryBuilder<Entity>;

  override createQueryBuilder(
    queryRunner?: QueryRunner,
    options?: CreateQueryBuilderOptions, // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): SelectQueryBuilder<any>;

  // Only callable from workspaceEntityManager to guarantee a permission check was run
  override createQueryBuilder(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    queryRunnerOrEntityClass?: QueryRunner | EntityTarget<any>,
    aliasOrOptions?: string | CreateQueryBuilderOptions,
    queryRunner?: QueryRunner,
    options?: CreateQueryBuilderOptions,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): SelectQueryBuilder<any> {
    let calledByWorkspaceEntityManager;

    const isCalledWithEntityTarget =
      isDefined(aliasOrOptions) && typeof aliasOrOptions === 'string';

    if (isCalledWithEntityTarget) {
      calledByWorkspaceEntityManager = options?.calledByWorkspaceEntityManager;
    } else {
      calledByWorkspaceEntityManager = (
        aliasOrOptions as CreateQueryBuilderOptions
      )?.calledByWorkspaceEntityManager;
    }

    if (!(calledByWorkspaceEntityManager === true)) {
      throw new PermissionsException(
        'Method not allowed because permissions are not implemented at datasource level.',
        PermissionsExceptionCode.METHOD_NOT_ALLOWED,
      );
    }

    if (isCalledWithEntityTarget) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entityClass = queryRunnerOrEntityClass as EntityTarget<any>;

      return super.createQueryBuilder(
        entityClass,
        aliasOrOptions as string,
        queryRunner,
      );
    } else {
      const queryRunner = queryRunnerOrEntityClass as QueryRunner;

      return super.createQueryBuilder(queryRunner);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override query<T = any>(
    query: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parameters?: any[],
    queryRunner?: QueryRunner,
    options?: {
      shouldBypassPermissionChecks?: boolean;
    },
  ): Promise<T> {
    if (!options?.shouldBypassPermissionChecks) {
      throw new PermissionsException(
        'Method not allowed because permissions are not implemented at datasource level.',
        PermissionsExceptionCode.METHOD_NOT_ALLOWED,
      );
    }

    return super.query(query, parameters, queryRunner);
  }

  async buildWorkspaceMetadata(
    workspaceId: string,
    metadataVersion: number,
    objectMetadataMaps: ObjectMetadataMaps,
  ): Promise<void> {
    const cacheKey = `${workspaceId}-${metadataVersion}`;

    if (this.getCachedEntityMetadata(cacheKey)) {
      return;
    }

    this.clearWorkspaceEntityMetadataCache(workspaceId);

    const entitySchemas = await Promise.all(
      Object.values(objectMetadataMaps.byId)
        .filter(isDefined)
        .map((objectMetadata) =>
          this.entitySchemaFactory.create(
            workspaceId,
            objectMetadata,
            objectMetadataMaps,
          ),
        ),
    );

    const entityMetadatas = this.buildMetadatasFromSchemas(entitySchemas);

    const metadataMap = new Map<EntityTarget<ObjectLiteral>, EntityMetadata>();

    for (const metadata of entityMetadatas) {
      metadataMap.set(metadata.target, metadata);
    }

    this.entityMetadataCache.set(cacheKey, {
      entityMetadataMap: metadataMap,
      timestamp: Date.now(),
    });
  }

  private clearWorkspaceEntityMetadataCache(workspaceId: string): void {
    for (const key of this.entityMetadataCache.keys()) {
      if (key.startsWith(`${workspaceId}-`)) {
        this.entityMetadataCache.delete(key);
      }
    }
  }

  private buildMetadatasFromSchemas(
    entitySchemas: EntitySchema[],
  ): EntityMetadata[] {
    const transformer = new EntitySchemaTransformer();
    const metadataArgsStorage = transformer.transform(entitySchemas);

    const entityMetadataBuilder = new EntityMetadataBuilder(
      this,
      metadataArgsStorage,
    );

    const entityMetadatas = entityMetadataBuilder.build();

    return entityMetadatas;
  }

  hasWorkspaceEntityMetadataCacheForVersion(
    workspaceId: string,
    metadataVersion: number,
  ): boolean {
    const cacheKey = `${workspaceId}-${metadataVersion}`;

    return !!this.getCachedEntityMetadata(cacheKey);
  }

  private getCachedEntityMetadata(
    cacheKey: string,
  ): CachedEntityMetadata | undefined {
    const cached = this.entityMetadataCache.get(cacheKey);

    if (!cached) {
      return undefined;
    }

    if (Date.now() - cached.timestamp > ENTITY_METADATA_CACHE_TTL_MS) {
      this.entityMetadataCache.delete(cacheKey);

      return undefined;
    }

    return cached;
  }
}
