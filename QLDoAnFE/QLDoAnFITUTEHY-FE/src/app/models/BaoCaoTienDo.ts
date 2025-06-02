import { DeTai } from './DeTai';
import { GiangVien } from './GiangVien';
import { SinhVien } from './SinhVien';

export interface BaoCaoTienDo {
  maBaoCao?: number | null; // Có thể null nếu chưa được gán ID từ backend, hoặc là undefined
  maDeTai: string;
  maSV: string;
  ngayNop?: Date | null; // Có thể null nếu không có giá trị
  tuanBaoCao: number;
  loaiBaoCao: string;
  tepDinhKem?: string | null; // Có thể null
  ghiChuCuaSV?: string | null; // Có thể null
  maGV?: string | null; // Có thể null
  ngayNhanXet?: Date | null; // Có thể null
  nhanXetCuaGV?: string | null; // Có thể null
  diemSo?: number | null; // Có thể null
  trangThai?: string | null; // Có thể null
}