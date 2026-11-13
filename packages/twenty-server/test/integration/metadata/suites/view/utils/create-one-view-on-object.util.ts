import { createOneView } from 'test/integration/metadata/suites/view/utils/create-one-view.util';
import { findObjectMetadataIdByName } from 'test/integration/utils/find-object-metadata-id-by-name.util';
import { ViewType } from 'twenty-shared/types';

import { type CreateViewInput } from 'src/engine/metadata-modules/view/dtos/inputs/create-view.input';

export const createOneViewOnObject = async ({
  objectNameSingular,
  input,
  token,
}: {
  objectNameSingular: string;
  input: Omit<CreateViewInput, 'objectMetadataId' | 'icon'>;
  token?: string;
}): Promise<string> => {
  const { data } = await createOneView({
    expectToFail: false,
    gqlFields: 'id',
    token,
    input: {
      icon: 'IconTable',
      type: ViewType.TABLE,
      ...input,
      objectMetadataId: await findObjectMetadataIdByName(objectNameSingular),
    },
  });

  return data.createView.id;
};
