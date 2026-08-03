import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

export const getFieldsWidgetViewUniversalIdentifier = ({
  applicationUniversalIdentifier,
  pageLayoutWidgetUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  pageLayoutWidgetUniversalIdentifier: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'view',
    value: pageLayoutWidgetUniversalIdentifier,
    applicationUniversalIdentifier,
  });
