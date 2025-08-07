# Đồng bộ standard object lên staging

## Hướng dẫn đồng bộ và kiểm tra dữ liệu customer module

### 1. Khởi động server staging
```sh
npx nx start
```

### 2. Chuyển vào thư mục server
```sh
cd ./packages/twenty-server
```

### 3. Đồng bộ metadata workspace
```sh
yarn command:prod workspace:sync-metadata
```

### 4. Seed customer module cho workspace cụ thể
```sh
yarn command:prod workspace:seed:customer-module -w 3b8e6458-5fc1-4e63-8563-008ccddaa6db
```

---

## Query kiểm tra dữ liệu trên database

### Kiểm tra object core
```sql
SELECT * FROM core."objectMetadata" WHERE "nameSingular" = 'mktCustomer';
```

### Kiểm tra field core
```sql
SELECT * FROM core."fieldMetadata" fm 
JOIN core."objectMetadata" om ON fm."objectMetadataId" = om.id 
WHERE om."nameSingular" = 'mktCustomer' AND om."workspaceId" = '3b8e6458-5fc1-4e63-8563-008ccddaa6db';
```

### Kiểm tra views
```sql
SELECT * FROM workspace_3ixj3i1a5avy16ptijtb3lae3."view" v
JOIN core."objectMetadata" om ON v."objectMetadataId" = om.id
WHERE om."nameSingular" = 'mktCustomer';
```

### Lấy fieldMetadataId cho các fields của customer
```sql
SELECT * FROM workspace_3ixj3i1a5avy16ptijtb3lae3."viewField" vf
JOIN workspace_3ixj3i1a5avy16ptijtb3lae3."view" v ON vf."viewId" = v.id
JOIN core."objectMetadata" om ON v."objectMetadataId" = om.id
WHERE om."nameSingular" = 'mktCustomer';
```

### Kiểm tra favorite
```sql
SELECT v.name, fa.* FROM workspace_3ixj3i1a5avy16ptijtb3lae3."favorite" fa
JOIN workspace_3ixj3i1a5avy16ptijtb3lae3."view" v ON fa."viewId" = v.id
```

---

> **Lưu ý:**
> - Thay thế workspaceId và schema cho phù hợp với môi trường của bạn nếu khác.
> - Đảm bảo các lệnh seed và sync chạy thành công trước khi kiểm tra dữ liệu.

### Confilict: comment bỏ qua các source sau để chạy thử: 
packages\twenty-server\src\database\typeorm\core\core.datasource.ts
// 1:  `${isJest ? '' : 'dist/'}src/mkt-core/mkt-example/libs/**/entities/*.entity.{ts,js}`,
// 2:  `${isJest ? '' : 'dist/'}src/mkt-core/mkt-example/libs/**/entities/*.entity.{ts,js}`,
packages\twenty-server\src\mkt\mkt.module.ts
// OtpModule,
// MailerModule,
// LicenseModule,