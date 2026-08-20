import { msg } from '@lingui/core/macro';
import { i18nLabel } from 'src/engine/workspace-manager/twenty-standard-application/utils/i18n-label.util';
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
        name: i18nLabel(
          msg({ message: `General`, context: 'viewFieldGroup.name' }),
        ),
        position: 0,
        isVisible: true,
      },
    }),
    companyRecordPageFieldsBusiness: createStandardViewFieldGroupFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'companyRecordPageFields',
        viewFieldGroupName: 'business',
        name: i18nLabel(
          msg({ message: `Business`, context: 'viewFieldGroup.name' }),
        ),
        position: 1,
        isVisible: true,
      },
    }),
    companyRecordPageFieldsContact: createStandardViewFieldGroupFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'companyRecordPageFields',
        viewFieldGroupName: 'contact',
        name: i18nLabel(
          msg({ message: `Contact`, context: 'viewFieldGroup.name' }),
        ),
        position: 2,
        isVisible: true,
      },
    }),
    companyRecordPageFieldsSystem: createStandardViewFieldGroupFlatMetadata({
      ...args,
      objectName: 'company',
      context: {
        viewName: 'companyRecordPageFields',
        viewFieldGroupName: 'system',
        name: i18nLabel(
          msg({ message: `System`, context: 'viewFieldGroup.name' }),
        ),
        position: 3,
        isVisible: true,
      },
    }),
  };
};
