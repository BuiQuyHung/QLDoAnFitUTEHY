import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Khoa } from '../models/Khoa';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class KhoaService {

  constructor(private apiService: ApiService) { }

  // Lấy tất cả Khoa hoặc tìm kiếm Khoa
  searchKhoa(term: string = ''): Observable<Khoa[]> {
    if (term) {
      return this.apiService.get<Khoa[]>(`Khoa?term=${term}`); 
    }
    return this.apiService.get<Khoa[]>(`Khoa`);
  }

  // Lấy Khoa theo ID
  getKhoaById(id: string): Observable<Khoa> {
    return this.apiService.get<Khoa>(`Khoa/${id}`); 
  }

  // Thêm mới Khoa
  addKhoa(khoa: Khoa): Observable<Khoa> {
    return this.apiService.post<Khoa>(`Khoa`, khoa);
  }

  // Cập nhật Khoa
  updateKhoa(maKhoa: string, khoa: Khoa): Observable<Khoa> {
    return this.apiService.put<Khoa>(`Khoa/${maKhoa}`, khoa);
  }

  // Xóa Khoa
  deleteKhoa(maKhoa: string): Observable<any> {
    return this.apiService.delete<any>(`Khoa/${maKhoa}`);
  }
}