import { type SettingsGatedObjectPermissionRule } from 'src/engine/metadata-modules/role/types/settings-gated-object-permission-rule.type';

export type ImplicitObjectPermissionRules = {
  settingsGatedObjectRuleByUniversalIdentifier: Partial<
    Record<string, SettingsGatedObjectPermissionRule>
  >;
  aiGatedObjectUniversalIdentifiers: readonly string[];
  systemObjectDefaultRecordPermission: boolean;
};
