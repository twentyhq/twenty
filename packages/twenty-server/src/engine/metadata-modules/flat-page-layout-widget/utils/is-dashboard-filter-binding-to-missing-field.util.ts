import { isNull } from '@sniptt/guards';
import { type DashboardFilterBinding } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const isDashboardFilterBindingToMissingField = ({
  dashboardFilterBinding: { fieldMetadataId },
  fieldMetadataUniversalIdentifierById,
}: {
  dashboardFilterBinding: Pick<DashboardFilterBinding, 'fieldMetadataId'>;
  fieldMetadataUniversalIdentifierById: Partial<Record<string, string>>;
}): boolean =>
  !isNull(fieldMetadataId) &&
  !isDefined(fieldMetadataUniversalIdentifierById[fieldMetadataId]);
