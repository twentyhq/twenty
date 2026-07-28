import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';

// A fields-widget view is 1:1 with its FIELDS page-layout widget, so it is keyed
// by that widget's deterministic universalIdentifier (its name is server-generated).
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
