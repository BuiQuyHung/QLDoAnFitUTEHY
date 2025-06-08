import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Nganh } from '../models/Nganh';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class NganhService {
  constructor(private apiService: ApiService) {}

  searchNganh(term: string = ''): Observable<Nganh[]> {
    if (term) {
      return this.apiService.get<Nganh[]>(`Nganh?term=${term}`);
    }
    return this.apiService.get<Nganh[]>(`Nganh`);
  }

  getNganhById(id: string): Observable<Nganh> {
    return this.apiService.get<Nganh>(`Nganh/${id}`);
  }

  addNganh(nganh: Nganh): Observable<Nganh> {
    return this.apiService.post<Nganh>(`Nganh`, nganh);
  }

  updateNganh(maNganh: string, nganh: Nganh): Observable<Nganh> {
    return this.apiService.put<Nganh>(`Nganh/${maNganh}`, nganh);
  }

  deleteNganh(maNganh: string): Observable<any> {
    return this.apiService.delete<any>(`Nganh/${maNganh}`);
  }

  getNganhByBoMonId(boMonId: string): Observable<Nganh[]> {
    return this.apiService.get<Nganh[]>(`Nganh/bomon/${boMonId}`);
  }
}
