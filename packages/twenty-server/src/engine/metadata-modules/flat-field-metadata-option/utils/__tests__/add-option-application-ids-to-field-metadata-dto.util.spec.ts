import { FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { addOptionApplicationIdsToFieldMetadataDto } from 'src/engine/metadata-modules/flat-field-metadata-option/utils/add-option-application-ids-to-field-metadata-dto.util';

const FIELD_APPLICATION_ID = '20202020-0000-4000-8000-0000000000aa';
const WORKSPACE_CUSTOM_APPLICATION_ID = '20202020-0000-4000-8000-0000000000bb';

const openOption = { id: 'open', value: 'OPEN', label: 'Open', position: 0 };
const archivedOption = {
  id: 'archived',
  value: 'ARCHIVED',
  label: 'Archived',
  position: 1,
};
const unknownOption = { id: 'legacy', value: 'OLD', label: 'Old', position: 2 };

describe('addOptionApplicationIdsToFieldMetadataDto', () => {
  it('sets the owner only on options another application than the field owns', () => {
    const fieldMetadataDto = {
      type: FieldMetadataType.RATING,
      applicationId: FIELD_APPLICATION_ID,
      options: [openOption, archivedOption, unknownOption],
    } as FieldMetadataDTO;

    expect(
      addOptionApplicationIdsToFieldMetadataDto({
        fieldMetadataDto,
        flatFieldMetadataOptionMaps: {
          byUniversalIdentifier: {
            open: { applicationId: FIELD_APPLICATION_ID },
            archived: { applicationId: WORKSPACE_CUSTOM_APPLICATION_ID },
          },
        } as never,
      }).options,
    ).toEqual([
      openOption,
      { ...archivedOption, applicationId: WORKSPACE_CUSTOM_APPLICATION_ID },
      unknownOption,
    ]);
  });
});
