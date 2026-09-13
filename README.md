# CASE ROULETTE — CS2-inspired demo

Website demo mở hòm vật phẩm lấy cảm hứng từ hệ thống roulette của CS2.

## Chạy project

Yêu cầu Node.js 18+.

```bash
npm install
npm run dev
```

Sau đó mở địa chỉ Vite hiển thị trong terminal.

Build production:

```bash
npm run build
npm run preview
```

## Tính năng

- React + Vite + JavaScript.
- Weighted random theo 6 độ hiếm.
- Kết quả được chọn **trước** khi animation bắt đầu.
- Roulette chạy từ phải sang trái và dừng tại vật phẩm thắng.
- Hiệu ứng glow theo độ hiếm, vàng/đỏ nổi bật.
- CRUD thêm/sửa/xóa vật phẩm.
- Tìm kiếm và lọc độ hiếm.
- URL ảnh tùy chỉnh, nếu bỏ trống sẽ dùng placeholder.
- Bật/tắt vật phẩm.
- Dữ liệu vật phẩm và lịch sử lưu bằng localStorage.
- Responsive desktop/mobile.
- Không Steam API, không tài khoản, không thanh toán, không backend.

## Lưu ý về tỉ lệ

Weight được xử lý bằng weighted random trên tổng weight của các vật phẩm đang bật. Vì vậy nếu nhiều vật phẩm cùng rarity đều có weight 79.92 thì **tỉ lệ đó áp dụng cho từng vật phẩm**, không phải toàn bộ nhóm rarity.

Nếu muốn tỉ lệ rarity đúng theo 6 cấp độ, cách chuẩn là đặt tổng weight của các vật phẩm trong từng nhóm bằng đúng tỷ lệ rarity mong muốn, hoặc triển khai 2 bước: random rarity trước rồi random item trong rarity.

Demo hiện tại giữ form CRUD đơn giản để dễ chỉnh sửa.