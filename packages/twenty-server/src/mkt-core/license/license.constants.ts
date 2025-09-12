import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

export enum MKT_LICENSE_STATUS {
  ACTIVE = 'ACTIVE', // Đang hoạt động, hợp lệ
  INACTIVE = 'INACTIVE', // Không hoạt động, bị tạm ngưng
  EXPIRED = 'EXPIRED', // Đã hết hạn
  REVOKED = 'REVOKED', // Bị thu hồi thủ công
  ERROR = 'ERROR', // Có lỗi, trạng thái không hợp lệ
  DELETED = 'DELETED', // Đã bị xóa (thường là soft delete)
  PENDING = 'PENDING', // Đang chờ xử lý / chờ duyệt
  OTHER = 'OTHER', // Trường hợp khác, không nằm trong các trạng thái trên
  TRIAL = 'TRIAL', // License đang ở trong giai đoạn trial
}

export const MKT_LICENSE_STATUS_OPTIONS: FieldMetadataComplexOption[] = [
  {
    value: MKT_LICENSE_STATUS.ACTIVE,
    label: 'Active',
    position: 0,
    color: 'blue',
  },
  {
    value: MKT_LICENSE_STATUS.INACTIVE,
    label: 'Inactive',
    position: 1,
    color: 'purple',
  },
  {
    value: MKT_LICENSE_STATUS.EXPIRED,
    label: 'Expired',
    position: 2,
    color: 'green',
  },
  {
    value: MKT_LICENSE_STATUS.REVOKED,
    label: 'Revoked',
    position: 3,
    color: 'orange',
  },
  {
    value: MKT_LICENSE_STATUS.PENDING,
    label: 'Pending',
    position: 4,
    color: 'yellow',
  },
  {
    value: MKT_LICENSE_STATUS.ERROR,
    label: 'Error',
    position: 5,
    color: 'red',
  },
  {
    value: MKT_LICENSE_STATUS.DELETED,
    label: 'Deleted',
    position: 6,
    color: 'gray',
  },
  {
    value: MKT_LICENSE_STATUS.OTHER,
    label: 'Other',
    position: 7,
    color: 'turquoise',
  },
  {
    value: MKT_LICENSE_STATUS.TRIAL,
    label: 'Trial',
    position: 8,
    color: 'yellow',
  },
];
