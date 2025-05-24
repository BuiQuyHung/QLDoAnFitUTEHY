// src/app/services/lop.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Lop } from '../models/Lop';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class LopService {

  constructor(private apiService: ApiService) { }

  // Lấy tất cả Lop hoặc tìm kiếm Lop theo từ khóa
  // Endpoint: GET /api/Lop (hoặc /api/Lop?term=...)
  searchLop(term: string = ''): Observable<Lop[]> {
    if (term) {
      // Giả định API của bạn có endpoint tìm kiếm hoặc filter trên GET /api/Lop
      return this.apiService.get<Lop[]>(`Lop?term=${term}`);
    }
    return this.apiService.get<Lop[]>(`Lop`);
  }

  // Lấy Lop theo ID
  // Endpoint: GET /api/Lop/{id}
  getLopById(id: string): Observable<Lop> {
    return this.apiService.get<Lop>(`Lop/${id}`);
  }

  // Thêm mới Lop
  // Endpoint: POST /api/Lop
  addLop(lop: Lop): Observable<Lop> {
    return this.apiService.post<Lop>(`Lop`, lop);
  }

  // Cập nhật Lop
  // Endpoint: PUT /api/Lop/{id}
  updateLop(maLop: string, lop: Lop): Observable<Lop> {
    return this.apiService.put<Lop>(`Lop/${maLop}`, lop);
  }

  // Xóa Lop
  // Endpoint: DELETE /api/Lop/{id}
  deleteLop(maLop: string): Observable<any> {
    return this.apiService.delete<any>(`Lop/${maLop}`);
  }

  // Lấy các Lớp theo ChuyenNganh ID
  // Endpoint: GET /api/Lop/chuyennganh/{chuyenNganhId}
  getLopByChuyenNganhId(chuyenNganhId: string): Observable<Lop[]> {
    return this.apiService.get<Lop[]>(`Lop/chuyennganh/${chuyenNganhId}`);
  }
}