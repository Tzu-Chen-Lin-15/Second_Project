# 說明


## CORS

### Cookie 問題

- Cookie 在 HTTP 的環境, 不能 cross domain
- Cookie 要 cross domain, 必須是 HTTPS
- 專題時, 同一台電腦, 使用相同的 domain

## 作業

第二次專題的後端專案, 放到 github, bitbucket, gitlab
給 repo 的 public URL
Deadline: 2025-09-15

## REST api

資料表 products

### GET

  - 讀取列表 /api/products
  - 讀取單筆 /api/products/:p_id

### POST

  - 新增一筆資料 /api/products (要給表單資料)

### PUT

  - 修改一筆資料 /api/products/:p_id (要給表單資料)

### DELETE

  - 刪除一筆資料 /api/products/:p_id
