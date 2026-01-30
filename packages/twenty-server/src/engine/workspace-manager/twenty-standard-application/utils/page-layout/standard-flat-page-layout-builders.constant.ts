import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import {
  STANDARD_COMPANY_PAGE_LAYOUT_CONFIG,
  STANDARD_DASHBOARD_PAGE_LAYOUT_CONFIG,
  STANDARD_NOTE_PAGE_LAYOUT_CONFIG,
  STANDARD_OPPORTUNITY_PAGE_LAYOUT_CONFIG,
  STANDARD_PERSON_PAGE_LAYOUT_CONFIG,
  STANDARD_TASK_PAGE_LAYOUT_CONFIG,
  STANDARD_WORKFLOW_PAGE_LAYOUT_CONFIG,
  STANDARD_WORKFLOW_RUN_PAGE_LAYOUT_CONFIG,
  STANDARD_WORKFLOW_VERSION_PAGE_LAYOUT_CONFIG,
  type StandardPageLayoutConfig,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config';
import {
  type CreateStandardPageLayoutArgs,
  createStandardPageLayoutFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout/create-standard-page-layout-flat-metadata.util';

export const STANDARD_PAGE_LAYOUT_CONFIGS = [
  STANDARD_DASHBOARD_PAGE_LAYOUT_CONFIG,
  STANDARD_COMPANY_PAGE_LAYOUT_CONFIG,
  STANDARD_PERSON_PAGE_LAYOUT_CONFIG,
  STANDARD_OPPORTUNITY_PAGE_LAYOUT_CONFIG,
  STANDARD_NOTE_PAGE_LAYOUT_CONFIG,
  STANDARD_TASK_PAGE_LAYOUT_CONFIG,
  STANDARD_WORKFLOW_PAGE_LAYOUT_CONFIG,
  STANDARD_WORKFLOW_VERSION_PAGE_LAYOUT_CONFIG,
  STANDARD_WORKFLOW_RUN_PAGE_LAYOUT_CONFIG,
] as const;

type BuilderArgs = Omit<CreateStandardPageLayoutArgs, 'context'>;

type BuilderFn = (args: BuilderArgs) => FlatPageLayout;

const createBuilderFromConfig = (
  config: StandardPageLayoutConfig,
): BuilderFn => {
  return (args: BuilderArgs) =>
    createStandardPageLayoutFlatMetadata({
      ...args,
      context: {
        layoutName: config.layoutName,
        name: config.name,
        type: config.type,
        objectUniversalIdentifier: config.objectUniversalIdentifier,
        defaultTabUniversalIdentifier: config.defaultTabUniversalIdentifier,
      },
    });
};

const createBuilders = (): Record<string, BuilderFn> => {
  return Object.fromEntries(
    STANDARD_PAGE_LAYOUT_CONFIGS.map((config) => [
      config.layoutName,
      createBuilderFromConfig(config),
    ]),
  );
};

export const STANDARD_FLAT_PAGE_LAYOUT_BUILDERS_BY_LAYOUT_NAME =
  createBuilders();
