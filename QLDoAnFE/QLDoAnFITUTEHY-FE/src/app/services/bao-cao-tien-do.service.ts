// src/app/services/bao-cao-tien-do.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaoCaoTienDo } from '../models/BaoCaoTienDo';
import { ApiService } from './api.service'; // Giả định bạn đã có ApiService chung

@Injectable({
  providedIn: 'root'
})
export class BaoCaoTienDoService {

  constructor(private apiService: ApiService) { }

  // Lấy tất cả báo cáo tiến độ (dùng cho Admin)
  // Endpoint: GET /api/BaoCaoTienDo
  getAllBaoCaoTienDo(): Observable<BaoCaoTienDo[]> {
    return this.apiService.get<BaoCaoTienDo[]>(`BaoCaoTienDo`);
  }

  // Lấy báo cáo tiến độ theo ID
  // Endpoint: GET /api/BaoCaoTienDo/{id}
  getBaoCaoTienDoById(id: number): Observable<BaoCaoTienDo> {
    return this.apiService.get<BaoCaoTienDo>(`BaoCaoTienDo/${id}`);
  }

  // Thêm mới báo cáo tiến độ
  // Endpoint: POST /api/BaoCaoTienDo
  addBaoCaoTienDo(baoCao: BaoCaoTienDo): Observable<BaoCaoTienDo> {
    return this.apiService.post<BaoCaoTienDo>(`BaoCaoTienDo`, baoCao);
  }

  // Cập nhật báo cáo tiến độ
  // Endpoint: PUT /api/BaoCaoTienDo/{id}
  updateBaoCaoTienDo(id: number, baoCao: BaoCaoTienDo): Observable<BaoCaoTienDo> {
    return this.apiService.put<BaoCaoTienDo>(`BaoCaoTienDo/${id}`, baoCao);
  }

  // Xóa báo cáo tiến độ
  // Endpoint: DELETE /api/BaoCaoTienDo/{id}
  deleteBaoCaoTienDo(id: number): Observable<any> {
    return this.apiService.delete<any>(`BaoCaoTienDo/${id}`);
  }

  // Lấy danh sách báo cáo tiến độ của một sinh viên cho một đề tài cụ thể
  // Endpoint: GET /api/BaoCaoTienDo/sinhvien/{maSV}/detai/{maDeTai}
  getBaoCaoBySinhVienAndDeTai(maSV: string, maDeTai: string): Observable<BaoCaoTienDo[]> {
    return this.apiService.get<BaoCaoTienDo[]>(`BaoCaoTienDo/sinhvien/${maSV}/detai/${maDeTai}`);
  }

  // Lấy danh sách báo cáo tiến độ mà một giảng viên cần đánh giá
  // Endpoint: GET /api/BaoCaoTienDo/giangvien/{maGV}
  getBaoCaoByGiangVien(maGV: string): Observable<BaoCaoTienDo[]> {
    return this.apiService.get<BaoCaoTienDo[]>(`BaoCaoTienDo/giangvien/${maGV}`);
  }

  // Giảng viên đánh giá báo cáo tiến độ
  // Endpoint: PUT /api/BaoCaoTienDo/{id}/danhgia
  danhGiaBaoCaoTienDo(id: number, danhGiaData: { nhanXetCuaGV: string, diemSo: number, trangThai: string }): Observable<any> {
    return this.apiService.put<any>(`BaoCaoTienDo/${id}/danhgia`, danhGiaData);
  }

  /**
   * Tải tệp lên server và trả về URL của tệp đã lưu trữ.
   * @param file Đối tượng File được chọn từ input.
   * @returns Observable<string> chứa URL của tệp sau khi tải lên thành công.
   */
  uploadFile(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file); // 'file' là tên key mà API backend của bạn mong đợi để nhận file

    // Giả định API upload file của bạn là POST /api/Upload hoặc /api/BaoCaoTienDo/UploadFile
    // Backend sẽ trả về URL của file đã được lưu trữ (ví dụ: 'https://yourdomain.com/uploads/filename.pdf')
    // Nếu API của bạn nằm trong cùng một controller BaoCaoTienDo, bạn có thể dùng:
    return this.apiService.post<string>(`BaoCaoTienDo/UploadFile`, formData);
    // Hoặc nếu có một UploadController riêng:
    // return this.apiService.post<string>(`Upload/File`, formData);
  }
}
