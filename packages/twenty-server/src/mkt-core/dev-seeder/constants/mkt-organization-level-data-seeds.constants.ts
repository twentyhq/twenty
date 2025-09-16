import {
  DefaultPermissions,
  AccessLimitations,
} from 'src/mkt-core/mkt-organization-level/types';
import { PERMISSION_TEMPLATES } from 'src/mkt-core/mkt-organization-level/constants/permission-templates.constants';

type MktOrganizationLevelDataSeed = {
  id: string;
  levelCode: string;
  levelName: string;
  levelNameEn?: string;
  description?: string;
  hierarchyLevel: number;
  parentLevelId?: string | null;
  defaultPermissions?: DefaultPermissions;
  accessLimitations?: AccessLimitations;
  displayOrder: number;
  isActive?: boolean;
  position: number;
  createdBySource: string;
  createdByWorkspaceMemberId: string | null;
  createdByName: string;
};

export const MKT_ORGANIZATION_LEVEL_DATA_SEED_COLUMNS: (keyof MktOrganizationLevelDataSeed)[] =
  [
    'id',
    'levelCode',
    'levelName',
    'levelNameEn',
    'description',
    'hierarchyLevel',
    'parentLevelId',
    'defaultPermissions',
    'accessLimitations',
    'displayOrder',
    'isActive',
    'position',
    'createdBySource',
    'createdByWorkspaceMemberId',
    'createdByName',
  ];

export const MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS = {
  DIRECTOR: '1a2b3c4d-5e6f-7a8b-9c0d-e1f2a3b4c5d6',
  MANAGER: '2b3c4d5e-6f7a-8b9c-0d1e-f2a3b4c5d6e7',
  TEAM_LEAD: '3c4d5e6f-7a8b-9c0d-1e2f-a3b4c5d6e7f8',
  SENIOR_STAFF: '4d5e6f7a-8b9c-0d1e-2f3a-b4c5d6e7f8a9',
  JUNIOR_STAFF: '5e6f7a8b-9c0d-1e2f-3a4b-c5d6e7f8a9b0',
};

export const MKT_ORGANIZATION_LEVEL_DATA_SEEDS: MktOrganizationLevelDataSeed[] =
  [
    // Level 1: Director (Highest level)
    {
      id: MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS.DIRECTOR,
      levelCode: 'DIRECTOR',
      levelName: 'Giám đốc',
      levelNameEn: 'Director',
      description:
        'Cấp quản lý cao nhất, có thẩm quyền quyết định chiến lược và điều hành toàn bộ tổ chức',
      hierarchyLevel: 1,
      parentLevelId: null, // Top level
      defaultPermissions: PERMISSION_TEMPLATES.DIRECTOR.defaultPermissions,
      accessLimitations: PERMISSION_TEMPLATES.DIRECTOR.accessLimitations,
      displayOrder: 1,
      isActive: true,
      position: 1,
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: null,
      createdByName: 'Admin User',
    },

    // Level 2: Manager
    {
      id: MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS.MANAGER,
      levelCode: 'MANAGER',
      levelName: 'Quản lý',
      levelNameEn: 'Manager',
      description:
        'Cấp quản lý trung gian, phụ trách một hoặc nhiều team và báo cáo lên Director',
      hierarchyLevel: 2,
      parentLevelId: MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS.DIRECTOR,
      defaultPermissions: PERMISSION_TEMPLATES.MANAGER.defaultPermissions,
      accessLimitations: PERMISSION_TEMPLATES.MANAGER.accessLimitations,
      displayOrder: 2,
      isActive: true,
      position: 2,
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: null,
      createdByName: 'Admin User',
    },

    // Level 3: Team Lead
    {
      id: MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS.TEAM_LEAD,
      levelCode: 'TEAM_LEAD',
      levelName: 'Trưởng nhóm',
      levelNameEn: 'Team Lead',
      description:
        'Người dẫn dắt một team nhỏ, có thẩm quyền quản lý công việc và hỗ trợ team members',
      hierarchyLevel: 3,
      parentLevelId: MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS.MANAGER,
      defaultPermissions: PERMISSION_TEMPLATES.TEAM_LEAD.defaultPermissions,
      accessLimitations: PERMISSION_TEMPLATES.TEAM_LEAD.accessLimitations,
      displayOrder: 3,
      isActive: true,
      position: 3,
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: null,
      createdByName: 'Admin User',
    },

    // Level 4: Senior Staff
    {
      id: MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS.SENIOR_STAFF,
      levelCode: 'SENIOR_STAFF',
      levelName: 'Nhân viên cao cấp',
      levelNameEn: 'Senior Staff',
      description:
        'Nhân viên có kinh nghiệm, có thể mentor junior staff và handle các task phức tạp',
      hierarchyLevel: 4,
      parentLevelId: MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS.TEAM_LEAD,
      defaultPermissions: PERMISSION_TEMPLATES.SENIOR_STAFF.defaultPermissions,
      accessLimitations: PERMISSION_TEMPLATES.SENIOR_STAFF.accessLimitations,
      displayOrder: 4,
      isActive: true,
      position: 4,
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: null,
      createdByName: 'Admin User',
    },

    // Level 5: Junior Staff (Lowest level)
    {
      id: MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS.JUNIOR_STAFF,
      levelCode: 'JUNIOR_STAFF',
      levelName: 'Nhân viên',
      levelNameEn: 'Junior Staff',
      description:
        'Nhân viên mới, thực hiện các công việc cơ bản và học hỏi từ senior staff',
      hierarchyLevel: 5,
      parentLevelId: MKT_ORGANIZATION_LEVEL_DATA_SEEDS_IDS.SENIOR_STAFF,
      defaultPermissions: PERMISSION_TEMPLATES.JUNIOR_STAFF.defaultPermissions,
      accessLimitations: PERMISSION_TEMPLATES.JUNIOR_STAFF.accessLimitations,
      displayOrder: 5,
      isActive: true,
      position: 5,
      createdBySource: 'MANUAL',
      createdByWorkspaceMemberId: null,
      createdByName: 'Admin User',
    },
  ];
