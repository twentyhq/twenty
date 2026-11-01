// graphql-inspector diff rule used by ci-breaking-changes.yaml.
// Feature flag keys come and go as features ship, and API consumers never
// send or match on them, so dropping one is reported but does not fail CI.
const ENUMS_WITH_REMOVABLE_VALUES = ['FeatureFlagKey'];

const isRemovableEnumValue = (change) => {
  if (change.type !== 'ENUM_VALUE_REMOVED' || typeof change.path !== 'string') {
    return false;
  }

  const [enumName] = change.path.split('.');

  return ENUMS_WITH_REMOVABLE_VALUES.includes(enumName);
};

module.exports = ({ changes }) =>
  changes.map((change) =>
    change.criticality.level === 'BREAKING' && isRemovableEnumValue(change)
      ? {
          ...change,
          criticality: { ...change.criticality, level: 'DANGEROUS' },
        }
      : change,
  );
