import { computeOwnerScopedUniversalIdentifier } from '@/application/deterministic-identifier/compute-owner-scoped-universal-identifier.util';
import { ENTITY_TYPE_NAMESPACE_BY_TYPE } from '@/application/deterministic-identifier/entity-type-namespace.constant';

// A fields-widget view is 1:1 with its FIELDS page-layout widget, so it is keyed
// by that widget's deterministic universalIdentifier (its name is server-generated).
export const getFieldsWidgetViewUniversalIdentifier = ({
  ownerApplicationUniversalIdentifier,
  pageLayoutWidgetUniversalIdentifier,
}: {
  ownerApplicationUniversalIdentifier: string;
  pageLayoutWidgetUniversalIdentifier: string;
}): string =>
  computeOwnerScopedUniversalIdentifier({
    ownerApplicationUniversalIdentifier,
    namespace: ENTITY_TYPE_NAMESPACE_BY_TYPE.view,
    value: pageLayoutWidgetUniversalIdentifier,
  });
