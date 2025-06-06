import { Lop } from './Lop'; 
import { GiangVien } from './GiangVien'; 

export interface DotDoAn {
  maDotDoAn: string;
  tenDotDoAn: string;
  khoaHoc: string;
  ngayBatDau?: Date | string | null;
  ngayKetThuc?: Date | string | null;
  soTuanThucHien: number;
  trangThai?: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'CANCELLED';
  dsLop?: Lop[]; 
  dsGiangVien?: GiangVien[]; 
}

export interface DotDoAnForManipulation {
  maDotDoAn: string;
  tenDotDoAn: string;
  khoaHoc: string;
  ngayBatDau: string; 
  ngayKetThuc?: string; 
  soTuanThucHien: number;
  lopIds: string[];      
  giangVienIds: string[]; 
}