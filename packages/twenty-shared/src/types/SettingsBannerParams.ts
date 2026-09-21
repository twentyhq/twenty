export type SettingsBannerVariant = 'info' | 'warning' | 'error';

export type SettingsBannerAction = {
  label: string;
};

export type SettingsBannerParams = {
  variant?: SettingsBannerVariant;
  text: string;
  action?: SettingsBannerAction;
};
