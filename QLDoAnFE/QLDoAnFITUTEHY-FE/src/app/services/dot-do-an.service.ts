// src/app/services/dot-do-an.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DotDoAn, DotDoAnForManipulation } from '../models/DotDoAn';
import { Lop } from '../models/Lop'; // Giả sử Lop model đã tồn tại
import { GiangVien } from '../models/GiangVien'; // Giả sử GiangVien model đã tồn tại
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DotDoAnService {

  constructor(private apiService: ApiService) { }

  // Lấy tất cả Đợt Đồ Án (bao gồm các lớp và giảng viên liên quan)
  // Endpoint: GET /api/DotDoAn
  getAllDotDoAn(): Observable<DotDoAn[]> {
    return this.apiService.get<DotDoAn[]>(`DotDoAn`);
  }

  // Lấy Đợt Đồ Án theo ID (bao gồm các lớp và giảng viên liên quan)
  // Endpoint: GET /api/DotDoAn/{id}
  getDotDoAnById(id: string): Observable<DotDoAn> {
    return this.apiService.get<DotDoAn>(`DotDoAn/${id}`);
  }

  // Thêm mới Đợt Đồ Án
  // Endpoint: POST /api/DotDoAn
  addDotDoAn(dotDoAn: DotDoAnForManipulation): Observable<DotDoAn> {
    return this.apiService.post<DotDoAn>(`DotDoAn`, dotDoAn);
  }

  // Cập nhật Đợt Đồ Án
  // Endpoint: PUT /api/DotDoAn/{id}
  updateDotDoAn(maDotDoAn: string, dotDoAn: DotDoAnForManipulation): Observable<DotDoAn> {
    return this.apiService.put<DotDoAn>(`DotDoAn/${maDotDoAn}`, dotDoAn);
  }

  // Xóa Đợt Đồ Án
  // Endpoint: DELETE /api/DotDoAn/{id}
  deleteDotDoAn(maDotDoAn: string): Observable<any> {
    return this.apiService.delete<any>(`DotDoAn/${maDotDoAn}`);
  }

  // --- Các hàm lấy danh sách cho dropdown (có thể đặt trong LopService/GiangVienService riêng) ---
  getAllLops(): Observable<Lop[]> {
    return this.apiService.get<Lop[]>(`Lop`); // Giả sử có API /api/Lop
  }

  getAllGiangViens(): Observable<GiangVien[]> {
    return this.apiService.get<GiangVien[]>(`GiangVien`); // Giả sử có API /api/GiangVien
  }
}