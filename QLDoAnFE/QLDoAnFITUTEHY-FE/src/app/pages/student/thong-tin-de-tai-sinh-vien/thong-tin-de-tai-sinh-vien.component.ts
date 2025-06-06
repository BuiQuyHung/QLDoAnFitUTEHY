import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { AuthService } from '../../../services/auth.service'; 
import { DeTaiService } from '../../../services/de-tai.service'; 
import { DeTaiSinhVienResponse } from '../../../models/DeTaiSinhVienResponse'; 

@Component({
  selector: 'app-thong-tin-de-tai-sinh-vien',
  standalone: true, 
  imports: [CommonModule], 
  templateUrl: './thong-tin-de-tai-sinh-vien.component.html',
  styleUrls: ['./thong-tin-de-tai-sinh-vien.component.css']
})
export class ThongTinDeTaiSinhVienComponent implements OnInit {
  currentMaSV: string | null = null;
  deTaiData: DeTaiSinhVienResponse | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private deTaiService: DeTaiService
  ) { }

  ngOnInit(): void {
    this.currentMaSV = this.authService.getUserMaSV();
    if (!this.currentMaSV) {
      this.errorMessage = 'Không tìm thấy mã sinh viên. Vui lòng đăng nhập lại.';
      this.isLoading = false;
      return;
    }
    this.loadDeTaiData();
  }

  loadDeTaiData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.deTaiData = null; 

    this.deTaiService.getDeTaisBySinhVienId(this.currentMaSV!).pipe( 
      catchError((err: HttpErrorResponse) => {
        console.error('Lỗi khi tải thông tin đề tài sinh viên:', err);
        if (err.status === 404) {
          this.errorMessage = 'Không tìm thấy đề tài cho sinh viên này.';
        } else {
          this.errorMessage = `Không thể tải thông tin đề tài. Lỗi: ${err.error?.message || err.message || 'Không xác định'}.`;
        }
        this.isLoading = false;
        return of(null);
      })
    ).subscribe((data: DeTaiSinhVienResponse | null) => {
      this.deTaiData = data;
      this.isLoading = false;
      if (!data && !this.errorMessage) {
        this.errorMessage = 'Không có dữ liệu đề tài được trả về.';
      }
    });
  }
}