import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TaiKhoan, LoginResponse } from '../models/TaiKhoan';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class TaiKhoanService {
  constructor(private apiService: ApiService) {}

  getAllTaiKhoan(): Observable<TaiKhoan[]> {
    return this.apiService.get<TaiKhoan[]>(`TaiKhoan`);
  }

  getTaiKhoanByUsername(username: string): Observable<TaiKhoan> {
    return this.apiService.get<TaiKhoan>(`TaiKhoan/${username}`);
  }

  addTaiKhoan(taiKhoan: TaiKhoan): Observable<TaiKhoan> {
    return this.apiService.post<TaiKhoan>(`TaiKhoan`, taiKhoan);
  }

  updateTaiKhoan(username: string, taiKhoan: TaiKhoan): Observable<TaiKhoan> {
    return this.apiService.put<TaiKhoan>(`TaiKhoan/${username}`, taiKhoan);
  }

  deleteTaiKhoan(username: string): Observable<any> {
    return this.apiService.delete<any>(`TaiKhoan/${username}`);
  }

  login(credentials: {
    tenDangNhap: string;
    matKhau: string;
  }): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>(`TaiKhoan/login`, credentials);
  }
}
