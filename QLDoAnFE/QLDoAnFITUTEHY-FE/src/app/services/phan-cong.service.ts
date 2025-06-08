import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PhanCong } from '../models/PhanCong';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class PhanCongService {
  constructor(private apiService: ApiService) {}

  getAllPhanCong(): Observable<PhanCong[]> {
    return this.apiService.get<PhanCong[]>(`PhanCong`);
  }

  getPhanCongById(maDeTai: string, maSV: string): Observable<PhanCong> {
    return this.apiService.get<PhanCong>(`PhanCong/${maDeTai}/${maSV}`);
  }

  addPhanCong(phanCong: PhanCong): Observable<PhanCong> {
    return this.apiService.post<PhanCong>(`PhanCong`, phanCong);
  }

  updatePhanCong(
    maDeTai: string,
    maSV: string,
    phanCong: PhanCong
  ): Observable<PhanCong> {
    return this.apiService.put<PhanCong>(
      `PhanCong/${maDeTai}/${maSV}`,
      phanCong
    );
  }

  deletePhanCong(maDeTai: string, maSV: string): Observable<any> {
    return this.apiService.delete<any>(`PhanCong/${maDeTai}/${maSV}`);
  }

  getPhanCongByDeTaiId(deTaiId: string): Observable<PhanCong[]> {
    return this.apiService.get<PhanCong[]>(`PhanCong/detai/${deTaiId}`);
  }

  getPhanCongBySinhVienId(svId: string): Observable<PhanCong[]> {
    return this.apiService.get<PhanCong[]>(`PhanCong/sinhvien/${svId}`);
  }

  getPhanCongByDotDoAnId(dotDoAnId: string): Observable<PhanCong[]> {
    return this.apiService.get<PhanCong[]>(`PhanCong/dotdoan/${dotDoAnId}`);
  }
}
