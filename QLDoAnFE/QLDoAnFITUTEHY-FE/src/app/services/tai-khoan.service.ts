import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TaiKhoan, LoginResponse } from '../models/TaiKhoan'; 
import { ApiService } from './api.service'; 

@Injectable({
  providedIn: 'root'
})
export class TaiKhoanService {

  constructor(private apiService: ApiService) { }

  // Lấy tất cả Tài Khoản
  // Endpoint: GET /api/TaiKhoan
  getAllTaiKhoan(): Observable<TaiKhoan[]> {
    return this.apiService.get<TaiKhoan[]>(`TaiKhoan`);
  }

  // Lấy Tài Khoản theo Tên Đăng Nhập
  // Endpoint: GET /api/TaiKhoan/{username}
  getTaiKhoanByUsername(username: string): Observable<TaiKhoan> {
    return this.apiService.get<TaiKhoan>(`TaiKhoan/${username}`);
  }

  // Thêm mới Tài Khoản
  // Endpoint: POST /api/TaiKhoan
  addTaiKhoan(taiKhoan: TaiKhoan): Observable<TaiKhoan> {
    return this.apiService.post<TaiKhoan>(`TaiKhoan`, taiKhoan);
  }

  // Cập nhật Tài Khoản
  // Endpoint: PUT /api/TaiKhoan/{username}
  updateTaiKhoan(username: string, taiKhoan: TaiKhoan): Observable<TaiKhoan> {
    return this.apiService.put<TaiKhoan>(`TaiKhoan/${username}`, taiKhoan);
  }

  // Xóa Tài Khoản
  // Endpoint: DELETE /api/TaiKhoan/{username}
  deleteTaiKhoan(username: string): Observable<any> {
    return this.apiService.delete<any>(`TaiKhoan/${username}`);
  }

  // Đăng nhập
  // Endpoint: POST /api/TaiKhoan/login
  login(credentials: { tenDangNhap: string; matKhau: string }): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>(`TaiKhoan/login`, credentials);
  }
}
