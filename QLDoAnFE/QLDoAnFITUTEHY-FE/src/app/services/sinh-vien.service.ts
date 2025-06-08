import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SinhVien } from '../models/SinhVien';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class SinhVienService {
  constructor(private apiService: ApiService) {}

  searchSinhVien(term: string = ''): Observable<SinhVien[]> {
    if (term) {
      return this.apiService.get<SinhVien[]>(`SinhVien?term=${term}`);
    }
    return this.apiService.get<SinhVien[]>(`SinhVien`);
  }

  getSinhVienById(id: string): Observable<SinhVien> {
    return this.apiService.get<SinhVien>(`SinhVien/${id}`);
  }

  addSinhVien(sinhVien: SinhVien): Observable<SinhVien> {
    return this.apiService.post<SinhVien>(`SinhVien`, sinhVien);
  }

  updateSinhVien(maSV: string, sinhVien: SinhVien): Observable<SinhVien> {
    return this.apiService.put<SinhVien>(`SinhVien/${maSV}`, sinhVien);
  }

  deleteSinhVien(maSV: string): Observable<any> {
    return this.apiService.delete<any>(`SinhVien/${maSV}`);
  }

  getSinhVienByLopId(lopId: string): Observable<SinhVien[]> {
    return this.apiService.get<SinhVien[]>(`SinhVien/lop/${lopId}`);
  }
}
