import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HoiDong } from '../models/HoiDong'; 
import { ApiService } from './api.service'; 

@Injectable({
  providedIn: 'root'
})
export class HoiDongService {

  constructor(private apiService: ApiService) { }

  searchHoiDong(term: string = ''): Observable<HoiDong[]> {
    if (term) {
      return this.apiService.get<HoiDong[]>(`HoiDong?term=${term}`);
    }
    return this.apiService.get<HoiDong[]>(`HoiDong`);
  }

  getHoiDongById(maHoiDong: string): Observable<HoiDong> {
    return this.apiService.get<HoiDong>(`HoiDong/${maHoiDong}`);
  }

  addHoiDong(hoiDong: HoiDong): Observable<HoiDong> {
    return this.apiService.post<HoiDong>(`HoiDong`, hoiDong);
  }

  updateHoiDong(maHoiDong: string, hoiDong: HoiDong): Observable<HoiDong> {
    return this.apiService.put<HoiDong>(`HoiDong/${maHoiDong}`, hoiDong);
  }

  deleteHoiDong(maHoiDong: string): Observable<any> {
    return this.apiService.delete<any>(`HoiDong/${maHoiDong}`);
  }

  getHoiDongByDotDoAnId(maDotDoAn: string): Observable<HoiDong[]> {
    return this.apiService.get<HoiDong[]>(`HoiDong/dotdoan/${maDotDoAn}`);
  }
}
