# Supply Transfer Vehicle Flow

Tài liệu này mô tả flow frontend cần gọi cho phiếu điều phối có hỗ trợ gán nhiều xe.

## Mục tiêu nghiệp vụ

- Chỉ gán xe đang `Free` của đúng trạm nguồn vào phiếu.
- Khi gán thành công, backend tự chuyển xe sang `Busy`.
- Một phiếu có thể có nhiều xe.
- Khi xuất hàng, backend chuyển các xe `Assigned` sang `InTransit`.
- Khi từng xe hoàn tất hành trình hợp lệ, backend mới trả xe đó về `Free`.
- Nếu hủy phiếu giữa chừng:
  - assignment active bị chuyển `Cancelled`
  - xe được trả về `Free`
  - nếu phiếu đã `Shipping`, backend tự tạo transaction `SupplyTransferReturn` để hoàn kho nguồn.

## Các trạng thái chính

### SupplyTransferStatus

- `1 = Pending`
- `2 = Approved`
- `3 = Shipping`
- `4 = Received`
- `5 = Cancelled`

### SupplyTransferVehicleStatus

- `1 = Assigned`
- `2 = InTransit`
- `3 = Arrived`
- `4 = Completed`
- `5 = Cancelled`
- `6 = Incident`

## Chuỗi flow chuẩn cho FE

### 1. Tạo phiếu

Endpoint:

```http
POST /api/SupplyTransfer
```

Body:

```json
{
  "sourceStationId": "guid",
  "destinationStationId": "guid",
  "reason": "Kho đích đang thiếu vật tư",
  "notes": "Ghi chú thêm",
  "evidenceUrls": ["https://.../request.pdf"],
  "items": [
    {
      "supplyItemId": "guid",
      "quantity": 100,
      "notes": "Ưu tiên giao sớm"
    }
  ]
}
```

### 2. Duyệt phiếu

Endpoint:

```http
PATCH /api/SupplyTransfer/{transferId}/approve
```

Body:

```json
{
  "notes": "Đã duyệt",
  "evidenceUrls": ["https://.../approve.pdf"]
}
```

### 3. Lấy xe rảnh để gán vào phiếu

Endpoint:

```http
GET /api/Vehicle/available-for-transfer
```

Ghi chú:

- Backend tự scope theo moderator hiện tại.
- Chỉ trả xe `Free` thuộc trạm của moderator.

### 4. Gán nhiều xe vào phiếu

Endpoint:

```http
PATCH /api/SupplyTransfer/{transferId}/vehicles
```

Body:

```json
{
  "vehicles": [
    {
      "vehicleId": "guid-1",
      "driverUserId": "guid-driver-1",
      "note": "Xe tải 2.5 tấn"
    },
    {
      "vehicleId": "guid-2",
      "driverUserId": null,
      "note": "Xe bán tải hỗ trợ"
    }
  ]
}
```

Sau khi gán thành công:

- mỗi assignment có `status = Assigned`
- mỗi xe vừa gán sẽ bị đổi sang `VehicleStatus = Busy`

### 5. Bỏ xe khỏi phiếu trước khi xuất hàng

Endpoint:

```http
DELETE /api/SupplyTransfer/{transferId}/vehicles/{supplyTransferVehicleId}
```

Điều kiện:

- chỉ bỏ được khi phiếu còn `Approved`
- chỉ bỏ được assignment đang `Assigned`

Kết quả:

- assignment thành `Cancelled`
- xe được trả về `Free`

### 6. Chuyển phiếu sang đang vận chuyển

Endpoint:

```http
PATCH /api/SupplyTransfer/{transferId}/ship
```

Body mới:

```json
{
  "notes": "Xe đã rời kho",
  "evidenceUrls": ["https://.../ship-proof.jpg"]
}
```

Lưu ý rất quan trọng:

- Không gửi `vehicleId`
- Không gửi `vehicleIds`
- Backend chỉ dùng danh sách xe đã gán sẵn trong phiếu

Điều kiện:

- phiếu phải ở `Approved`
- phải có ít nhất 1 assignment đang `Assigned`

Kết quả:

- các assignment `Assigned` chuyển sang `InTransit`
- phiếu chuyển sang `Shipping`
- tồn kho nguồn bị xuất hàng

### 7. Cập nhật trạng thái từng xe

Endpoint:

```http
PATCH /api/SupplyTransfer/{transferId}/vehicles/{supplyTransferVehicleId}/status
```

Body:

```json
{
  "status": 3,
  "note": "Xe đã tới điểm nhận"
}
```

Các transition hợp lệ:

- `Assigned -> InTransit`
- `Assigned -> Incident`
- `InTransit -> Arrived`
- `InTransit -> Incident`
- `Arrived -> Completed`
- `Arrived -> Incident`
- `Incident -> InTransit`

Transition không hợp lệ sẽ bị backend reject.

Quyền cập nhật:

- `InTransit`, `Incident`: source station head
- `Arrived`, `Completed`: destination station head

Khi xe chuyển `Completed`:

- assignment được chốt hoàn tất
- xe đó được trả về `Free`

### 8. Xác nhận nhận hàng toàn phiếu

Endpoint:

```http
PATCH /api/SupplyTransfer/{transferId}/receive
```

Body:

```json
{
  "notes": "Kho đích đã nhận đủ hàng",
  "evidenceUrls": ["https://.../receive-proof.jpg"],
  "items": [
    {
      "supplyItemId": "guid",
      "actualQuantity": 100,
      "notes": "Đủ số lượng"
    }
  ]
}
```

Kết quả:

- phiếu thành `Received`
- kho đích được nhập hàng
- tất cả assignment active còn lại được chốt `Completed`
- tất cả xe active còn lại được trả về `Free`

### 9. Hủy phiếu

Endpoint:

```http
PATCH /api/SupplyTransfer/{transferId}/cancel
```

Body:

```json
{
  "notes": "Hủy do thay đổi kế hoạch điều phối",
  "evidenceUrls": ["https://.../cancel-proof.pdf"]
}
```

Rule mới:

- Không hủy được nếu phiếu đã `Received`
- Hủy được khi phiếu đang `Pending`, `Approved`, hoặc `Shipping` nếu đúng quyền

Khi hủy ở `Pending` hoặc `Approved`:

- assignment active -> `Cancelled`
- xe active -> `Free`

Khi hủy ở `Shipping`:

- assignment active -> `Cancelled`
- xe active -> `Free`
- backend tự tạo transaction hoàn kho nguồn với reason `SupplyTransferReturn`

## Gợi ý FE implementation

- Dialog ship chỉ nên cho:
  - xem danh sách xe đã gán
  - gán thêm xe rảnh
  - bỏ xe đang `Assigned`
  - upload evidence và ship
- Không nên cho FE tự chọn `vehicleId` riêng khi bấm ship.
- Badge trạng thái xe nên map theo `SupplyTransferVehicleStatus`, không dùng `VehicleStatus` ở list assignment.
- Khi refresh chi tiết phiếu, luôn đọc từ `transfer.vehicles[]` làm source of truth.

## Mapping badge đề xuất cho FE

- `Assigned`: Đã gán
- `InTransit`: Đang vận chuyển
- `Arrived`: Đã tới nơi
- `Completed`: Hoàn tất
- `Cancelled`: Đã hủy
- `Incident`: Có sự cố
