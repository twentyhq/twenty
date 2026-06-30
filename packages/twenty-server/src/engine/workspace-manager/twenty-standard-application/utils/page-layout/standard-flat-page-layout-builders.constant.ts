import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';
import { type StandardPageLayoutConfig } from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config';
import { STANDARD_PAGE_LAYOUTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';
import {
  type CreateStandardPageLayoutArgs,
  createStandardPageLayoutFlatMetadata,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout/create-standard-page-layout-flat-metadata.util';

type BuilderArgs = Omit<CreateStandardPageLayoutArgs, 'context'>;

type BuilderFn = (args: BuilderArgs) => FlatPageLayout;

const createBuilderFromConfig = (
  layoutName: string,
  config: StandardPageLayoutConfig,
): BuilderFn => {
  return (args: BuilderArgs) =>
    createStandardPageLayoutFlatMetadata({
      ...args,
      context: {
        layoutName,
        name: config.name,
        type: config.type,
        objectUniversalIdentifier: config.objectUniversalIdentifier,
        defaultTabUniversalIdentifier: config.defaultTabUniversalIdentifier,
      },
    });
};

const createBuilders = (): Record<string, BuilderFn> => {
  return Object.fromEntries(
    Object.entries(STANDARD_PAGE_LAYOUTS).map(([layoutName, config]) => [
      layoutName,
      createBuilderFromConfig(layoutName, config),
    ]),
  );
};

export const STANDARD_FLAT_PAGE_LAYOUT_BUILDERS_BY_LAYOUT_NAME =
  createBuilders();
