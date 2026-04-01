export type CrmFeatureId = number | `B${number}`;

export type CrmFeatureStatus =
  | 'implemented'
  | 'pending-structure'
  | 'pending';

export type CrmFeatureModule =
  | 'M1'
  | 'M2'
  | 'M3'
  | 'M4'
  | 'M5'
  | 'M6'
  | 'M7'
  | 'M8'
  | 'M9'
  | 'M10'
  | 'M11'
  | 'BONUS';

export interface CrmFeatureDefinition {
  id: CrmFeatureId;
  name: string;
  module: CrmFeatureModule;
  status: CrmFeatureStatus;
  isImperative: boolean;
  notes?: string;
}

export interface PendingModuleStructure {
  module: CrmFeatureModule;
  title: string;
  pendingFeatureIds: CrmFeatureId[];
  completionPhase: 'phase-2' | 'phase-3' | 'phase-4';
}
