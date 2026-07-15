import { ViewType, ViewKey } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

const buildStandardExecutiveViews = <P extends string>(
  viewName: string,
  args: Omit<CreateStandardViewArgs<P>, 'context'>,
): Record<string, FlatView> => ({
  [viewName]: createStandardViewFlatMetadata({
    ...args,
    objectName: args.objectName,
    context: {
      viewName,
      name: 'All {objectLabelPlural}',
      type: ViewType.TABLE,
      key: ViewKey.INDEX,
      position: 0,
      icon: 'IconList',
    },
  }),
});

export const computeStandardExecutiveArtifactViews = (
  args: Omit<CreateStandardViewArgs<'executiveArtifact'>, 'context'>,
) => buildStandardExecutiveViews('allExecutiveArtifacts', args);

export const computeStandardExecutiveAwardViews = (
  args: Omit<CreateStandardViewArgs<'executiveAward'>, 'context'>,
) => buildStandardExecutiveViews('allExecutiveAwards', args);

export const computeStandardExecutiveBoardServiceViews = (
  args: Omit<CreateStandardViewArgs<'executiveBoardService'>, 'context'>,
) => buildStandardExecutiveViews('allExecutiveBoardServices', args);

export const computeStandardExecutiveCapabilityViews = (
  args: Omit<CreateStandardViewArgs<'executiveCapability'>, 'context'>,
) => buildStandardExecutiveViews('allExecutiveCapabilities', args);

export const computeStandardExecutiveCareerExperienceViews = (
  args: Omit<CreateStandardViewArgs<'executiveCareerExperience'>, 'context'>,
) => buildStandardExecutiveViews('allExecutiveCareerExperiences', args);

export const computeStandardExecutiveEducationViews = (
  args: Omit<CreateStandardViewArgs<'executiveEducation'>, 'context'>,
) => buildStandardExecutiveViews('allExecutiveEducations', args);

export const computeStandardExecutiveExternalProfileViews = (
  args: Omit<CreateStandardViewArgs<'executiveExternalProfile'>, 'context'>,
) => buildStandardExecutiveViews('allExecutiveExternalProfiles', args);

export const computeStandardExecutiveLanguageViews = (
  args: Omit<CreateStandardViewArgs<'executiveLanguage'>, 'context'>,
) => buildStandardExecutiveViews('allExecutiveLanguages', args);

export const computeStandardExecutiveProfileViews = (
  args: Omit<CreateStandardViewArgs<'executiveProfile'>, 'context'>,
) => buildStandardExecutiveViews('allExecutiveProfiles', args);

export const computeStandardExecutiveSearchPreferenceViews = (
  args: Omit<CreateStandardViewArgs<'executiveSearchPreference'>, 'context'>,
) => buildStandardExecutiveViews('allExecutiveSearchPreferences', args);
