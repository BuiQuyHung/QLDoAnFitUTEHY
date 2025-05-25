import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service'; 
import { BaoCaoTienDo } from '../models/BaoCaoTienDo';

@Injectable({
  providedIn: 'root'
})
export class BaoCaoTienDoService {

  constructor(private apiService: ApiService) { }

  // Lấy tất cả Báo cáo Tiến độ (Admin có thể dùng)
  // Endpoint: GET /api/BaoCaoTienDo
  getBaoCaoTienDos(): Observable<BaoCaoTienDo[]> {
    return this.apiService.get<BaoCaoTienDo[]>(`BaoCaoTienDo`);
  }

  // Lấy Báo cáo Tiến độ theo ID
  // Endpoint: GET /api/BaoCaoTienDo/{id}
  getBaoCaoTienDoById(id: string): Observable<BaoCaoTienDo> {
    return this.apiService.get<BaoCaoTienDo>(`BaoCaoTienDo/${id}`);
  }

  // Thêm mới Báo cáo Tiến độ (Sinh viên nộp báo cáo)
  // Endpoint: POST /api/BaoCaoTienDo
  addBaoCaoTienDo(baoCao: BaoCaoTienDo): Observable<BaoCaoTienDo> {
    // Lưu ý: Trường tepDinhKem trong 'baoCao' sẽ chứa URL do sinh viên nhập.
    return this.apiService.post<BaoCaoTienDo>(`BaoCaoTienDo`, baoCao);
  }

  // Cập nhật Báo cáo Tiến độ (Sinh viên sửa nội dung báo cáo)
  // Endpoint: PUT /api/BaoCaoTienDo/{id}
  updateBaoCaoTienDo(maBaoCao: string, baoCao: BaoCaoTienDo): Observable<any> {
    return this.apiService.put<any>(`BaoCaoTienDo/${maBaoCao}`, baoCao);
  }

  // Xóa Báo cáo Tiến độ (Admin/Sinh viên nếu được phép)
  // Endpoint: DELETE /api/BaoCaoTienDo/{id}
  deleteBaoCaoTienDo(maBaoCao: string): Observable<any> {
    return this.apiService.delete<any>(`BaoCaoTienDo/${maBaoCao}`);
  }

  // Duyệt và nhận xét Báo cáo Tiến độ (Giảng viên/Admin thực hiện)
  // Endpoint: PUT /api/BaoCaoTienDo/review/{id}
  // API này sẽ nhận vào các trường cần thiết để cập nhật nhận xét, điểm, trạng thái
  reviewBaoCaoTienDo(maBaoCao: string, reviewData: { nhanXetCuaGV: string, diemSo: number, trangThai: string, ngayDuyet: Date }): Observable<any> {
    return this.apiService.put<any>(`BaoCaoTienDo/review/${maBaoCao}`, reviewData);
  }

  // ----- CÁC PHƯƠNG THỨC LIÊN QUAN ĐẾN FILE UPLOAD/DOWNLOAD (CHƯA TRIỂN KHAI BACKEND) -----
  // Bạn sẽ cần triển khai các API này ở Backend nếu muốn có chức năng đính kèm file vật lý.
  // Khi triển khai, nhớ bỏ comment và kiểm tra lại cú pháp (ví dụ: File, FormData, Observable).

  // Phương thức để tải file vật lý từ server
  // downloadFile(fileName: string): Observable<Blob> {
  //   // Giả định API có endpoint cho việc tải file, ví dụ: /api/Files/download/{fileName}
  //   // API của bạn cần trả về blob hoặc stream
  //   return this.apiService.get<Blob>(`Files/download/${fileName}`, { responseType: 'blob' });
  // }

  // Phương thức để tải file vật lý lên server
  // uploadFile(file: File): Observable<{ fileName: string }> {
  //   const formData = new FormData();
  //   formData.append('file', file); // 'file' là tên trường mà API backend mong đợi
  //   // Giả định API có endpoint upload file, ví dụ: /api/Files/upload
  //   // API này cần trả về tên file đã lưu trên server
  //   return this.apiService.post<{ fileName: string }>(`Files/upload`, formData);
  // }
}