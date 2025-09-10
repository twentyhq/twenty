# MktSInvoice CreateOne Pre-Query Hook

## Mô tả

Hook `MktSInvoiceCreateOnePreQueryHook` được sử dụng để tự động điền thông tin vào SInvoice khi tạo mới, dựa trên dữ liệu từ Order và OrderItems liên quan.

## Cách hoạt động

Khi thực hiện mutation `CreateOneMktSInvoice`, hook sẽ:

1. **Kiểm tra input**: Xác minh có `mktOrderId` trong input
2. **Lấy dữ liệu Order**: Truy vấn thông tin Order từ database
3. **Lấy dữ liệu OrderItems**: Truy vấn tất cả OrderItems thuộc Order đó
4. **Tính toán thông tin**: 
   - Tính tổng tiền không thuế
   - Tính tổng thuế
   - Tính tổng tiền có thuế
   - Chuyển đổi số thành chữ
5. **Tạo SInvoice Items**: Tự động tạo các SInvoice Items từ OrderItems với quan hệ liên kết
6. **Điền thông tin**: Cập nhật input với dữ liệu đã tính toán và SInvoice Items

## Dữ liệu được điền tự động

### Từ Order:
- `buyerName`: Tên người mua (từ order.name)
- `currencyCode`: Mã tiền tệ (từ order.currency, mặc định 'VND')
- `description`: Mô tả (từ order.note)

### Từ OrderItems (tính toán):
- `sumOfTotalLineAmountWithoutTax`: Tổng tiền không thuế
- `totalAmountWithoutTax`: Tổng tiền không thuế
- `totalTaxAmount`: Tổng thuế
- `totalAmountWithTax`: Tổng tiền có thuế
- `totalAmountWithTaxInWords`: Tổng tiền bằng chữ

### Thông tin mặc định:
- `name`: Tên SInvoice (từ order.orderCode hoặc order.name)
- `invoiceType`: Loại hóa đơn (mặc định null)
- `templateCode`: Mã mẫu (mặc định '1/770')
- `invoiceSeries`: Ký hiệu (mặc định 'K23TXM')
- `paymentStatus`: Trạng thái thanh toán (mặc định false)
- `cusGetInvoiceRight`: Quyền nhận hóa đơn (mặc định true)
- `transactionUuid`: UUID giao dịch (từ order.orderCode)

### SInvoice Items được tạo tự động:
- `name`: Tên item (từ orderItem.name hoặc snapshotProductName)
- `lineNumber`: Số dòng (tự động tăng)
- `selection`: Lựa chọn (mặc định 1)
- `itemCode`: Mã sản phẩm (MKT_ + productId nếu có)
- `itemName`: Tên sản phẩm
- `unitName`: Đơn vị tính
- `quantity`: Số lượng
- `unitPrice`: Đơn giá
- `itemTotalAmountWithoutTax`: Tổng tiền không thuế
- `itemTotalAmountAfterDiscount`: Tổng tiền sau giảm giá
- `itemTotalAmountWithTax`: Tổng tiền có thuế
- `taxPercentage`: Phần trăm thuế
- `taxAmount`: Số tiền thuế
- `position`: Vị trí trong danh sách

## Ví dụ sử dụng

```graphql
mutation CreateOneMktSInvoice($input: CreateOneMktSInvoiceInput!) {
  createOneMktSInvoice(input: $input) {
    id
    name
    totalAmountWithTax
    totalAmountWithTaxInWords
    buyerName
    currencyCode
    mktOrder {
      id
      orderCode
    }
    mktSInvoiceItems {
      id
      name
      lineNumber
      itemName
      quantity
      unitPrice
      itemTotalAmountWithTax
      taxPercentage
      taxAmount
    }
  }
}
```

Input tối thiểu:
```json
{
  "input": {
    "mktOrderId": "order-uuid-here"
  }
}
```

### Cấu trúc dữ liệu được tạo:

Hook sẽ tạo input có cấu trúc như sau:
```json
{
  "input": {
    "mktOrderId": "order-uuid-here",
    "name": "SInvoice - ORDER001",
    "buyerName": "Customer Name",
    "totalAmountWithTax": 1000000,
    "mktSInvoiceItems": {
      "create": [
        {
          "name": "Product 1",
          "lineNumber": 1,
          "itemName": "Product 1",
          "quantity": 2,
          "unitPrice": 500000,
          "itemTotalAmountWithTax": 1000000,
          "taxPercentage": 10,
          "taxAmount": 90909
        }
      ]
    }
  }
}
```

Hook sẽ tự động điền tất cả thông tin còn lại dựa trên Order và OrderItems, bao gồm cả việc tạo SInvoice Items.

## Cách liên kết SInvoice Items với SInvoice

Hook sử dụng cú pháp GraphQL nested create để thiết lập quan hệ:

```typescript
mktSInvoiceItems: {
  create: sInvoiceItems,
}
```

Cú pháp này đảm bảo:
- Mỗi SInvoice Item được tạo với quan hệ `mktSInvoiceId` trỏ đến SInvoice
- GraphQL engine tự động thiết lập foreign key
- Không cần thiết lập thủ công `mktSInvoiceId` trong từng item
- Quan hệ được thiết lập trong một transaction duy nhất

## Lưu ý

- Hook chỉ hoạt động khi có `mktOrderId` trong input
- Nếu Order không tồn tại hoặc không có OrderItems, hook sẽ bỏ qua và trả về input gốc
- Tất cả tính toán được thực hiện với độ chính xác cao để tránh sai lệch về tiền tệ
- Hàm `numberToWords` chuyển đổi số thành chữ tiếng Việt (có thể cải thiện thêm)
- SInvoice Items được tạo tự động với đầy đủ thông tin từ OrderItems
- Mã sản phẩm được tạo theo format `MKT_` + productId (tuân thủ naming convention)
- Tất cả SInvoice Items sẽ có quan hệ với SInvoice được tạo thông qua cú pháp GraphQL `create`
- Quan hệ `mktSInvoiceId` được thiết lập tự động bởi GraphQL engine
