// src/app/services/de-tai.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DeTai } from '../models/DeTai';
import { DotDoAn } from '../models/DotDoAn';
import { GiangVien } from '../models/GiangVien';
import { SinhVien } from '../models/SinhVien';

@Injectable({
  providedIn: 'root'
})
export class DeTaiService {

  constructor(private apiService: ApiService) { }

  getDeTais(): Observable<DeTai[]> {
    return this.apiService.get<DeTai[]>(`DeTai`);
  }

  getDeTaiById(id: string): Observable<DeTai> {
    return this.apiService.get<DeTai>(`DeTai/${id}`);
  }

  addDeTai(deTai: DeTai): Observable<DeTai> {
    return this.apiService.post<DeTai>(`DeTai`, deTai);
  }

  updateDeTai(maDeTai: string, deTai: DeTai): Observable<any> {
    return this.apiService.put<any>(`DeTai/${maDeTai}`, deTai);
  }

  deleteDeTai(maDeTai: string): Observable<any> {
    return this.apiService.delete<any>(`DeTai/${maDeTai}`);
  }

  // Phương thức MỚI: Lấy danh sách đề tài theo ID giảng viên hướng dẫn
  // Bạn cần có endpoint hỗ trợ ở backend: GET /api/DeTai/ByGiangVien/{maGiangVien}
  getDeTaisByGiangVienId(maGiangVien: string): Observable<DeTai[]> {
    return this.apiService.get<DeTai[]>(`DeTai/ByGiangVien/${maGiangVien}`);
  }

  // Phương thức MỚI: Lấy danh sách đề tài theo ID sinh viên
  // Bạn cần có endpoint hỗ trợ ở backend: GET /api/DeTai/BySinhVien/{maSinhVien}
  getDeTaisBySinhVienId(maSinhVien: string): Observable<DeTai[]> {
    return this.apiService.get<DeTai[]>(`DeTai/BySinhVien/${maSinhVien}`);
  }

  // (Optional) Các phương thức khác để gán SV/GV cho đề tài nếu cần
  assignGiangVienToDeTai(maDeTai: string, maGiangVien: string): Observable<any> {
    // Giả định API endpoint: PUT /api/DeTai/{maDeTai}/AssignGiangVien/{maGiangVien}
    return this.apiService.put<any>(`DeTai/${maDeTai}/AssignGiangVien/${maGiangVien}`, {});
  }

  assignSinhVienToDeTai(maDeTai: string, maSinhVien: string): Observable<any> {
    // Giả định API endpoint: PUT /api/DeTai/{maDeTai}/AssignSinhVien/{maSinhVien}
    return this.apiService.put<any>(`DeTai/${maDeTai}/AssignSinhVien/${maSinhVien}`, {});
  }

  getDeTaisByDotDoAnId(dotDoAnId: string): Observable<DeTai[]> {
    return this.apiService.get<DeTai[]>(`DeTai/ByDotDoAn/${dotDoAnId}`);
  }
}