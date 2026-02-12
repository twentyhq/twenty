import { type FlatViewFieldGroup } from 'src/engine/metadata-modules/flat-view-field-group/types/flat-view-field-group.type';
import {
  createStandardViewFieldGroupFlatMetadata,
  type CreateStandardViewFieldGroupArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view-field-group/create-standard-view-field-group-flat-metadata.util';

export const computeStandardCompanyViewFieldGroups = (
  args: Omit<CreateStandardViewFieldGroupArgs<'company'>, 'context'>,
): Record<string, FlatViewFieldGroup> => {
  return {
    companyRecordPageFieldsGeneral: createStandardViewFieldGroupFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'companyRecordPageFields',
        viewFieldGroupName: 'general',
        name: 'General',
        position: 0,
        isVisible: true,
      },
    }),
    companyRecordPageFieldsAdditional: createStandardViewFieldGroupFlatMetadata(
      {
        ...args,
        objectName: 'company',
        context: {
          viewName: 'companyRecordPageFields',
          viewFieldGroupName: 'additional',
          name: 'Additional',
          position: 1,
          isVisible: true,
        },
      },
    ),
    companyRecordPageFieldsOther: createStandardViewFieldGroupFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'companyRecordPageFields',
        viewFieldGroupName: 'other',
        name: 'Other',
        position: 2,
        isVisible: true,
      },
    }),
  };
};
