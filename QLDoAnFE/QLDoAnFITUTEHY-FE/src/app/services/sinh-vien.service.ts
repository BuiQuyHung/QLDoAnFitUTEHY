// src/app/services/sinh-vien.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SinhVien } from '../models/SinhVien';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class SinhVienService {

  constructor(private apiService: ApiService) { }

  // Lấy tất cả SinhVien hoặc tìm kiếm SinhVien theo từ khóa
  // Endpoint: GET /api/SinhVien (hoặc /api/SinhVien?term=...)
  searchSinhVien(term: string = ''): Observable<SinhVien[]> {
    if (term) {
      // Giả định API của bạn có endpoint tìm kiếm hoặc filter trên GET /api/SinhVien
      return this.apiService.get<SinhVien[]>(`SinhVien?term=${term}`);
    }
    return this.apiService.get<SinhVien[]>(`SinhVien`);
  }

  // Lấy SinhVien theo ID
  // Endpoint: GET /api/SinhVien/{id}
  getSinhVienById(id: string): Observable<SinhVien> {
    return this.apiService.get<SinhVien>(`SinhVien/${id}`);
  }

  // Thêm mới SinhVien
  // Endpoint: POST /api/SinhVien
  addSinhVien(sinhVien: SinhVien): Observable<SinhVien> {
    return this.apiService.post<SinhVien>(`SinhVien`, sinhVien);
  }

  // Cập nhật SinhVien
  // Endpoint: PUT /api/SinhVien/{id}
  updateSinhVien(maSV: string, sinhVien: SinhVien): Observable<SinhVien> {
    return this.apiService.put<SinhVien>(`SinhVien/${maSV}`, sinhVien);
  }

  // Xóa SinhVien
  // Endpoint: DELETE /api/SinhVien/{id}
  deleteSinhVien(maSV: string): Observable<any> {
    return this.apiService.delete<any>(`SinhVien/${maSV}`);
  }

  // Lấy các Sinh Viên theo Lớp ID
  // Endpoint: GET /api/SinhVien/lop/{lopId}
  getSinhVienByLopId(lopId: string): Observable<SinhVien[]> {
    return this.apiService.get<SinhVien[]>(`SinhVien/lop/${lopId}`);
  }
}