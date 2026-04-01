import { Injectable } from '@nestjs/common';

import {
  CRM_PENDING_MODULES,
  getPendingFeatureSet,
} from 'src/modules/crm-acceleration/pending/crm-pending-modules.structure';
import {
  type CrmFeatureDefinition,
  type CrmFeatureId,
} from 'src/modules/crm-acceleration/types/crm-acceleration.types';

const IMPLEMENTED_FEATURES: CrmFeatureDefinition[] = [
  {
    id: 11,
    name: 'Data Quality Command Center',
    module: 'M1',
    status: 'implemented',
    isImperative: true,
    notes: 'v1 con reglas, deduplicacion y bulk fix sugerido',
  },
  {
    id: 23,
    name: 'Email Sequences (Cadences)',
    module: 'M2',
    status: 'implemented',
    isImperative: true,
  },
  {
    id: 25,
    name: 'Meeting Scheduler (Calendly-style)',
    module: 'M2',
    status: 'implemented',
    isImperative: true,
  },
  {
    id: 33,
    name: 'Pipeline Velocity Metrics',
    module: 'M3',
    status: 'implemented',
    isImperative: true,
  },
  {
    id: 40,
    name: 'Executive Real-Time Scorecard',
    module: 'M3',
    status: 'implemented',
    isImperative: true,
  },
  {
    id: 49,
    name: 'Multi-Pipeline Support',
    module: 'M5',
    status: 'implemented',
    isImperative: true,
  },
  {
    id: 50,
    name: 'Deal Rotation Warning',
    module: 'M5',
    status: 'implemented',
    isImperative: true,
  },
  {
    id: 59,
    name: 'Customer Health Score',
    module: 'M6',
    status: 'implemented',
    isImperative: true,
  },
  {
    id: 61,
    name: 'NPS / CSAT Automation',
    module: 'M6',
    status: 'implemented',
    isImperative: true,
  },
  {
    id: 62,
    name: 'Renewal Management',
    module: 'M6',
    status: 'implemented',
    isImperative: true,
  },
  {
    id: 85,
    name: 'MCP Server / AI Extension Points',
    module: 'M9',
    status: 'implemented',
    isImperative: true,
  },
  {
    id: 94,
    name: 'RBAC Granular a Nivel de Campo',
    module: 'M10',
    status: 'implemented',
    isImperative: true,
  },
];

const ALL_MODULE_IDS: Array<CrmFeatureId> = [
  ...Array.from({ length: 100 }, (_, index) => index + 1),
  'B1',
  'B2',
  'B3',
  'B4',
  'B5',
  'B6',
  'B7',
  'B8',
];

const resolveModuleFromFeature = (featureId: CrmFeatureId) => {
  if (typeof featureId === 'string') {
    return 'BONUS' as const;
  }

  if (featureId <= 16) return 'M1' as const;
  if (featureId <= 28) return 'M2' as const;
  if (featureId <= 40) return 'M3' as const;
  if (featureId <= 48) return 'M4' as const;
  if (featureId <= 58) return 'M5' as const;
  if (featureId <= 66) return 'M6' as const;
  if (featureId <= 74) return 'M7' as const;
  if (featureId <= 80) return 'M8' as const;
  if (featureId <= 88) return 'M9' as const;
  if (featureId <= 96) return 'M10' as const;
  return 'M11' as const;
};

@Injectable()
export class FeatureRegistryService {
  getImplementedFeatures(): CrmFeatureDefinition[] {
    return IMPLEMENTED_FEATURES;
  }

  getPendingStructure() {
    return CRM_PENDING_MODULES;
  }

  getAllFeatures(): CrmFeatureDefinition[] {
    const implementedById = new Map(
      IMPLEMENTED_FEATURES.map((feature) => [feature.id, feature]),
    );

    const pendingFeatureSet = getPendingFeatureSet();

    return ALL_MODULE_IDS.map((id) => {
      const implemented = implementedById.get(id);

      if (implemented) {
        return implemented;
      }

      const status = pendingFeatureSet.has(id) ? 'pending-structure' : 'pending';

      return {
        id,
        name:
          typeof id === 'number'
            ? `Feature ${id} pendiente`
            : `Feature ${id} pendiente`,
        module: resolveModuleFromFeature(id),
        status,
        isImperative: false,
      };
    });
  }
}
