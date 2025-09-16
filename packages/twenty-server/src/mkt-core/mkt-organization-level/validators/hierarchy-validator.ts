import { Injectable } from '@nestjs/common';

import {
  MAX_ORGANIZATION_HIERARCHY_DEPTH,
  HIERARCHY_VALIDATION_RULES,
  HIERARCHY_ERROR_MESSAGES,
  HIERARCHY_PERFORMANCE_LIMITS,
} from 'src/mkt-core/mkt-organization-level/constants/hierarchy-constraints.constants';

export interface HierarchyValidationError {
  field: string;
  message: string;
  code: string;
}

export interface HierarchyValidationResult {
  isValid: boolean;
  errors: HierarchyValidationError[];
  warnings: string[];
}

@Injectable()
export class OrganizationLevelHierarchyValidator {
  /**
   * Xác thực các ràng buộc phân cấp tổ chức
   */
  validateOrganizationLevel(
    hierarchyLevel: number,
    parentLevelId?: string,
    existingLevels?: {
      id: string;
      hierarchyLevel: number;
      isActive: boolean;
    }[],
  ): HierarchyValidationResult {
    const errors: HierarchyValidationError[] = [];
    const warnings: string[] = [];

    // 1. Xác thực phạm vi cấp độ phân cấp
    if (!this.isValidHierarchyRange(hierarchyLevel)) {
      errors.push({
        field: 'hierarchyLevel',
        message: HIERARCHY_ERROR_MESSAGES.INVALID_LEVEL_RANGE,
        code: 'INVALID_RANGE',
      });
    }

    // 2. Xác thực ràng buộc độ sâu tối đa
    if (!this.isWithinMaxDepth(hierarchyLevel)) {
      errors.push({
        field: 'hierarchyLevel',
        message: HIERARCHY_ERROR_MESSAGES.EXCEEDS_MAX_DEPTH,
        code: 'EXCEEDS_MAX_DEPTH',
      });
    }

    // 3. Xác thực tính liên tục của các cấp độ (nếu có cấp độ hiện tại)
    if (
      existingLevels &&
      HIERARCHY_VALIDATION_RULES.REQUIRE_CONTINUOUS_LEVELS
    ) {
      if (!this.hasContinuousLevels([...existingLevels, { hierarchyLevel }])) {
        warnings.push(
          'Thêm cấp độ này có thể tạo ra khoảng trống trong chuỗi phân cấp',
        );
      }
    }

    // 4. Xác thực mối quan hệ cha-con
    if (parentLevelId && existingLevels) {
      const parentLevel = existingLevels.find((l) => l.id === parentLevelId);

      if (
        parentLevel &&
        !this.isValidParentChildRelation(
          parentLevel.hierarchyLevel,
          hierarchyLevel,
        )
      ) {
        errors.push({
          field: 'hierarchyLevel',
          message: HIERARCHY_ERROR_MESSAGES.INVALID_PARENT_CHILD,
          code: 'INVALID_PARENT_CHILD',
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Xác thực cấp độ phân cấp nằm trong phạm vi hợp lệ
   */
  private isValidHierarchyRange(hierarchyLevel: number): boolean {
    return (
      hierarchyLevel >= HIERARCHY_VALIDATION_RULES.MIN_HIERARCHY_LEVEL &&
      hierarchyLevel <= HIERARCHY_VALIDATION_RULES.MAX_HIERARCHY_LEVEL
    );
  }

  /**
   * Xác thực cấp độ phân cấp không vượt quá độ sâu tối đa
   */
  private isWithinMaxDepth(hierarchyLevel: number): boolean {
    return hierarchyLevel <= MAX_ORGANIZATION_HIERARCHY_DEPTH;
  }

  /**
   * Kiểm tra xem các cấp độ phân cấp có liên tục không (không có khoảng trống)
   */
  private hasContinuousLevels(levels: { hierarchyLevel: number }[]): boolean {
    const sortedLevels = levels
      .map((l) => l.hierarchyLevel)
      .sort((a, b) => a - b);

    for (let i = 1; i < sortedLevels.length; i++) {
      if (sortedLevels[i] - sortedLevels[i - 1] > 1) {
        return false; // Phát hiện khoảng trống
      }
    }

    return true;
  }

  /**
   * Xác thực mối quan hệ phân cấp cha-con
   */
  private isValidParentChildRelation(
    parentLevel: number,
    childLevel: number,
  ): boolean {
    // Cha phải có số cấp độ phân cấp thấp hơn (quyền hạn cao hơn)
    return parentLevel < childLevel;
  }

  /**
   * Kiểm tra tham chiếu vòng trong phân cấp
   */
  validateCircularReference(
    levelId: string,
    parentLevelId: string,
    allLevels: { id: string; parentLevelId?: string }[],
  ): boolean {
    const visited = new Set<string>();
    let currentId: string | undefined = parentLevelId;

    while (currentId && !visited.has(currentId)) {
      if (currentId === levelId) {
        return false; // Phát hiện tham chiếu vòng
      }

      visited.add(currentId);
      const parentLevel = allLevels.find((l) => l.id === currentId);

      currentId = parentLevel?.parentLevelId || undefined;
    }

    return true; // Không có tham chiếu vòng
  }

  /**
   * Xác thực các ràng buộc về hiệu suất
   */
  validatePerformanceConstraints(
    hierarchyLevel: number,
    userCountAtLevel: number,
    childrenCount?: number,
  ): HierarchyValidationResult {
    const errors: HierarchyValidationError[] = [];
    const warnings: string[] = [];

    // Kiểm tra giới hạn người dùng trên mỗi cấp độ
    if (userCountAtLevel > HIERARCHY_PERFORMANCE_LIMITS.MAX_USERS_PER_LEVEL) {
      warnings.push(
        `Cấp độ có ${userCountAtLevel} người dùng, vượt quá giới hạn khuyến nghị là ${HIERARCHY_PERFORMANCE_LIMITS.MAX_USERS_PER_LEVEL}`,
      );
    }

    // Kiểm tra giới hạn số con trên mỗi cha
    if (
      childrenCount &&
      childrenCount > HIERARCHY_PERFORMANCE_LIMITS.MAX_CHILDREN_PER_PARENT
    ) {
      warnings.push(
        `Cấp độ có ${childrenCount} con trực tiếp, vượt quá giới hạn khuyến nghị là ${HIERARCHY_PERFORMANCE_LIMITS.MAX_CHILDREN_PER_PARENT}`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
