import { existsSync } from 'fs';
import { dirname, isAbsolute, join } from 'path';

import { DataSource, type DataSourceOptions } from 'typeorm';

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

const buildCoreEntityClassNames = async (): Promise<Set<string>> => {
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

    return new Set(
      dataSource.entityMetadatas.map(
        (entityMetadata) => entityMetadata.targetName,
      ),
    );
  } finally {
    process.env.IS_BILLING_ENABLED = billingEnabled;
  }
};

describe('prefer-workspace-scoped-repository exemptions', () => {
  let entityClassNames: Set<string>;

  beforeAll(async () => {
    entityClassNames = await buildCoreEntityClassNames();
  });

  it('loads the core entity metadata', () => {
    expect(entityClassNames.size).toBeGreaterThan(50);
  });

  it.each([...STRUCTURAL_EXEMPTIONS, ...WORKSPACE_SCOPED_EXEMPTIONS])(
    '%s is a known entity',
    (exemptedEntityName) => {
      expect([...entityClassNames]).toContain(exemptedEntityName);
    },
  );
});
