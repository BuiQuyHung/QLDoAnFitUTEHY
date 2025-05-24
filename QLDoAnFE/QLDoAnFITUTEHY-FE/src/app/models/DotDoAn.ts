// src/app/models/dot-do-an.model.ts
import { Lop } from './Lop'; // Đảm bảo đường dẫn này đúng
import { GiangVien } from './GiangVien'; // Đảm bảo đường dẫn này đúng

export interface DotDoAn {
  maDotDoAn: string;
  tenDotDoAn: string;
  khoaHoc: string;
  ngayBatDau: Date; // Hoặc string nếu bạn muốn xử lý ngày dạng string
  ngayKetThuc?: Date; // Tùy chọn, nếu có
  soTuanThucHien: number;
  trangThai?: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'CANCELLED';
  
  // Navigation properties cho mối quan hệ nhiều-nhiều
  dsLop?: Lop[]; // Danh sách các lớp tham gia (chỉ dùng khi GET)
  dsGiangVien?: GiangVien[]; // Danh sách các giảng viên (chỉ dùng khi GET)
}

// DTO cho việc tạo mới/cập nhật (sẽ gửi lên backend)
export interface DotDoAnForManipulation {
  maDotDoAn: string;
  tenDotDoAn: string;
  khoaHoc: string;
  ngayBatDau: string; // Gửi dạng string (YYYY-MM-DD)
  ngayKetThuc?: String;
  soTuanThucHien: number;
  lopIds: string[];      // Chỉ gửi mảng MaLop
  giangVienIds: string[]; // Chỉ gửi mảng MaGV
}