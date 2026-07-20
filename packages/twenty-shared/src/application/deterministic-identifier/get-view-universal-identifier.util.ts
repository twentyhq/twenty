import { computeDeterministicUuid } from '@/application/deterministic-identifier/compute-deterministic-uuid.util';
import { type ViewKey } from '@/types/ViewKey';

// A view is identified by its name within its object.
export const getViewUniversalIdentifier = ({
  applicationUniversalIdentifier,
  objectUniversalIdentifier,
  name,
}: {
  applicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
  name: string;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'view',
    value: `${objectUniversalIdentifier}:${name}`,
    applicationUniversalIdentifier,
  });

// A system view is an object's singleton engine-owned view (e.g. the INDEX
// main table view); its name is server-generated, so it is keyed by its stable
// view key rather than its name.
export const getSystemViewUniversalIdentifier = ({
  applicationUniversalIdentifier,
  objectUniversalIdentifier,
  viewKey,
}: {
  applicationUniversalIdentifier: string;
  objectUniversalIdentifier: string;
  viewKey: ViewKey;
}): string =>
  computeDeterministicUuid({
    entityNamespace: 'view',
    value: `${objectUniversalIdentifier}:${viewKey}`,
    applicationUniversalIdentifier,
  });

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
