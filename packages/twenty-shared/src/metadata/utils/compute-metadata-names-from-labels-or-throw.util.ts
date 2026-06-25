import { IDENTIFIER_MAX_CHAR_LENGTH } from '@/metadata/constants/identifier-max-char-length.constant';
import { computeMetadataNameFromLabel } from '@/metadata/utils/compute-metadata-name-from-label.util';

export const computeMetadataNamesFromLabelsOrThrow = ({
  labelSingular,
  labelPlural,
  applyCustomSuffix = true,
}: {
  labelSingular: string;
  labelPlural: string;
  applyCustomSuffix?: boolean;
}): { nameSingular: string; namePlural: string } => {
  const nameSingular = computeMetadataNameFromLabel({
    label: labelSingular,
    applyCustomSuffix,
  });

  let namePlural = computeMetadataNameFromLabel({
    label: labelPlural,
    applyCustomSuffix,
  });

  if (namePlural !== '' && namePlural === nameSingular) {
    namePlural = (namePlural + 's').slice(0, IDENTIFIER_MAX_CHAR_LENGTH);
  }

  return { nameSingular, namePlural };
};
