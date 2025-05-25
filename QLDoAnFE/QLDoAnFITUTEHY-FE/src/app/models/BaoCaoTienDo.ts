import { DeTai } from './DeTai'; 
import { GiangVien } from './GiangVien'; 
import { SinhVien } from './SinhVien'; 

export interface BaoCaoTienDo {
  maBaoCao: string;
  maDeTai: string; 
  deTai?: DeTai; 

  tuanBaoCao: number;
  ngayBaoCao: Date; 
  noiDungBaoCao: string;
  tepDinhKem?: string | null;

  trangThai: string;
  nhanXetCuaGV?: string; 
  diemSo?: number; 
  ngayDuyet?: Date; 
}