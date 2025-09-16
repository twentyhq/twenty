/**
 * Organization Level Hierarchy Constraints
 * Định nghĩa các giới hạn cho cấp độ phân cấp tổ chức
 */

// Số cấp hierarchy tối đa cho Organization Level
export const MAX_ORGANIZATION_HIERARCHY_DEPTH = 8;

// Giới hạn số cấp cho các loại tổ chức khác nhau
export const ORGANIZATION_HIERARCHY_LIMITS = {
  // Công ty nhỏ (< 50 người)
  SMALL_COMPANY: 5,

  // Công ty trung bình (50-500 người)
  MEDIUM_COMPANY: 6,

  // Công ty lớn (500-5000 người)
  LARGE_COMPANY: 7,

  // Tập đoàn (> 5000 người)
  ENTERPRISE: 8,
} as const;

// Cấp độ tổ chức chuẩn (1 = cao nhất)
export const STANDARD_HIERARCHY_LEVELS = {
  BOARD_LEVEL: 1, // Hội đồng quản trị / CEO
  EXECUTIVE_LEVEL: 2, // C-level (CTO, CFO, CMO, etc.)
  DIRECTOR_LEVEL: 3, // Giám đốc khối/ban
  MANAGER_LEVEL: 4, // Trưởng phòng
  SUPERVISOR_LEVEL: 5, // Trưởng nhóm/Giám sát
  SENIOR_STAFF_LEVEL: 6, // Nhân viên cao cấp
  STAFF_LEVEL: 7, // Nhân viên
  JUNIOR_LEVEL: 8, // Nhân viên mới/Thực tập sinh
} as const;

// Validation rules
export const HIERARCHY_VALIDATION_RULES = {
  // Hierarchy level phải >= 1
  MIN_HIERARCHY_LEVEL: 1,

  // Hierarchy level phải <= MAX_DEPTH
  MAX_HIERARCHY_LEVEL: MAX_ORGANIZATION_HIERARCHY_DEPTH,

  // Không được có gap trong hierarchy (VD: có level 1,3 nhưng không có 2)
  REQUIRE_CONTINUOUS_LEVELS: true,

  // Mỗi level phải có ít nhất 1 user active
  REQUIRE_ACTIVE_USER_PER_LEVEL: false,

  // Parent level phải có hierarchy number nhỏ hơn child level
  PARENT_LEVEL_MUST_BE_LOWER: true,
} as const;

// Error messages
export const HIERARCHY_ERROR_MESSAGES = {
  EXCEEDS_MAX_DEPTH: `Hierarchy level cannot exceed ${MAX_ORGANIZATION_HIERARCHY_DEPTH}`,
  INVALID_LEVEL_RANGE: `Hierarchy level must be between ${HIERARCHY_VALIDATION_RULES.MIN_HIERARCHY_LEVEL} and ${HIERARCHY_VALIDATION_RULES.MAX_HIERARCHY_LEVEL}`,
  LEVEL_GAP_DETECTED: 'Hierarchy levels must be continuous (no gaps allowed)',
  INVALID_PARENT_CHILD:
    'Parent hierarchy level must be lower (smaller number) than child level',
  CIRCULAR_REFERENCE: 'Circular reference detected in hierarchy',
} as const;

// Performance thresholds
export const HIERARCHY_PERFORMANCE_LIMITS = {
  // Số lượng tối đa users per organization level
  MAX_USERS_PER_LEVEL: 1000,

  // Số lượng tối đa children per parent level
  MAX_CHILDREN_PER_PARENT: 50,

  // Depth tối đa cho recursive queries
  MAX_RECURSIVE_QUERY_DEPTH: MAX_ORGANIZATION_HIERARCHY_DEPTH,

  // Cache TTL cho hierarchy data (seconds)
  HIERARCHY_CACHE_TTL: 3600, // 1 hour
} as const;
