import { type ObjectMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/object-metadata-seed.type';

export const SHAHRYAR_MARKET_CUSTOM_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'مارکێت و وەکیلەکان',
  labelSingular: 'مارکێت و وەکیل',
  namePlural: 'shahryarMarkets',
  nameSingular: 'shahryarMarket',
  icon: 'IconMapPin',
  description: 'Markets and agents managed by Shahryar supervisors',
  isRemote: false,
};

export const SHAHRYAR_SUPERVISOR_VISIT_CUSTOM_OBJECT_SEED: ObjectMetadataSeed =
  {
    labelPlural: 'سەردانەکانی موشریف',
    labelSingular: 'سەردانی موشریف',
    namePlural: 'shahryarSupervisorVisits',
    nameSingular: 'shahryarSupervisorVisit',
    icon: 'IconUserPin',
    description: 'Supervisor visits with GPS, photos, sales, and notes',
    isRemote: false,
  };

export const SHAHRYAR_WORKING_TIME_CUSTOM_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'کاتەکانی کارکردن',
  labelSingular: 'کاتی کارکردن',
  namePlural: 'shahryarWorkingTimes',
  nameSingular: 'shahryarWorkingTime',
  icon: 'IconClockHour4',
  description: 'Supervisor attendance and working-time tracking',
  isRemote: false,
};

export const SHAHRYAR_PAYMENT_CUSTOM_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'پارەدانەکان',
  labelSingular: 'پارەدان',
  namePlural: 'shahryarPayments',
  nameSingular: 'shahryarPayment',
  icon: 'IconCurrencyDollar',
  description: 'Payments and debts for Shahryar markets and agents',
  isRemote: false,
};

export const SHAHRYAR_SUPERVISOR_PENALTY_CUSTOM_OBJECT_SEED: ObjectMetadataSeed =
  {
    labelPlural: 'غرامەی موشریفەکان',
    labelSingular: 'غرامەی موشریف',
    namePlural: 'shahryarSupervisorPenalties',
    nameSingular: 'shahryarSupervisorPenalty',
    icon: 'IconShield',
    description: 'Supervisor penalties decided by admins',
    isRemote: false,
  };

export const SHAHRYAR_ABSENCE_CUSTOM_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'غیابات',
  labelSingular: 'غیاب',
  namePlural: 'shahryarAbsences',
  nameSingular: 'shahryarAbsence',
  icon: 'IconCalendarX',
  description: 'Supervisor absences and late attendance notes',
  isRemote: false,
};

export const SHAHRYAR_MOBILE_DEVICE_CUSTOM_OBJECT_SEED: ObjectMetadataSeed = {
  labelPlural: 'ئامێرەکانی مۆبایل',
  labelSingular: 'ئامێری مۆبایل',
  namePlural: 'shahryarMobileDevices',
  nameSingular: 'shahryarMobileDevice',
  icon: 'IconDeviceMobile',
  description: 'Mobile devices registered for Shahryar operational alerts',
  isRemote: false,
};

export const SHAHRYAR_CUSTOM_OBJECT_SEEDS: ObjectMetadataSeed[] = [
  SHAHRYAR_MARKET_CUSTOM_OBJECT_SEED,
  SHAHRYAR_SUPERVISOR_VISIT_CUSTOM_OBJECT_SEED,
  SHAHRYAR_WORKING_TIME_CUSTOM_OBJECT_SEED,
  SHAHRYAR_PAYMENT_CUSTOM_OBJECT_SEED,
  SHAHRYAR_SUPERVISOR_PENALTY_CUSTOM_OBJECT_SEED,
  SHAHRYAR_ABSENCE_CUSTOM_OBJECT_SEED,
  SHAHRYAR_MOBILE_DEVICE_CUSTOM_OBJECT_SEED,
];
