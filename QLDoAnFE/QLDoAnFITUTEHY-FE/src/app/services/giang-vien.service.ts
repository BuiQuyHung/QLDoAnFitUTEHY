import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GiangVien } from '../models/GiangVien';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class GiangVienService {
  constructor(private apiService: ApiService) {}

  searchGiangVien(term: string = ''): Observable<GiangVien[]> {
    if (term) {
      return this.apiService.get<GiangVien[]>(`GiangVien?term=${term}`);
    }
    return this.apiService.get<GiangVien[]>(`GiangVien`);
  }

  getGiangVienById(id: string): Observable<GiangVien> {
    return this.apiService.get<GiangVien>(`GiangVien/${id}`);
  }

  addGiangVien(giangVien: GiangVien): Observable<GiangVien> {
    return this.apiService.post<GiangVien>(`GiangVien`, giangVien);
  }

  updateGiangVien(maGV: string, giangVien: GiangVien): Observable<GiangVien> {
    return this.apiService.put<GiangVien>(`GiangVien/${maGV}`, giangVien);
  }

  deleteGiangVien(maGV: string): Observable<any> {
    return this.apiService.delete<any>(`GiangVien/${maGV}`);
  }

  getGiangVienByChuyenNganh(chuyenNganh: string): Observable<GiangVien[]> {
    return this.apiService.get<GiangVien[]>(
      `GiangVien/chuyennganh/${chuyenNganh}`
    );
  }
}
