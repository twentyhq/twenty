import { TagColor } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';

export enum OrderStatus {
  ON_HOLD = 'ON_HOLD',        // đơn hàng mới tạo, chờ xử lý
  PAID = 'PAID',              // đã thanh toán thành công
  FAILED = 'FAILED',          // thanh toán thất bại
  CANCELLED = 'CANCELLED',    // bị huỷ (người mua/người bán)
  FULFILLED = 'FULFILLED',    // đã giao/hoàn thành phần giao dịch hàng hóa/dịch vụ
  EXPIRED = 'EXPIRED',        // hết hạn (ví dụ: đơn chưa thanh toán trong thời gian cho phép)
  PROCESSING = 'PROCESSING',  // đang xử lý (chuẩn bị giao/đang vận chuyển)
  COMPLETED = 'COMPLETED',    // kết thúc toàn bộ lifecycle (cả thanh toán + giao hàng + hậu kỳ)
  REFUNDED = 'REFUNDED',      // đã hoàn tiền
  DISPUTED = 'DISPUTED',      // đã xảy ra tranh chấp
  OTHER = 'OTHER',            // tình huống ngoại lệ, fallback
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
