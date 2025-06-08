import { Injectable } from '@angular/core';
import { catchError, forkJoin, of, switchMap, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DeTai } from '../models/DeTai';
import { DotDoAn } from '../models/DotDoAn';
import { GiangVien } from '../models/GiangVien';
import { SinhVien } from '../models/SinhVien';
import { DeTaiSinhVienResponse } from '../models/DeTaiSinhVienResponse';

@Injectable({
  providedIn: 'root',
})
export class DeTaiService {
  constructor(private apiService: ApiService) {}

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

  getDeTaisByGiangVienId(maGiangVien: string): Observable<DeTai[]> {
    return this.apiService.get<DeTai[]>(`DeTai/giangvien/${maGiangVien}`);
  }

  getDeTaisBySinhVienId(
    maSinhVien: string
  ): Observable<DeTaiSinhVienResponse | null> {
    return this.apiService
      .get<DeTaiSinhVienResponse>(`DeTai/sinhvien/${maSinhVien}`)
      .pipe(
        catchError((err) => {
          if (err.status === 404) {
            console.warn(
              `Không tìm thấy đề tài cho sinh viên ${maSinhVien}.`,
              err
            );
            return of(null);
          }
          throw err;
        })
      );
  }

  assignGiangVienToDeTai(
    maDeTai: string,
    maGiangVien: string
  ): Observable<any> {
    return this.apiService.put<any>(
      `DeTai/${maDeTai}/AssignGiangVien/${maGiangVien}`,
      {}
    );
  }

  assignSinhVienToDeTai(maDeTai: string, maSinhVien: string): Observable<any> {
    return this.apiService.put<any>(
      `DeTai/${maDeTai}/AssignSinhVien/${maSinhVien}`,
      {}
    );
  }

  getDeTaisByDotDoAnId(dotDoAnId: string): Observable<DeTai[]> {
    return this.apiService.get<DeTai[]>(`DeTai/ByDotDoAn/${dotDoAnId}`);
  }
}
