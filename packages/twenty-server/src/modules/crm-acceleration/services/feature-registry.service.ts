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
    id: 1,
    name: 'Predictive Lead Scoring',
    module: 'M1',
    status: 'implemented',
    isImperative: true,
    notes: 'Rules-based v1 exposed through crm-acceleration routes',
  },
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
    id: 51,
    name: 'Sales Playbook - Templates',
    module: 'M5',
    status: 'implemented',
    isImperative: true,
    notes: 'Create, apply and manage sales playbooks',
  },
  {
    id: 55,
    name: 'Sales Playbook - Integrated',
    module: 'M5',
    status: 'implemented',
    isImperative: true,
    notes: 'Playbook templates and deal application',
  },
  {
    id: 56,
    name: 'Gamification',
    module: 'M5',
    status: 'implemented',
    isImperative: true,
    notes: 'Leaderboard and achievement evaluation endpoints exposed',
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
  {
    id: 57,
    name: 'Deal Cloning',
    module: 'M5',
    status: 'implemented',
    isImperative: true,
  },
  {
    id: 53,
    name: 'Account Hierarchy Management',
    module: 'M5',
    status: 'implemented',
    isImperative: true,
  },
  {
    id: 54,
    name: 'Competitor Tracking',
    module: 'M5',
    status: 'implemented',
    isImperative: true,
  },
  {
    id: 58,
    name: 'Earned Revenue Tracking',
    module: 'M5',
    status: 'implemented',
    isImperative: true,
  },
  {
    id: 52,
    name: 'Blueprint Process Management',
    module: 'M5',
    status: 'implemented',
    isImperative: true,
  },
  {
    id: 60,
    name: 'CS Playbooks',
    module: 'M6',
    status: 'implemented',
    isImperative: true,
  },
  {
    id: 64,
    name: 'QBR Management',
    module: 'M6',
    status: 'implemented',
    isImperative: true,
  },
  {
    id: 91,
    name: 'Audit Logs Inmutables',
    module: 'M10',
    status: 'implemented',
    isImperative: true,
  },
  {
    id: 63,
    name: 'Expansion Revenue Tracking',
    module: 'M6',
    status: 'implemented',
    isImperative: true,
  },
  // #65 - Upsell/Cross-sell Recommendations
  {
    id: 65,
    name: 'Upsell/Cross-sell Recommendations',
    module: 'M6',
    status: 'implemented',
    isImperative: true,
    notes: 'AI-powered recommendations based on customer behavior and usage patterns',
  },
  // #66 - Customer Advocacy Program
  {
    id: 66,
    name: 'Customer Advocacy Program',
    module: 'M6',
    status: 'implemented',
    isImperative: true,
    notes: 'Referral program with points, tiers and rewards',
  },
  // #70 - Discount Approval Workflows
  {
    id: 70,
    name: 'Discount Approval Workflows',
    module: 'M7',
    status: 'implemented',
    isImperative: true,
    notes: 'Multi-level approval based on discount threshold',
  },
  // #74 - Commission Calculator
  {
    id: 74,
    name: 'Commission Calculator',
    module: 'M7',
    status: 'implemented',
    isImperative: true,
    notes: 'Tiered commission with accelerators based on quota attainment',
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
