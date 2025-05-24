import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChuyenNganh } from '../models/ChuyenNganh';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ChuyenNganhService {

  constructor(private apiService: ApiService) { }

  // Lấy tất cả ChuyenNganh hoặc tìm kiếm ChuyenNganh theo từ khóa
  // Endpoint: GET /api/ChuyenNganh (hoặc /api/ChuyenNganh?term=...)
  searchChuyenNganh(term: string = ''): Observable<ChuyenNganh[]> {
    if (term) {
      // Giả định API của bạn có endpoint tìm kiếm hoặc filter trên GET /api/ChuyenNganh
      return this.apiService.get<ChuyenNganh[]>(`ChuyenNganh?term=${term}`);
    }
    return this.apiService.get<ChuyenNganh[]>(`ChuyenNganh`);
  }

  // Lấy ChuyenNganh theo ID
  // Endpoint: GET /api/ChuyenNganh/{id}
  getChuyenNganhById(id: string): Observable<ChuyenNganh> {
    return this.apiService.get<ChuyenNganh>(`ChuyenNganh/${id}`);
  }

  // Thêm mới ChuyenNganh
  // Endpoint: POST /api/ChuyenNganh
  addChuyenNganh(chuyenNganh: ChuyenNganh): Observable<ChuyenNganh> {
    return this.apiService.post<ChuyenNganh>(`ChuyenNganh`, chuyenNganh);
  }

  // Cập nhật ChuyenNganh
  // Endpoint: PUT /api/ChuyenNganh/{id}
  updateChuyenNganh(maChuyenNganh: string, chuyenNganh: ChuyenNganh): Observable<ChuyenNganh> {
    return this.apiService.put<ChuyenNganh>(`ChuyenNganh/${maChuyenNganh}`, chuyenNganh);
  }

  // Xóa ChuyenNganh
  // Endpoint: DELETE /api/ChuyenNganh/{id}
  deleteChuyenNganh(maChuyenNganh: string): Observable<any> {
    return this.apiService.delete<any>(`ChuyenNganh/${maChuyenNganh}`);
  }

  // Lấy các ChuyenNganh theo Nganh ID
  // Endpoint: GET /api/ChuyenNganh/nganh/{nganhId}
  getChuyenNganhByNganhId(nganhId: string): Observable<ChuyenNganh[]> {
    return this.apiService.get<ChuyenNganh[]>(`ChuyenNganh/nganh/${nganhId}`);
  }
}