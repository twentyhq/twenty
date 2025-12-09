import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';

import { type CreateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/create-view.input';
import { type ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

import { createViewData } from './view-data-factory.util';

export const createTestViewWithGraphQL = async (
  overrides: Partial<ViewEntity> = {},
): Promise<ViewEntity> => {
  const viewData = createViewData(overrides);
  const input: CreateViewInput = {
    name: viewData.name,
    objectMetadataId: viewData.objectMetadataId as string,
    icon: viewData.icon,
    type: viewData.type,
    position: viewData.position,
    mainGroupByFieldMetadataId:
      viewData.mainGroupByFieldMetadataId ?? undefined,
    isCompact: viewData.isCompact,
    openRecordIn: viewData.openRecordIn,
    visibility: viewData.visibility,
  };

  const { data, errors } = await createOneCoreView({
    input,
    expectToFail: false,
  });

  if (errors) {
    throw new Error(`Failed to create test view: ${JSON.stringify(errors)}`);
  }

  if (!data) {
    throw new Error('No data returned from createTestViewWithGraphQL');
  }

  return data.createCoreView;
};
