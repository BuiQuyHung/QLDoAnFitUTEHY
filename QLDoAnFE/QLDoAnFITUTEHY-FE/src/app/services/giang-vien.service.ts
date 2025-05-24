import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GiangVien } from '../models/GiangVien';
import { ApiService } from './api.service'; 

@Injectable({
  providedIn: 'root'
})
export class GiangVienService {

  constructor(private apiService: ApiService) { }

  // Lấy tất cả Giảng Viên hoặc tìm kiếm theo từ khóa
  // Endpoint: GET /api/GiangVien (hoặc /api/GiangVien?term=...)
  searchGiangVien(term: string = ''): Observable<GiangVien[]> {
    if (term) {
      // Giả định API của bạn có endpoint tìm kiếm hoặc filter trên GET /api/GiangVien
      return this.apiService.get<GiangVien[]>(`GiangVien?term=${term}`);
    }
    return this.apiService.get<GiangVien[]>(`GiangVien`);
  }

  // Lấy Giảng Viên theo ID
  // Endpoint: GET /api/GiangVien/{id}
  getGiangVienById(id: string): Observable<GiangVien> {
    return this.apiService.get<GiangVien>(`GiangVien/${id}`);
  }

  // Thêm mới Giảng Viên
  // Endpoint: POST /api/GiangVien
  addGiangVien(giangVien: GiangVien): Observable<GiangVien> {
    return this.apiService.post<GiangVien>(`GiangVien`, giangVien);
  }

  // Cập nhật Giảng Viên
  // Endpoint: PUT /api/GiangVien/{id}
  updateGiangVien(maGV: string, giangVien: GiangVien): Observable<GiangVien> {
    return this.apiService.put<GiangVien>(`GiangVien/${maGV}`, giangVien);
  }

  // Xóa Giảng Viên
  // Endpoint: DELETE /api/GiangVien/{id}
  deleteGiangVien(maGV: string): Observable<any> {
    return this.apiService.delete<any>(`GiangVien/${maGV}`);
  }

  // Lấy các Giảng Viên theo Chuyên Ngành
  // Endpoint: GET /api/GiangVien/chuyennganh/{chuyenNganh}
  getGiangVienByChuyenNganh(chuyenNganh: string): Observable<GiangVien[]> {
    return this.apiService.get<GiangVien[]>(`GiangVien/chuyennganh/${chuyenNganh}`);
  }
}
