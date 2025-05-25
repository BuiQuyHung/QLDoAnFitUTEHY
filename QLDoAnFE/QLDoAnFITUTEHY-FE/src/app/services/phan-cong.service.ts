// src/app/services/phan-cong.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PhanCong } from '../models/PhanCong';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PhanCongService {

  constructor(private apiService: ApiService) { }

  // Lấy tất cả phân công
  // Endpoint: GET /api/PhanCong
  getAllPhanCong(): Observable<PhanCong[]> {
    return this.apiService.get<PhanCong[]>(`PhanCong`);
  }

  // Lấy phân công theo MaDeTai và MaSV (khóa chính kép)
  // Endpoint: GET /api/PhanCong/{maDeTai}/{maSV}
  getPhanCongById(maDeTai: string, maSV: string): Observable<PhanCong> {
    return this.apiService.get<PhanCong>(`PhanCong/${maDeTai}/${maSV}`);
  }

  // Thêm mới Phân Công
  // Endpoint: POST /api/PhanCong
  addPhanCong(phanCong: PhanCong): Observable<PhanCong> {
    return this.apiService.post<PhanCong>(`PhanCong`, phanCong);
  }

  // Cập nhật Phân Công
  // Endpoint: PUT /api/PhanCong/{maDeTai}/{maSV}
  updatePhanCong(maDeTai: string, maSV: string, phanCong: PhanCong): Observable<PhanCong> {
    return this.apiService.put<PhanCong>(`PhanCong/${maDeTai}/${maSV}`, phanCong);
  }

  // Xóa Phân Công
  // Endpoint: DELETE /api/PhanCong/{maDeTai}/{maSV}
  deletePhanCong(maDeTai: string, maSV: string): Observable<any> {
    return this.apiService.delete<any>(`PhanCong/${maDeTai}/${maSV}`);
  }

  // Lấy phân công theo ID Đề tài
  // Endpoint: GET /api/PhanCong/detai/{deTaiId}
  getPhanCongByDeTaiId(deTaiId: string): Observable<PhanCong[]> {
    return this.apiService.get<PhanCong[]>(`PhanCong/detai/${deTaiId}`);
  }

  // Lấy phân công theo ID Sinh viên
  // Endpoint: GET /api/PhanCong/sinhvien/{svId}
  getPhanCongBySinhVienId(svId: string): Observable<PhanCong[]> {
    return this.apiService.get<PhanCong[]>(`PhanCong/sinhvien/${svId}`);
  }

  // Lấy phân công theo ID Đợt Đồ án
  // Endpoint: GET /api/PhanCong/dotdoan/{dotDoAnId}
  getPhanCongByDotDoAnId(dotDoAnId: string): Observable<PhanCong[]> {
    return this.apiService.get<PhanCong[]>(`PhanCong/dotdoan/${dotDoAnId}`);
  }
}