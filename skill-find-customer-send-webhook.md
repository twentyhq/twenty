# Skill: Tìm khách hàng và gửi Webhook

## Mô tả
Skill này hướng dẫn cách tìm khách hàng theo số điện thoại và gửi thông tin ra webhook bên ngoài.

## Khi nào sử dụng
- Khi user yêu cầu tìm khách hàng theo số điện thoại
- Khi cần gửi thông tin khách hàng ra hệ thống bên ngoài (webhook)

## Hướng dẫn thực hiện

### Bước 1: Load các tool cần thiết

load_tools(["find_people", "http_request"])

### Bước 2: Tìm khách hàng theo số điện thoại

Sử dụng find_people với filter theo phones.primaryPhoneNumber:

find_people({
  "filter": {
    "phones": {
      "primaryPhoneNumber": {
        "ilike": "%SỐ_ĐIỆN_THOẠI%"
      }
    }
  },
  "limit": 10
})

Lưu ý về số điện thoại:
- Loại bỏ dấu cách, dấu gạch ngang
- Có thể tìm theo phần cuối số (vd: "%228873")
- Dùng ilike để tìm kiếm không phân biệt

### Bước 3: Gửi thông tin ra webhook

Sau khi tìm được khách hàng, gửi thông tin qua http_request:

http_request({
  "url": "URL_WEBHOOK_CỦA_USER",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "customer": {
      "id": "ID_KHÁCH_HÀNG",
      "name": "TÊN_KHÁCH_HÀNG",
      "email": "EMAIL",
      "phone": "SỐ_ĐIỆN_THOẠI",
      "company": "CÔNG_TY"
    },
    "source": "twenty-crm",
    "timestamp": "THỜI_GIAN"
  }
})

### Bước 4: Báo cáo kết quả cho user
- Nếu tìm thấy: Hiển thị thông tin khách hàng và xác nhận đã gửi webhook
- Nếu không tìm thấy: Thông báo không có khách hàng với số điện thoại đó
- Nếu webhook lỗi: Báo lỗi và hiển thị thông tin khách hàng

## Ví dụ hoàn chỉnh

User: "Tìm khách số điện thoại 0979228873 và gửi ra webhook https://example.com/webhook"

Agent thực hiện:

1. Load tools:
load_tools(["find_people", "http_request"])

2. Tìm khách hàng:
find_people({
  "filter": {
    "phones": {
      "primaryPhoneNumber": {
        "ilike": "%0979228873%"
      }
    }
  },
  "limit": 5
})

3. Gửi webhook (với kết quả tìm được):
http_request({
  "url": "https://example.com/webhook",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "customer": {
      "id": "abc-123",
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@email.com",
      "phone": "0979228873"
    },
    "action": "customer_lookup",
    "timestamp": "2024-01-15T10:30:00Z"
  }
})

4. Trả lời user: "Đã tìm thấy khách hàng Nguyễn Văn A và gửi thông tin đến webhook thành công."

## Xử lý lỗi

### Không tìm thấy khách hàng
- Thử tìm với phần cuối số điện thoại (6-8 số cuối)
- Thông báo cho user nếu vẫn không có kết quả

### Webhook thất bại
- Kiểm tra URL hợp lệ
- Báo lỗi HTTP status code cho user
- Vẫn hiển thị thông tin khách hàng đã tìm được

## Các trường thông tin khách hàng có thể gửi
- id - ID trong hệ thống
- name.firstName, name.lastName - Họ tên
- emails.primaryEmail - Email chính
- phones.primaryPhoneNumber - Số điện thoại chính
- company - Công ty liên kết
- jobTitle - Chức vụ
- city - Thành phố
- createdAt - Ngày tạo
