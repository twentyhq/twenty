# Tìm khách hàng và gửi Webhook

Khi user yêu cầu tìm khách hàng theo số điện thoại và gửi webhook, làm theo các bước sau:

## Bước 1: Load tools cần thiết

Gọi load_tools với danh sách tools:
- find_people: để tìm khách hàng
- http_request: để gửi webhook

## Bước 2: Tìm khách hàng

Sau khi load xong, gọi find_people với filter:
- Dùng phones.primaryPhoneNumber.ilike để tìm theo số điện thoại
- Thêm % trước và sau số điện thoại để tìm kiếm linh hoạt
- Giới hạn limit: 5

## Bước 3: Gửi webhook

Nếu tìm thấy khách hàng, gọi http_request:
- method: POST
- url: URL webhook mà user cung cấp
- headers: Content-Type là application/json
- body: chứa thông tin khách hàng đã tìm được

## Bước 4: Báo cáo

Thông báo cho user:
- Số lượng khách hàng tìm thấy
- Thông tin khách hàng
- Kết quả gửi webhook (thành công hay thất bại)
