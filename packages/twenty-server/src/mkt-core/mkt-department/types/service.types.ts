/**
 * Service-level types for department operations
 */

export type DepartmentPathInfo = {
  departmentId: string;
  departmentCode: string;
  level: number;
  path: string[];
};

export type CircularReferenceInfo = {
  departmentId: string;
  circularPath: string[];
  detectedAt: Date;
};

export type RebuildResult = {
  processedCount: number;
  errorCount: number;
  errors: Array<{
    departmentId: string;
    error: string;
  }>;
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};
