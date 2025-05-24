// src/app/services/bo-mon.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BoMon } from '../models/BoMon'; // Đảm bảo đường dẫn này đúng
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class BoMonService {

  constructor(private apiService: ApiService) { }

  // Lấy tất cả Bộ Môn hoặc tìm kiếm Bộ Môn theo từ khóa
  // Tương tự như searchKhoa trong KhoaService
  // Endpoint: GET /api/BoMon (hoặc /api/BoMon?term=...)
  searchBoMon(term: string = ''): Observable<BoMon[]> {
    if (term) {
      // Giả định API của bạn có endpoint tìm kiếm hoặc filter trên GET /api/BoMon
      return this.apiService.get<BoMon[]>(`BoMon?term=${term}`);
    }
    return this.apiService.get<BoMon[]>(`BoMon`);
  }

  // Lấy Bộ Môn theo ID
  // Endpoint: GET /api/BoMon/{id}
  getBoMonById(id: string): Observable<BoMon> {
    return this.apiService.get<BoMon>(`BoMon/${id}`);
  }

  // Thêm mới Bộ Môn
  // Endpoint: POST /api/BoMon
  addBoMon(boMon: BoMon): Observable<BoMon> {
    return this.apiService.post<BoMon>(`BoMon`, boMon);
  }

  // Cập nhật Bộ Môn
  // Endpoint: PUT /api/BoMon/{id}
  updateBoMon(maBoMon: string, boMon: BoMon): Observable<BoMon> {
    return this.apiService.put<BoMon>(`BoMon/${maBoMon}`, boMon);
  }

  // Xóa Bộ Môn
  // Endpoint: DELETE /api/BoMon/{id}
  deleteBoMon(maBoMon: string): Observable<any> {
    return this.apiService.delete<any>(`BoMon/${maBoMon}`);
  }

  // Lấy các Bộ Môn theo Khoa ID
  // Endpoint: GET /api/BoMon/khoa/{khoaId}
  getBoMonByKhoaId(khoaId: string): Observable<BoMon[]> {
    return this.apiService.get<BoMon[]>(`BoMon/khoa/${khoaId}`);
  }
}