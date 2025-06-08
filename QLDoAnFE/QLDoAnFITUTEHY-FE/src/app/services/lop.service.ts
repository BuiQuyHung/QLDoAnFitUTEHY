import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Lop } from '../models/Lop';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class LopService {
  constructor(private apiService: ApiService) {}

  searchLop(term: string = ''): Observable<Lop[]> {
    if (term) {
      return this.apiService.get<Lop[]>(`Lop?term=${term}`);
    }
    return this.apiService.get<Lop[]>(`Lop`);
  }

  getLopById(id: string): Observable<Lop> {
    return this.apiService.get<Lop>(`Lop/${id}`);
  }

  addLop(lop: Lop): Observable<Lop> {
    return this.apiService.post<Lop>(`Lop`, lop);
  }

  updateLop(maLop: string, lop: Lop): Observable<Lop> {
    return this.apiService.put<Lop>(`Lop/${maLop}`, lop);
  }

  deleteLop(maLop: string): Observable<any> {
    return this.apiService.delete<any>(`Lop/${maLop}`);
  }

  getLopByChuyenNganhId(chuyenNganhId: string): Observable<Lop[]> {
    return this.apiService.get<Lop[]>(`Lop/chuyennganh/${chuyenNganhId}`);
  }
}
