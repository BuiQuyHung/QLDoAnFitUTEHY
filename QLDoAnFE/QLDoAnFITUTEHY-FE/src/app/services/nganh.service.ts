import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Nganh } from '../models/Nganh';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class NganhService {

  constructor(private apiService: ApiService) { }

  // Lấy tất cả Ngành hoặc tìm kiếm Ngành theo từ khóa
  // Endpoint: GET /api/Nganh (hoặc /api/Nganh?term=...)
  searchNganh(term: string = ''): Observable<Nganh[]> {
    if (term) {
      // Giả định API của bạn có endpoint tìm kiếm hoặc filter trên GET /api/Nganh
      return this.apiService.get<Nganh[]>(`Nganh?term=${term}`);
    }
    return this.apiService.get<Nganh[]>(`Nganh`);
  }

  // Lấy Ngành theo ID
  // Endpoint: GET /api/Nganh/{id}
  getNganhById(id: string): Observable<Nganh> {
    return this.apiService.get<Nganh>(`Nganh/${id}`);
  }

  // Thêm mới Ngành
  // Endpoint: POST /api/Nganh
  addNganh(nganh: Nganh): Observable<Nganh> {
    return this.apiService.post<Nganh>(`Nganh`, nganh);
  }

  // Cập nhật Ngành
  // Endpoint: PUT /api/Nganh/{id}
  updateNganh(maNganh: string, nganh: Nganh): Observable<Nganh> {
    return this.apiService.put<Nganh>(`Nganh/${maNganh}`, nganh);
  }

  // Xóa Ngành
  // Endpoint: DELETE /api/Nganh/{id}
  deleteNganh(maNganh: string): Observable<any> {
    return this.apiService.delete<any>(`Nganh/${maNganh}`);
  }

  // Lấy các Ngành theo Bộ Môn ID
  // Endpoint: GET /api/Nganh/bomon/{boMonId}
  getNganhByBoMonId(boMonId: string): Observable<Nganh[]> {
    return this.apiService.get<Nganh[]>(`Nganh/bomon/${boMonId}`);
  }
}