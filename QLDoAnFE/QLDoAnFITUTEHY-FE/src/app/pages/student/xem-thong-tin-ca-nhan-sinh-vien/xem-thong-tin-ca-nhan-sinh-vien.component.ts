import { Component, OnInit, OnDestroy } from '@angular/core';
import { SinhVienService } from '../../../services/sinh-vien.service';
import { AuthService } from '../../../services/auth.service';
import { SinhVien } from '../../../models/SinhVien'; 
import { UserInfo } from '../../../models/auth.model';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-xem-thong-tin-ca-nhan-sinh-vien',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  providers: [DatePipe],
  templateUrl: './xem-thong-tin-ca-nhan-sinh-vien.component.html',
  styleUrls: ['./xem-thong-tin-ca-nhan-sinh-vien.component.css']
})
export class XemThongTinCaNhanSinhVienComponent implements OnInit, OnDestroy {
  sinhVienCuaToi: SinhVien | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  currentUserId: string | null = null;

  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    private sinhVienService: SinhVienService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (user: UserInfo) => { 
          if (user && user.maSV) { 
            this.currentUserId = user.maSV;
            this.getThongTinSinhVien(user.maSV);
          } else {
            this.errorMessage = 'Không tìm thấy ID sinh viên. Vui lòng đăng nhập lại hoặc kiểm tra thông tin tài khoản.';
            this.isLoading = false;
          }
        },
        error: (err) => {
          console.error('Lỗi khi lấy thông tin người dùng từ currentUser$:', err);
          this.errorMessage = 'Đã xảy ra lỗi khi lấy thông tin người dùng.';
          this.isLoading = false;
        }
      });
  }

  getThongTinSinhVien(maSV: string): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.sinhVienService.getSinhVienById(maSV).subscribe({
      next: (data) => {
        this.sinhVienCuaToi = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi tải thông tin sinh viên:', err);
        this.errorMessage = 'Không thể tải thông tin cá nhân của sinh viên. Vui lòng thử lại sau.';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}