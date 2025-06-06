import { GiangVien } from './GiangVien'; 
import { DotDoAn } from './DotDoAn';   
import { SinhVien } from './SinhVien';   

export interface DeTai {
  maDeTai: string;
  tenDeTai: string;
  moTa?: string;
  maGV?: string; 
  hoTenGV?: string; 
  giangVien?: GiangVien; 
  maDotDoAn?: string; 
  tenDotDoAn?: string; 
  dotDoAn?: DotDoAn;   
  maSV?: string; 
  hoTenSV?: string;
  sinhVien?: SinhVien; 
  trangThaiDangKy: string; 
}