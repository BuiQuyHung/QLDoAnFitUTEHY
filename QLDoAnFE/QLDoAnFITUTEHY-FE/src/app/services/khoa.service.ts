import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Khoa } from '../models/Khoa';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class KhoaService {
  constructor(private apiService: ApiService) {}

  searchKhoa(term: string = ''): Observable<Khoa[]> {
    if (term) {
      return this.apiService.get<Khoa[]>(`Khoa?term=${term}`);
    }
    return this.apiService.get<Khoa[]>(`Khoa`);
  }

  getKhoaById(id: string): Observable<Khoa> {
    return this.apiService.get<Khoa>(`Khoa/${id}`);
  }

  addKhoa(khoa: Khoa): Observable<Khoa> {
    return this.apiService.post<Khoa>(`Khoa`, khoa);
  }

  updateKhoa(maKhoa: string, khoa: Khoa): Observable<Khoa> {
    return this.apiService.put<Khoa>(`Khoa/${maKhoa}`, khoa);
  }

  deleteKhoa(maKhoa: string): Observable<any> {
    return this.apiService.delete<any>(`Khoa/${maKhoa}`);
  }
}
