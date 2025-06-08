import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaoCaoTienDo } from '../models/BaoCaoTienDo';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class BaoCaoTienDoService {
  constructor(private apiService: ApiService) {}

  getAllBaoCaoTienDo(): Observable<BaoCaoTienDo[]> {
    return this.apiService.get<BaoCaoTienDo[]>(`BaoCaoTienDo`);
  }

  getBaoCaoTienDoById(id: number): Observable<BaoCaoTienDo> {
    return this.apiService.get<BaoCaoTienDo>(`BaoCaoTienDo/${id}`);
  }

  addBaoCaoTienDo(baoCao: BaoCaoTienDo): Observable<BaoCaoTienDo> {
    return this.apiService.post<BaoCaoTienDo>(`BaoCaoTienDo`, baoCao);
  }

  updateBaoCaoTienDo(
    id: number,
    baoCao: BaoCaoTienDo
  ): Observable<BaoCaoTienDo> {
    return this.apiService.put<BaoCaoTienDo>(`BaoCaoTienDo/${id}`, baoCao);
  }

  deleteBaoCaoTienDo(id: number): Observable<any> {
    return this.apiService.delete<any>(`BaoCaoTienDo/${id}`);
  }

  getBaoCaoBySinhVienAndDeTai(
    maSV: string,
    maDeTai: string
  ): Observable<BaoCaoTienDo[]> {
    return this.apiService.get<BaoCaoTienDo[]>(
      `BaoCaoTienDo/sinhvien/${maSV}/detai/${maDeTai}`
    );
  }

  getBaoCaoByGiangVien(maGV: string): Observable<BaoCaoTienDo[]> {
    return this.apiService.get<BaoCaoTienDo[]>(
      `BaoCaoTienDo/giangvien/${maGV}`
    );
  }

  danhGiaBaoCaoTienDo(
    id: number,
    danhGiaData: { nhanXetCuaGV: string; diemSo: number; trangThai: string }
  ): Observable<any> {
    return this.apiService.put<any>(`BaoCaoTienDo/${id}/danhgia`, danhGiaData);
  }

  uploadFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.apiService.post<string>(`BaoCaoTienDo/UploadFile`, formData);
  }
}
