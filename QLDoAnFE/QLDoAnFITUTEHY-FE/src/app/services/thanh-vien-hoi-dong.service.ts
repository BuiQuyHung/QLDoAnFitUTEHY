// src/app/services/thanh-vien-hoi-dong.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ThanhVienHoiDong } from '../models/ThanhVienHoiDong'; // Đảm bảo đường dẫn đúng
import { ApiService } from './api.service'; // Đảm bảo đường dẫn đúng

@Injectable({
  providedIn: 'root'
})
export class ThanhVienHoiDongService {

  constructor(private apiService: ApiService) { }

  getAllThanhVienHoiDong(): Observable<ThanhVienHoiDong[]> {
    return this.apiService.get<ThanhVienHoiDong[]>(`ThanhVienHoiDong`);
  }

  getThanhVienHoiDongById(maHoiDong: string, maGV: string): Observable<ThanhVienHoiDong> {
    return this.apiService.get<ThanhVienHoiDong>(`ThanhVienHoiDong/${maHoiDong}/${maGV}`);
  }

  addThanhVienHoiDong(thanhVien: ThanhVienHoiDong): Observable<ThanhVienHoiDong> {
    return this.apiService.post<ThanhVienHoiDong>(`ThanhVienHoiDong`, thanhVien);
  }

  updateThanhVienHoiDong(maHoiDong: string, maGV: string, thanhVien: ThanhVienHoiDong): Observable<ThanhVienHoiDong> {
    return this.apiService.put<ThanhVienHoiDong>(`ThanhVienHoiDong/${maHoiDong}/${maGV}`, thanhVien);
  }

  deleteThanhVienHoiDong(maHoiDong: string, maGV: string): Observable<any> {
    return this.apiService.delete<any>(`ThanhVienHoiDong/${maHoiDong}/${maGV}`);
  }

  getThanhVienHoiDongByHoiDongId(maHoiDong: string): Observable<ThanhVienHoiDong[]> {
    return this.apiService.get<ThanhVienHoiDong[]>(`ThanhVienHoiDong/hoidong/${maHoiDong}`);
  }

  getThanhVienHoiDongByGiangVienId(maGV: string): Observable<ThanhVienHoiDong[]> {
    return this.apiService.get<ThanhVienHoiDong[]>(`ThanhVienHoiDong/giangvien/${maGV}`);
  }
}
