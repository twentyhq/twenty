import { ViewType, ViewKey } from 'twenty-shared/types';

import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import {
  createStandardViewFlatMetadata,
  type CreateStandardViewArgs,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/view/create-standard-view-flat-metadata.util';

const buildStandardExecutiveViews = <P extends string>(
  args: Omit<CreateStandardViewArgs<P>, 'context'>,
): Record<string, FlatView> => ({
  [args.viewName]: createStandardViewFlatMetadata({
    ...args,
    objectName: args.objectName,
    context: {
      viewName: args.viewName,
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
) => buildStandardExecutiveViews({ ...args, viewName: 'allExecutiveArtifacts' });

export const computeStandardExecutiveAwardViews = (
  args: Omit<CreateStandardViewArgs<'executiveAward'>, 'context'>,
) => buildStandardExecutiveViews({ ...args, viewName: 'allExecutiveAwards' });

export const computeStandardExecutiveBoardServiceViews = (
  args: Omit<CreateStandardViewArgs<'executiveBoardService'>, 'context'>,
) => buildStandardExecutiveViews({ ...args, viewName: 'allExecutiveBoardServices' });

export const computeStandardExecutiveCapabilityViews = (
  args: Omit<CreateStandardViewArgs<'executiveCapability'>, 'context'>,
) => buildStandardExecutiveViews({ ...args, viewName: 'allExecutiveCapabilities' });

export const computeStandardExecutiveCareerExperienceViews = (
  args: Omit<CreateStandardViewArgs<'executiveCareerExperience'>, 'context'>,
) => buildStandardExecutiveViews({ ...args, viewName: 'allExecutiveCareerExperiences' });

export const computeStandardExecutiveEducationViews = (
  args: Omit<CreateStandardViewArgs<'executiveEducation'>, 'context'>,
) => buildStandardExecutiveViews({ ...args, viewName: 'allExecutiveEducations' });

export const computeStandardExecutiveExternalProfileViews = (
  args: Omit<CreateStandardViewArgs<'executiveExternalProfile'>, 'context'>,
) => buildStandardExecutiveViews({ ...args, viewName: 'allExecutiveExternalProfiles' });

export const computeStandardExecutiveLanguageViews = (
  args: Omit<CreateStandardViewArgs<'executiveLanguage'>, 'context'>,
) => buildStandardExecutiveViews({ ...args, viewName: 'allExecutiveLanguages' });

export const computeStandardExecutiveProfileViews = (
  args: Omit<CreateStandardViewArgs<'executiveProfile'>, 'context'>,
) => buildStandardExecutiveViews({ ...args, viewName: 'allExecutiveProfiles' });

export const computeStandardExecutiveSearchPreferenceViews = (
  args: Omit<CreateStandardViewArgs<'executiveSearchPreference'>, 'context'>,
) => buildStandardExecutiveViews({ ...args, viewName: 'allExecutiveSearchPreferences' });
