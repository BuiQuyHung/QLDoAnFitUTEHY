// src/app/pages/admin/quan-ly-phan-cong/quan-ly-phan-cong.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PhanCongService } from '../../../services/phan-cong.service';
import { DeTaiService } from '../../../services/de-tai.service'; // Cần để lấy danh sách Đề tài
import { SinhVienService } from '../../../services/sinh-vien.service'; // Cần để lấy danh sách Sinh viên
import { DotDoAnService } from '../../../services/dot-do-an.service'; // Cần để lấy danh sách Đợt Đồ án

import { PhanCong } from '../../../models/PhanCong';
import { DeTai } from '../../../models/DeTai'; // Import model DeTai
import { SinhVien } from '../../../models/SinhVien'; // Import model SinhVien
import { DotDoAn } from '../../../models/DotDoAn'; // Import model DotDoAn

import { HttpErrorResponse } from '@angular/common/http';
import { Subject, combineLatest, of, throwError } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-quan-ly-phan-cong',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './quan-ly-phan-cong.component.html',
  styleUrls: ['./quan-ly-phan-cong.component.css']
})
export class QuanLyPhanCongComponent implements OnInit {
  phanCongList: PhanCong[] = [];
  originalPhanCongList: PhanCong[] = [];
  deTaiList: DeTai[] = []; // Danh sách Đề tài cho dropdown
  sinhVienList: SinhVien[] = []; // Danh sách Sinh viên cho dropdown
  dotDoAnList: DotDoAn[] = []; // Danh sách Đợt Đồ án cho dropdown

  phanCongForm: FormGroup;
  selectedPhanCong: PhanCong | null = null;

  errorMessage: string = '';
  successMessage: string = '';

  private searchTermSubject = new Subject<string>(); // Cho tìm kiếm client-side
  private deTaiFilterSubject = new Subject<string>(); // Lọc theo Đề tài
  private svFilterSubject = new Subject<string>(); // Lọc theo Sinh viên
  private dotDoAnFilterSubject = new Subject<string>(); // Lọc theo Đợt Đồ án
  private refreshTriggerSubject = new Subject<void>();

  currentSearchTerm: string = '';
  currentDeTaiFilter: string = '';
  currentSvFilter: string = '';
  currentDotDoAnFilter: string = '';

  constructor(
    private phanCongService: PhanCongService,
    private deTaiService: DeTaiService,
    private sinhVienService: SinhVienService,
    private dotDoAnService: DotDoAnService,
    private fb: FormBuilder
  ) {
    this.phanCongForm = this.fb.group({
      maDeTai: ['', Validators.required],
      maSV: ['', Validators.required],
      ngayPhanCong: [''], // Không bắt buộc, có thể được điền tự động từ backend
      maDotDoAn: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDropdownData(); // Tải dữ liệu cho các dropdown

    this.searchTermSubject.next('');
    this.deTaiFilterSubject.next('');
    this.svFilterSubject.next('');
    this.dotDoAnFilterSubject.next('');

    combineLatest([
      this.searchTermSubject.pipe(startWith(this.currentSearchTerm), debounceTime(300), distinctUntilChanged()),
      this.deTaiFilterSubject.pipe(startWith(this.currentDeTaiFilter), distinctUntilChanged()),
      this.svFilterSubject.pipe(startWith(this.currentSvFilter), distinctUntilChanged()),
      this.dotDoAnFilterSubject.pipe(startWith(this.currentDotDoAnFilter), distinctUntilChanged()),
      this.refreshTriggerSubject.pipe(startWith(undefined as void))
    ]).pipe(
      switchMap(([searchTerm, deTaiFilter, svFilter, dotDoAnFilter, refreshTrigger]) => {
        this.currentSearchTerm = searchTerm;
        this.currentDeTaiFilter = deTaiFilter;
        this.currentSvFilter = svFilter;
        this.currentDotDoAnFilter = dotDoAnFilter;
        this.clearMessages();

        if (deTaiFilter) {
          return this.phanCongService.getPhanCongByDeTaiId(deTaiFilter).pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Lỗi khi tải phân công theo đề tài:', error);
              this.errorMessage = `Không thể tải phân công cho đề tài '${this.getDeTaiTen(deTaiFilter)}'.`;
              return of([]);
            })
          );
        } else if (svFilter) {
          return this.phanCongService.getPhanCongBySinhVienId(svFilter).pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Lỗi khi tải phân công theo sinh viên:', error);
              this.errorMessage = `Không thể tải phân công cho sinh viên '${this.getSinhVienTen(svFilter)}'.`;
              return of([]);
            })
          );
        } else if (dotDoAnFilter) {
          return this.phanCongService.getPhanCongByDotDoAnId(dotDoAnFilter).pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Lỗi khi tải phân công theo đợt đồ án:', error);
              this.errorMessage = `Không thể tải phân công cho đợt đồ án '${this.getDotDoAnTen(dotDoAnFilter)}'.`;
              return of([]);
            })
          );
        } else {
          return this.phanCongService.getAllPhanCong().pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Lỗi khi tải danh sách phân công:', error);
              this.errorMessage = 'Không thể tải danh sách phân công.';
              return of([]);
            })
          );
        }
      })
    ).subscribe(data => {
      this.originalPhanCongList = data;
      this.applyClientSideFilters(); // Áp dụng lọc tìm kiếm (nếu có)
    });
  }

  // Tải danh sách cho các dropdown
  loadDropdownData(): void {
    this.deTaiService.getDeTais().subscribe({
      next: (data) => this.deTaiList = data,
      error: (err: HttpErrorResponse) => console.error('Lỗi khi tải danh sách đề tài:', err)
    });
    this.sinhVienService.searchSinhVien().subscribe({
      next: (data) => this.sinhVienList = data,
      error: (err: HttpErrorResponse) => console.error('Lỗi khi tải danh sách sinh viên:', err)
    });
    this.dotDoAnService.getAllDotDoAn().subscribe({
      next: (data) => this.dotDoAnList = data,
      error: (err: HttpErrorResponse) => console.error('Lỗi khi tải danh sách đợt đồ án:', err)
    });
  }

  // Áp dụng bộ lọc tìm kiếm trên client-side
  applyClientSideFilters(): void {
    let filteredList = [...this.originalPhanCongList];

    if (this.currentSearchTerm) {
      filteredList = filteredList.filter(pc => {
        const deTaiTen = this.getDeTaiTen(pc.maDeTai);
        const sinhVienTen = this.getSinhVienTen(pc.maSV);
        return deTaiTen.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
               sinhVienTen.toLowerCase().includes(this.currentSearchTerm.toLowerCase());
      });
    }
    this.phanCongList = filteredList;
  }

  onSelectPhanCong(phanCong: PhanCong): void {
    this.selectedPhanCong = phanCong;
    this.phanCongForm.patchValue({
      maDeTai: phanCong.maDeTai,
      maSV: phanCong.maSV,
      ngayPhanCong: phanCong.ngayPhanCong ? new Date(phanCong.ngayPhanCong).toISOString().substring(0, 10) : '',
      maDotDoAn: phanCong.maDotDoAn
    });
    this.phanCongForm.get('maDeTai')?.disable(); // Tắt trường mã khi chỉnh sửa
    this.phanCongForm.get('maSV')?.disable(); // Tắt trường mã khi chỉnh sửa
    this.clearMessages();
  }

  onSubmit(): void {
    const formData = this.phanCongForm.getRawValue();

    if (this.phanCongForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ và đúng thông tin.';
      this.phanCongForm.markAllAsTouched();
      return;
    }

    if (this.selectedPhanCong) {
      this.phanCongService.updatePhanCong(this.selectedPhanCong.maDeTai, this.selectedPhanCong.maSV, formData).subscribe({
        next: (_) => {
          this.successMessage = 'Cập nhật phân công thành công!';
          this.resetForm();
          this.refreshPhanCongList();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi khi cập nhật phân công: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi cập nhật phân công:', err);
        }
      });
    } else {
      this.phanCongService.addPhanCong(formData).subscribe({
        next: (_) => {
          this.successMessage = 'Thêm mới phân công thành công!';
          this.resetForm();
          this.refreshPhanCongList();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi khi thêm mới phân công: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi thêm mới phân công:', err);
        }
      });
    }
  }

  onDeletePhanCong(maDeTai: string, maSV: string): void {
    if (confirm(`Bạn có chắc chắn muốn xóa phân công của Đề tài '${this.getDeTaiTen(maDeTai)}' cho Sinh viên '${this.getSinhVienTen(maSV)}' không?`)) {
      this.phanCongService.deletePhanCong(maDeTai, maSV).subscribe({
        next: (_) => {
          this.successMessage = `Phân công đã được xóa thành công!`;
          this.refreshPhanCongList();
          this.resetForm();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi khi xóa phân công: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi xóa phân công:', err);
        }
      });
    }
  }

  resetForm(): void {
    this.phanCongForm.reset();
    this.selectedPhanCong = null;
    this.phanCongForm.get('maDeTai')?.enable();
    this.phanCongForm.get('maSV')?.enable();
    this.clearMessages();
    this.phanCongForm.get('maDeTai')?.setValue('');
    this.phanCongForm.get('maSV')?.setValue('');
    this.phanCongForm.get('maDotDoAn')?.setValue('');
  }

  refreshPhanCongList(): void {
    this.refreshTriggerSubject.next();
  }

  onSearchTermChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchTermSubject.next(searchTerm);
  }

  onDeTaiFilterChange(event: Event): void {
    const deTaiId = (event.target as HTMLSelectElement).value;
    this.deTaiFilterSubject.next(deTaiId);
    this.svFilterSubject.next(''); // Reset other filters
    this.dotDoAnFilterSubject.next('');
  }

  onSvFilterChange(event: Event): void {
    const svId = (event.target as HTMLSelectElement).value;
    this.svFilterSubject.next(svId);
    this.deTaiFilterSubject.next(''); // Reset other filters
    this.dotDoAnFilterSubject.next('');
  }

  onDotDoAnFilterChange(event: Event): void {
    const dotDoAnId = (event.target as HTMLSelectElement).value;
    this.dotDoAnFilterSubject.next(dotDoAnId);
    this.deTaiFilterSubject.next(''); // Reset other filters
    this.svFilterSubject.next('');
  }

  getDeTaiTen(maDeTai: string): string {
    const deTai = this.deTaiList.find(dt => dt.maDeTai === maDeTai);
    return deTai ? deTai.tenDeTai : 'N/A';
  }

  getSinhVienTen(maSV: string): string {
    const sinhVien = this.sinhVienList.find(sv => sv.maSV === maSV);
    return sinhVien ? sinhVien.hoTen : 'N/A';
  }

  getDotDoAnTen(maDotDoAn: string): string {
    const dotDoAn = this.dotDoAnList.find(dda => dda.maDotDoAn === maDotDoAn);
    return dotDoAn ? dotDoAn.tenDotDoAn : 'N/A';
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}