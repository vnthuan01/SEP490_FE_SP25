# Giải thích nghiệp vụ plan-summary cho Coordinator

## 1. Plan-summary là gì?

`plan-summary` là lớp **tổng hợp kế hoạch cứu trợ ở cấp chiến dịch**.

Nó không đi sâu vào từng thành viên đang làm gì, mà trả lời các câu hỏi ở tầm điều phối:

- Toàn chiến dịch hiện có bao nhiêu hộ?
- Bao nhiêu hộ còn chờ giao, bao nhiêu hộ cô lập?
- Nên cần khoảng bao nhiêu đội cứu trợ, bao nhiêu người, bao nhiêu xuồng/ghe, áo phao?
- Nên ưu tiên mở điểm phát hay dùng đội cơ động?
- Khu vực nào cần ưu tiên xử lý trước?

Nói ngắn gọn:

- `plan-summary` = **lớp phân tích chiến dịch**
- `campaign task / subtask / delivery` = **lớp thực thi theo đội và theo người**

---

## 2. Plan-summary đang lấy dữ liệu từ đâu?

Backend hiện tính `plan-summary` chủ yếu từ các nguồn sau:

- `CampaignHouseholds`: danh sách hộ dân thuộc chiến dịch
- `DistributionPoints`: các điểm phát trong chiến dịch
- `HouseholdDeliveries`: các lượt giao hàng cho từng hộ
- `Location`: dữ liệu vị trí/mật độ dân cư

Từ các dữ liệu đó, hệ thống suy ra:

- tổng số hộ
- tổng dân số
- số hộ cô lập
- số hộ chưa hoàn thành giao cứu trợ
- mật độ dân cư trung bình
- gợi ý số đội, số nhân lực, số xuồng, số áo phao, số gói cứu trợ

---

## 3. Các nhóm thông tin chính của plan-summary

### 3.1. Tổng quan chiến dịch

Các số liệu đầu tiên dùng để coordinator nắm nhanh quy mô chiến dịch:

- `TotalHouseholds`: tổng số hộ trong chiến dịch
- `IsolatedHouseholds`: số hộ cô lập
- `TotalPopulation`: tổng dân số ước tính
- `PendingHouseholds`: số hộ chưa giao xong

Đây là lớp nhìn tổng thể để biết trạm/campaign đang “to hay nhỏ”, “căng hay chưa”.

### 3.2. Gợi ý nguồn lực

Hệ thống ước lượng các nhu cầu cơ bản:

- `SuggestedTeamCount`: số đội cứu trợ gợi ý
- `EstimatedReliefPersonnel`: số nhân lực cứu trợ gợi ý
- `EstimatedLocalVolunteers`: số TNV địa phương cần hỗ trợ
- `EstimatedBoatCount`: số xuồng/ghe gợi ý
- `EstimatedLifeJacketCount`: số áo phao gợi ý

Mục tiêu là để coordinator biết:

- đang thiếu người hay không
- đang thiếu phương tiện đường nước hay không
- cần tăng đội cơ động hay mở thêm điểm phát

### 3.3. Phân rã theo khu vực

Plan-summary chia campaign ra các cụm/khu vực để điều phối thực tế:

- khu nào đông hộ
- khu nào nhiều hộ cô lập
- khu nào nên mở điểm phát
- khu nào nên dùng đội cơ động giao tận nơi

Mỗi khu vực sẽ có các số gợi ý như:

- số hộ
- số dân
- số hộ cô lập
- bán kính bao phủ ước tính
- số đội gợi ý
- số điểm phát gợi ý
- số đội cơ động gợi ý

### 3.4. Danh sách hộ cô lập

Đây là phần rất quan trọng cho coordinator, vì các hộ cô lập thường là nhóm ưu tiên cao nhất.

Plan-summary cho biết:

- hộ nào cô lập
- quy mô hộ
- có cần xuồng không
- có cần người địa phương dẫn đường không
- mức ưu tiên xử lý

### 3.5. Phân tích theo điểm phát

Nếu chiến dịch đang dùng mô hình pickup / phát tại điểm, hệ thống cũng tổng hợp:

- mỗi điểm phát đang ôm bao nhiêu hộ
- còn bao nhiêu lượt giao pending
- cần bao nhiêu người đứng điểm

---

## 4. Plan-summary KHÔNG thay thế task/subtask

Đây là điểm rất hay bị nhầm.

Plan-summary chỉ trả lời:

- chiến dịch nên tổ chức như thế nào
- khu nào ưu tiên hơn
- cần bao nhiêu nguồn lực

Nhưng nó **không trả lời trực tiếp**:

- Team A đang có task nào?
- Task nào bị chặn?
- Subtask nào đang làm?
- Thành viên nào đang giao hộ nào?
- Hộ đó đã giao món gì, còn thiếu món gì?

Những thứ đó phải đi qua lớp:

- `CampaignTask`
- `MemberTask`
- `MemberTaskDelivery`
- `HouseholdDelivery`

---

## 5. Cách hiểu đúng trong dashboard coordinator

Để dashboard coordinator “bao quát đúng”, nên hiểu thành 2 tầng:

### Tầng 1 - Phân tích chiến dịch

Dùng `plan-summary` để hiển thị:

- quy mô chiến dịch
- hộ cô lập
- hộ pending
- nhân lực / phương tiện / gói cứu trợ gợi ý
- khu vực ưu tiên

### Tầng 2 - Thực thi của đội

Dùng endpoint task/subtask/delivery để hiển thị:

- đội nào đang làm campaign nào
- task nào đang mở
- subtask nào đang chạy
- có bao nhiêu hộ đang được team xử lý
- đã giao gì / còn thiếu gì

Nói cách khác:

- `plan-summary` = **phân tích để ra quyết định**
- `relief-team-task-summary` = **theo dõi thực thi để điều phối hàng ngày**

---

## 6. Ý nghĩa thực tế cho coordinator

Khi nhìn dashboard, coordinator nên dùng như sau:

1. Nhìn `plan-summary` để biết campaign đang nặng ở đâu, thiếu cái gì
2. Nhìn `Nhiệm vụ cứu trợ theo đội` để biết team nào đang ôm việc gì
3. Nhìn `Giao cứu trợ` để biết từng hộ đã giao gì / còn thiếu gì
4. Nhìn `Tải đội` để cân lại nhân lực giữa cứu hộ và cứu trợ
5. Nhìn `Hiệu suất xe` để biết phương tiện nào đang quá tải

---

## 7. Tóm tắt một câu

`plan-summary` là bản đồ chiến lược của chiến dịch cứu trợ; còn task/subtask/delivery là lớp vận hành thực tế để coordinator bám và điều phối mỗi ngày.
