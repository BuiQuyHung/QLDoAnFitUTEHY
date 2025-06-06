import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GiangVienService } from '../../../services/giang-vien.service';
import { AuthService } from '../../../services/auth.service';
import { GiangVien } from '../../../models/GiangVien'; 
import { catchError, of, throwError } from 'rxjs'; 

@Component({
  selector: 'app-xem-thong-tin-ca-nhan-giang-vien',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './xem-thong-tin-ca-nhan-giang-vien.component.html',
  styleUrls: ['./xem-thong-tin-ca-nhan-giang-vien.component.css']
})
export class XemThongTinCaNhanGiangVienComponent implements OnInit {
  giangVien: GiangVien | null = null; 
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private giangVienService: GiangVienService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadThongTinGiangVien();
  }

  loadThongTinGiangVien(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const maGV = this.authService.getUserMaGV(); 

    if (maGV) {
      this.giangVienService.getGiangVienById(maGV).pipe(
        catchError(error => {
          this.isLoading = false;
          console.error('Lỗi khi tải thông tin giảng viên:', error);
          this.errorMessage = 'Không thể tải thông tin cá nhân. Vui lòng kiểm tra kết nối và API Back-End.';
          return throwError(() => new Error('Lỗi tải thông tin giảng viên.'));
        })
      ).subscribe({
        next: (data: GiangVien) => {
          this.giangVien = data;
          this.isLoading = false;
          console.log('Dữ liệu giảng viên nhận được:', this.giangVien);
        },
        error: (err) => { 
          this.errorMessage = err.message;
          this.isLoading = false;
        }
      });
    } else {
      this.errorMessage = 'Không tìm thấy mã giảng viên đăng nhập. Vui lòng đăng nhập lại.';
      this.isLoading = false;
    }
  }
}