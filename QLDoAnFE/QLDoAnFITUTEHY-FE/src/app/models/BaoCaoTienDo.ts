import { DeTai } from './DeTai';
import { GiangVien } from './GiangVien';
import { SinhVien } from './SinhVien';

export interface BaoCaoTienDo {
  maBaoCao?: number | null; 
  maDeTai: string;
  maSV: string;
  ngayNop?: Date | null;
  tuanBaoCao: number;
  loaiBaoCao: string;
  tepDinhKem?: string | null; 
  ghiChuCuaSV?: string | null; 
  maGV?: string | null; 
  ngayNhanXet?: Date | null; 
  nhanXetCuaGV?: string | null; 
  diemSo?: number | null;
  trangThai?: string | null; 
}
export interface DanhGiaBaoCaoPayload {
  diemSo: number;
  nhanXetCuaGV: string;
  trangThai: string;
}