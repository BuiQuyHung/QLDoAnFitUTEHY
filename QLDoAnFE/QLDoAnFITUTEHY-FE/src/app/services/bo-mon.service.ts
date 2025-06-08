import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BoMon } from '../models/BoMon';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class BoMonService {
  constructor(private apiService: ApiService) {}
  searchBoMon(term: string = ''): Observable<BoMon[]> {
    if (term) {
      return this.apiService.get<BoMon[]>(`BoMon?term=${term}`);
    }
    return this.apiService.get<BoMon[]>(`BoMon`);
  }

  getBoMonById(id: string): Observable<BoMon> {
    return this.apiService.get<BoMon>(`BoMon/${id}`);
  }

  addBoMon(boMon: BoMon): Observable<BoMon> {
    return this.apiService.post<BoMon>(`BoMon`, boMon);
  }

  updateBoMon(maBoMon: string, boMon: BoMon): Observable<BoMon> {
    return this.apiService.put<BoMon>(`BoMon/${maBoMon}`, boMon);
  }

  deleteBoMon(maBoMon: string): Observable<any> {
    return this.apiService.delete<any>(`BoMon/${maBoMon}`);
  }

  getBoMonByKhoaId(khoaId: string): Observable<BoMon[]> {
    return this.apiService.get<BoMon[]>(`BoMon/khoa/${khoaId}`);
  }
}
