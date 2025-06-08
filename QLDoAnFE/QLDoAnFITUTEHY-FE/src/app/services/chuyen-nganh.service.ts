import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChuyenNganh } from '../models/ChuyenNganh';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ChuyenNganhService {

  constructor(private apiService: ApiService) { }

  searchChuyenNganh(term: string = ''): Observable<ChuyenNganh[]> {
    if (term) {
      return this.apiService.get<ChuyenNganh[]>(`ChuyenNganh?term=${term}`);
    }
    return this.apiService.get<ChuyenNganh[]>(`ChuyenNganh`);
  }

  getChuyenNganhById(id: string): Observable<ChuyenNganh> {
    return this.apiService.get<ChuyenNganh>(`ChuyenNganh/${id}`);
  }

  addChuyenNganh(chuyenNganh: ChuyenNganh): Observable<ChuyenNganh> {
    return this.apiService.post<ChuyenNganh>(`ChuyenNganh`, chuyenNganh);
  }

  updateChuyenNganh(maChuyenNganh: string, chuyenNganh: ChuyenNganh): Observable<ChuyenNganh> {
    return this.apiService.put<ChuyenNganh>(`ChuyenNganh/${maChuyenNganh}`, chuyenNganh);
  }

  deleteChuyenNganh(maChuyenNganh: string): Observable<any> {
    return this.apiService.delete<any>(`ChuyenNganh/${maChuyenNganh}`);
  }

  getChuyenNganhByNganhId(nganhId: string): Observable<ChuyenNganh[]> {
    return this.apiService.get<ChuyenNganh[]>(`ChuyenNganh/nganh/${nganhId}`);
  }
}