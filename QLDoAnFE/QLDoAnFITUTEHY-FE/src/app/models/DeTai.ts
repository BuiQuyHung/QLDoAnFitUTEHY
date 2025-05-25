import { GiangVien } from './GiangVien'; 
import { DotDoAn } from './DotDoAn';   
import { SinhVien } from './SinhVien';   

export interface DeTai {
  maDeTai: string;
  tenDeTai: string;
  moTa?: string;
  maGV?: string; 
  giangVien?: GiangVien; 

  maDotDoAn?: string; 
  dotDoAn?: DotDoAn;   

  maSV?: string; 
  sinhVien?: SinhVien; 

  trangThaiDangKy: string; 
}