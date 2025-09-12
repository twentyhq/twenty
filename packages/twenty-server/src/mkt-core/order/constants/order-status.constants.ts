import { TagColor } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

export enum OrderStatus {
  ON_HOLD = 'ON_HOLD', // đơn hàng mới tạo, chờ xử lý
  PAID = 'PAID', // đã thanh toán thành công
  FAILED = 'FAILED', // thanh toán thất bại
  CANCELLED = 'CANCELLED', // bị huỷ (người mua/người bán)
  FULFILLED = 'FULFILLED', // đã giao/hoàn thành phần giao dịch hàng hóa/dịch vụ
  EXPIRED = 'EXPIRED', // hết hạn (ví dụ: đơn chưa thanh toán trong thời gian cho phép)
  PROCESSING = 'PROCESSING', // đang xử lý (chuẩn bị giao/đang vận chuyển)
  COMPLETED = 'COMPLETED', // kết thúc toàn bộ lifecycle (cả thanh toán + giao hàng + hậu kỳ)
  REFUNDED = 'REFUNDED', // đã hoàn tiền
  DISPUTED = 'DISPUTED', // đã xảy ra tranh chấp
  OTHER = 'OTHER', // tình huống ngoại lệ, fallback
  TRIAL = 'TRIAL', // đang ở trong giai đoạn trial
}

export const ORDER_STATUS_OPTIONS = [
  {
    value: OrderStatus.ON_HOLD,
    label: 'On Hold',
    color: 'gray' as TagColor,
    position: 0,
  },
  {
    value: OrderStatus.PAID,
    label: 'Paid',
    color: 'green' as TagColor,
    position: 1,
  },
  {
    value: OrderStatus.FAILED,
    label: 'Failed',
    color: 'red' as TagColor,
    position: 2,
  },
  {
    value: OrderStatus.CANCELLED,
    label: 'Cancelled',
    color: 'orange' as TagColor,
    position: 3,
  },
  {
    value: OrderStatus.FULFILLED,
    label: 'Fulfilled',
    color: 'blue' as TagColor,
    position: 4,
  },
  {
    value: OrderStatus.EXPIRED,
    label: 'Expired',
    color: 'red' as TagColor,
    position: 5,
  },
  {
    value: OrderStatus.PROCESSING,
    label: 'Processing',
    color: 'blue' as TagColor,
    position: 6,
  },
  {
    value: OrderStatus.COMPLETED,
    label: 'Completed',
    color: 'green' as TagColor,
    position: 7,
  },
  {
    value: OrderStatus.REFUNDED,
    label: 'Refunded',
    color: 'purple' as TagColor,
    position: 8,
  },
  {
    value: OrderStatus.OTHER,
    label: 'Other',
    color: 'gray' as TagColor,
    position: 9,
  },
  {
    value: OrderStatus.TRIAL,
    label: 'Trial',
    color: 'yellow' as TagColor,
    position: 9,
  },
];

export enum SINVOICE_STATUS {
  PENDING = 'PENDING',
  SEND = 'SEND',
  FAILED = 'FAILED',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
}

export const SINVOICE_STATUS_OPTIONS = [
  {
    value: SINVOICE_STATUS.PENDING,
    label: 'Pending',
    color: 'orange' as TagColor,
    position: 0,
  },
  {
    value: SINVOICE_STATUS.SEND,
    label: 'Send',
    color: 'blue' as TagColor,
    position: 1,
  },
  {
    value: SINVOICE_STATUS.FAILED,
    label: 'Failed',
    color: 'red' as TagColor,
    position: 2,
  },
  {
    value: SINVOICE_STATUS.ERROR,
    label: 'Error',
    color: 'gray' as TagColor,
    position: 3,
  },
  {
    value: SINVOICE_STATUS.SUCCESS,
    label: 'Success',
    color: 'green' as TagColor,
    position: 4,
  },
];

export enum MKT_LICENSE_STATUS {
  PENDING = 'PENDING', // Đang chờ xử lý cấp phép, chưa bắt đầu quá trình lấy license
  GETTING = 'GETTING', // Đang trong quá trình gọi API hoặc service để lấy license
  FAILED = 'FAILED', // Quá trình lấy license thất bại (ví dụ: lỗi network, timeout, dữ liệu không hợp lệ)
  ERROR = 'ERROR', // Lỗi hệ thống hoặc lỗi không mong muốn trong khi xử lý license
  SUCCESS = 'SUCCESS', // License đã được lấy thành công và hợp lệ
  REVOKED = 'REVOKED', // License đã bị thu hồi (do hết hạn, bị hủy hoặc do vi phạm điều kiện)
  DELETED = 'DELETED', // License đã bị xóa khỏi hệ thống (không còn được quản lý/truy vết)
  TRIAL = 'TRIAL', // License đang ở trong giai đoạn trial
}

export const MKT_LICENSE_STATUS_OPTIONS = [
  {
    value: MKT_LICENSE_STATUS.PENDING,
    label: 'Pending',
    color: 'orange' as TagColor,
    position: 0,
  },
  {
    value: MKT_LICENSE_STATUS.GETTING,
    label: 'Getting',
    color: 'blue' as TagColor,
    position: 1,
  },
  {
    value: MKT_LICENSE_STATUS.FAILED,
    label: 'Failed',
    color: 'red' as TagColor,
    position: 2,
  },
  {
    value: MKT_LICENSE_STATUS.ERROR,
    label: 'Error',
    color: 'gray' as TagColor,
    position: 3,
  },
  {
    value: MKT_LICENSE_STATUS.SUCCESS,
    label: 'Success',
    color: 'green' as TagColor,
    position: 4,
  },
  {
    value: MKT_LICENSE_STATUS.REVOKED,
    label: 'Revoked',
    color: 'purple' as TagColor,
    position: 5,
  },
  {
    value: MKT_LICENSE_STATUS.DELETED,
    label: 'Deleted',
    color: 'gray' as TagColor,
    position: 6,
  },
  {
    value: MKT_LICENSE_STATUS.TRIAL,
    label: 'Trial',
    color: 'yellow' as TagColor,
    position: 7,
  },
];
