import { existsSync } from 'fs';
import { dirname, isAbsolute, join } from 'path';

import {
  DataSource,
  type DataSourceOptions,
  type EntityMetadata,
} from 'typeorm';

import {
  STRUCTURAL_EXEMPTIONS,
  WORKSPACE_SCOPED_EXEMPTIONS,
} from 'twenty-oxlint-rules/rules/prefer-workspace-scoped-repository.exemptions';

type DataSourceWithMetadataBuilder = DataSource & {
  buildMetadatas: () => Promise<void>;
};

const findPackageRoot = (): string => {
  let directory = __dirname;

  while (!existsSync(join(directory, 'package.json'))) {
    directory = dirname(directory);
  }

  return directory;
};

const toAbsolute = (entityGlob: string): string =>
  isAbsolute(entityGlob) ? entityGlob : join(findPackageRoot(), entityGlob);

const buildCoreEntityMetadatas = async (): Promise<
  Map<string, EntityMetadata>
> => {
  const billingEnabled = process.env.IS_BILLING_ENABLED;

  process.env.IS_BILLING_ENABLED = 'true';

  try {
    // Read at module load from IS_BILLING_ENABLED, so it has to load after it.
    const { typeORMCoreModuleOptions } =
      await import('src/database/typeorm/core/core.datasource');

    const dataSource = new DataSource({
      ...typeORMCoreModuleOptions,
      entities: (typeORMCoreModuleOptions.entities as string[]).map(toAbsolute),
    } as DataSourceOptions) as DataSourceWithMetadataBuilder;

    await dataSource.buildMetadatas();

    return new Map(
      dataSource.entityMetadatas.map((entityMetadata) => [
        entityMetadata.targetName,
        entityMetadata,
      ]),
    );
  } finally {
    process.env.IS_BILLING_ENABLED = billingEnabled;
  }
};

describe('prefer-workspace-scoped-repository exemptions', () => {
  let entityMetadataByClassName: Map<string, EntityMetadata>;

  beforeAll(async () => {
    entityMetadataByClassName = await buildCoreEntityMetadatas();
  });

  // The wrapper builds its predicate from the workspaceId property, so an
  // entity exposing the column under another property name is unreachable
  // through it and counts as having none.
  const findWorkspaceIdColumn = (entityClassName: string) =>
    entityMetadataByClassName
      .get(entityClassName)
      ?.columns.find((column) => column.propertyName === 'workspaceId');

  it.each([...STRUCTURAL_EXEMPTIONS, ...WORKSPACE_SCOPED_EXEMPTIONS])(
    '%s is a known entity',
    (exemptedEntityName) => {
      expect([...entityMetadataByClassName.keys()]).toContain(
        exemptedEntityName,
      );
    },
  );

  it.each(STRUCTURAL_EXEMPTIONS)(
    '%s has no workspaceId, or a nullable one',
    (exemptedEntityName) => {
      const workspaceIdColumn = findWorkspaceIdColumn(exemptedEntityName);

      expect(workspaceIdColumn?.isNullable ?? true).toBe(true);
    },
  );

  it.each(WORKSPACE_SCOPED_EXEMPTIONS)(
    '%s has a NOT NULL workspaceId',
    (exemptedEntityName) => {
      const workspaceIdColumn = findWorkspaceIdColumn(exemptedEntityName);

      expect(workspaceIdColumn).toBeDefined();
      expect(workspaceIdColumn?.isNullable).toBe(false);
    },
  );
});
