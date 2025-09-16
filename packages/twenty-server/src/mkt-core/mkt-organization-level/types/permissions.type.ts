/**
 * Quyền mặc định theo cấp độ tổ chức (Organization Level)
 * Định nghĩa những gì user được phép làm với từng tài nguyên
 */
export type DefaultPermissions = {
  /**
   * Tài nguyên và hành động được phép
   * Key: tên tài nguyên (customers, orders, reports, etc.)
   * Value: danh sách hành động (read, create, update, delete, export, etc.)
   *
   * Ví dụ: { "customers": ["read", "create"], "reports": ["read"] }
   */
  resources: {
    [resourceName: string]: readonly string[];
  };

  /**
   * Khả năng hệ thống được phép
   * Key: tên khả năng (data_export, admin_functions, etc.)
   * Value: true/false cho phép hay không
   *
   * Ví dụ: { "data_export": false, "cross_department_view": true }
   */
  actions: {
    [actionName: string]: boolean;
  };

  /**
   * Giới hạn số lượng và điều kiện cơ bản
   * Key: tên giới hạn (max_records_per_query, working_hours_only, etc.)
   * Value: số hoặc boolean
   *
   * Ví dụ: { "max_records_per_query": 1000, "approval_required": true }
   */
  restrictions: {
    [restrictionName: string]: number | boolean;
  };
};

/**
 * Giới hạn truy cập chi tiết theo cấp độ tổ chức
 * Định nghĩa các ràng buộc và điều kiện bổ sung cho quyền truy cập
 * Có thể override hoặc hạn chế các quyền trong defaultPermissions
 */
export type AccessLimitations = {
  /**
   * Giới hạn thời gian - kiểm soát khi nào user có thể truy cập
   */
  temporal?: {
    /**
     * Cấu hình giờ làm việc
     */
    working_hours?: {
      /** Có áp dụng giới hạn giờ làm việc không */
      enabled: boolean;
      /** Thời gian bắt đầu (HH:mm format, ví dụ: "08:00") */
      start?: string;
      /** Thời gian kết thúc (HH:mm format, ví dụ: "18:00") */
      end?: string;
      /** Múi giờ (ví dụ: "Asia/Ho_Chi_Minh") */
      timezone?: string;
      /** Chỉ áp dụng cho ngày làm việc (T2-T6) */
      weekdays_only?: boolean;
    };
    /** Thời gian timeout session (giây) - tự động logout khi không hoạt động */
    session_timeout?: number;
    /** Số giờ làm việc tối đa mỗi ngày */
    max_daily_hours?: number;
    /** Có yêu cầu nghỉ giải lao không (dành cho intern/staff) */
    break_required?: boolean;
  };

  /**
   * Giới hạn truy cập dữ liệu - kiểm soát dữ liệu nào được xem
   */
  data_access?: {
    /** Danh sách trường nhạy cảm bị ẩn (salary, personal_id, bank_account, etc.) */
    sensitive_fields?: readonly string[];
    /** Danh sách phòng ban bị hạn chế truy cập (hr, finance, legal, etc.) */
    restricted_departments?: readonly string[];
    /** Số ngày lưu trữ dữ liệu tối đa (-1 = không giới hạn) */
    data_retention_days?: number;
    /** Chỉ được xem records thuộc sở hữu của mình */
    own_records_only?: boolean;
    /** Cần phê duyệt từ supervisor cho mọi truy cập */
    supervisor_approval_required?: boolean;
  };

  /**
   * Giới hạn vận hành - kiểm soát cách thức truy cập
   */
  operational?: {
    /** Số session đồng thời tối đa */
    max_concurrent_sessions?: number;
    /** Danh sách IP/subnet được phép (["192.168.1.0/24"]) */
    ip_restrictions?: readonly string[];
    /** Yêu cầu xác thực 2 yếu tố */
    require_2fa?: boolean;
    /** Ghi log tất cả hành động của user */
    audit_all_actions?: boolean;
    /** Có giám sát từ supervisor không */
    supervisor_oversight?: boolean;
  };

  /**
   * Giới hạn chức năng - kiểm soát hành động cụ thể
   */
  functional?: {
    /** Danh sách hành động bị cấm tuyệt đối (không thể override) */
    blocked_actions?: readonly string[];
    /** Danh sách hành động cần phê duyệt từ cấp trên */
    require_approval?: readonly string[];
    /** Danh sách tình huống cần leo thang lên management */
    escalation_required?: readonly string[];
  };
};
