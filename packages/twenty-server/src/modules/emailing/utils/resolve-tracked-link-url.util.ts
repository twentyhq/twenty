import { applyReplacementTags } from 'src/engine/core-modules/emailing-domain/utils/apply-replacement-tags.util';
import { TRACKABLE_URL_PATTERN } from 'src/modules/emailing/constants/trackable-url-pattern.constant';

export const resolveTrackedLinkUrl = ({
  urlTemplate,
  replacements,
}: {
  urlTemplate: string;
  replacements: Record<string, string>;
}): { url: string; isTrackable: boolean } => {
  const url = applyReplacementTags(urlTemplate, replacements);

  return {
    url,
    isTrackable: TRACKABLE_URL_PATTERN.test(url) && URL.canParse(url),
  };
};
