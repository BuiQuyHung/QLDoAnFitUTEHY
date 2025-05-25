// src/app/pages/admin/quan-ly-de-tai/quan-ly-de-tai.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, combineLatest, of, throwError } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, startWith, map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import { DeTaiService } from '../../../services/de-tai.service';
import { GiangVienService } from '../../../services/giang-vien.service'; // Cần để lấy danh sách GV
import { DotDoAnService } from '../../../services/dot-do-an.service';   // Cần để lấy danh sách Đợt ĐA
import { SinhVienService } from '../../../services/sinh-vien.service';   // Cần để lấy danh sách SV (nếu cho phép gán)

import { DeTai } from '../../../models/DeTai';
import { GiangVien } from '../../../models/GiangVien';
import { DotDoAn } from '../../../models/DotDoAn';
import { SinhVien } from '../../../models/SinhVien';

@Component({
  selector: 'app-quan-ly-de-tai',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './quan-ly-de-tai.component.html',
  styleUrls: ['./quan-ly-de-tai.component.css'] 
})
export class QuanLyDeTaiComponent implements OnInit {
  deTaiList: DeTai[] = [];
  originalDeTaiList: DeTai[] = []; 
  giangVienList: GiangVien[] = [];
  dotDoAnList: DotDoAn[] = [];     
  sinhVienList: SinhVien[] = [];   

  deTaiForm: FormGroup;
  selectedDeTai: DeTai | null = null;

  errorMessage: string = '';
  successMessage: string = '';

  private searchTermSubject = new Subject<string>();
  private gvFilterSubject = new Subject<string>();   
  private dotDoAnFilterSubject = new Subject<string>(); 
  private statusFilterSubject = new Subject<string>(); 
  private refreshTriggerSubject = new Subject<void>();

  currentSearchTerm: string = '';
  currentGvFilter: string = '';
  currentDotDoAnFilter: string = '';
  currentStatusFilter: string = '';

  // Các trạng thái đăng ký đề tài có thể có
  trangThaiOptions: string[] = ['Tất cả', 'Chờ duyệt', 'Đã duyệt', 'Đã hủy', 'Đã hoàn thành'];


  constructor(
    private deTaiService: DeTaiService,
    private giangVienService: GiangVienService,
    private dotDoAnService: DotDoAnService,
    private sinhVienService: SinhVienService,
    private fb: FormBuilder
  ) {
    this.deTaiForm = this.fb.group({
      maDeTai: ['', Validators.required],
      tenDeTai: ['', Validators.required],
      moTa: [''],
      maGV: ['', Validators.required], // Giảng viên hướng dẫn
      maDotDoAn: ['', Validators.required], // Đợt Đồ án
      maSV: [''], // Sinh viên thực hiện (có thể null)
      trangThaiDangKy: ['Chờ duyệt', Validators.required] // Trạng thái mặc định
    });
  }

  ngOnInit(): void {
    this.loadDropdownData(); // Tải danh sách cho các dropdown

    this.searchTermSubject.next('');
    this.gvFilterSubject.next('');
    this.dotDoAnFilterSubject.next('');
    this.statusFilterSubject.next(''); // Đảm bảo có giá trị khởi tạo

    combineLatest([
      this.searchTermSubject.pipe(startWith(this.currentSearchTerm), debounceTime(300), distinctUntilChanged()),
      this.gvFilterSubject.pipe(startWith(this.currentGvFilter), distinctUntilChanged()),
      this.dotDoAnFilterSubject.pipe(startWith(this.currentDotDoAnFilter), distinctUntilChanged()),
      this.statusFilterSubject.pipe(startWith(this.currentStatusFilter), distinctUntilChanged()),
      this.refreshTriggerSubject.pipe(startWith(undefined as void))
    ]).pipe(
      switchMap(([searchTerm, gvFilter, dotDoAnFilter, statusFilter, refreshTrigger]) => {
        this.currentSearchTerm = searchTerm;
        this.currentGvFilter = gvFilter;
        this.currentDotDoAnFilter = dotDoAnFilter;
        this.currentStatusFilter = statusFilter;
        this.clearMessages();

        let apiCall: Observable<DeTai[]>;

        if (gvFilter) {
          apiCall = this.deTaiService.getDeTaisByGiangVienId(gvFilter);
        } else if (dotDoAnFilter) {
          apiCall = this.deTaiService.getDeTaisByDotDoAnId(dotDoAnFilter);
        } else {
          apiCall = this.deTaiService.getDeTais(); // Lấy tất cả nếu không có lọc đặc biệt
        }

        return apiCall.pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Lỗi khi tải danh sách đề tài:', error);
            this.errorMessage = 'Không thể tải danh sách đề tài.';
            return of([]);
          })
        );
      })
    ).subscribe(data => {
      this.originalDeTaiList = data;
      this.applyClientSideFilters(); // Áp dụng lọc tìm kiếm và trạng thái
    });
  }

  loadDropdownData(): void {
    this.giangVienService.searchGiangVien().subscribe({
      next: (data) => this.giangVienList = data,
      error: (err: HttpErrorResponse) => console.error('Lỗi tải giảng viên:', err)
    });
    this.dotDoAnService.getAllDotDoAn().subscribe({
      next: (data) => this.dotDoAnList = data,
      error: (err: HttpErrorResponse) => console.error('Lỗi tải đợt đồ án:', err)
    });
    this.sinhVienService.searchSinhVien().subscribe({
      next: (data) => this.sinhVienList = data,
      error: (err: HttpErrorResponse) => console.error('Lỗi tải sinh viên:', err)
    });
  }

  // Áp dụng bộ lọc tìm kiếm và trạng thái trên client-side
  applyClientSideFilters(): void {
    let filteredList = [...this.originalDeTaiList];

    if (this.currentSearchTerm) {
      filteredList = filteredList.filter(deTai =>
        deTai.tenDeTai.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
        deTai.maDeTai.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
        (deTai.giangVien && deTai.giangVien.hoTen.toLowerCase().includes(this.currentSearchTerm.toLowerCase()))
      );
    }

    if (this.currentStatusFilter && this.currentStatusFilter !== 'Tất cả') {
      filteredList = filteredList.filter(deTai => deTai.trangThaiDangKy === this.currentStatusFilter);
    }
    this.deTaiList = filteredList;
  }

  onSelectDeTai(deTai: DeTai): void {
    this.selectedDeTai = deTai;
    this.deTaiForm.patchValue({
      maDeTai: deTai.maDeTai,
      tenDeTai: deTai.tenDeTai,
      moTa: deTai.moTa,
      maGV: deTai.maGV,
      maDotDoAn: deTai.maDotDoAn,
      maSV: deTai.maSV || '', // Đảm bảo gán giá trị rỗng nếu null
      trangThaiDangKy: deTai.trangThaiDangKy
    });
    this.deTaiForm.get('maDeTai')?.disable(); // Tắt trường mã khi chỉnh sửa
    this.clearMessages();
  }

  onSubmit(): void {
    const formData = this.deTaiForm.getRawValue(); // Lấy cả giá trị của control bị disable

    if (this.deTaiForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ và đúng thông tin.';
      this.deTaiForm.markAllAsTouched();
      return;
    }

    // Xử lý giá trị maSV rỗng thành null nếu API yêu cầu
    if (formData.maSV === '') {
      formData.maSV = null;
    }

    if (this.selectedDeTai) {
      this.deTaiService.updateDeTai(this.selectedDeTai.maDeTai, formData).subscribe({
        next: (_) => {
          this.successMessage = 'Cập nhật đề tài thành công!';
          this.resetForm();
          this.refreshDeTaiList();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi khi cập nhật đề tài: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi cập nhật đề tài:', err);
        }
      });
    } else {
      this.deTaiService.addDeTai(formData).subscribe({
        next: (_) => {
          this.successMessage = 'Thêm mới đề tài thành công!';
          this.resetForm();
          this.refreshDeTaiList();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi khi thêm mới đề tài: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi thêm mới đề tài:', err);
        }
      });
    }
  }

  onDeleteDeTai(maDeTai: string): void {
    if (confirm(`Bạn có chắc chắn muốn xóa Đề tài '${maDeTai}' không?`)) {
      this.deTaiService.deleteDeTai(maDeTai).subscribe({
        next: (_) => {
          this.successMessage = `Đề tài '${maDeTai}' đã được xóa thành công!`;
          this.refreshDeTaiList();
          this.resetForm();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi khi xóa đề tài: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi xóa đề tài:', err);
        }
      });
    }
  }

  resetForm(): void {
    this.deTaiForm.reset();
    this.selectedDeTai = null;
    this.deTaiForm.get('maDeTai')?.enable();
    this.clearMessages();
    this.deTaiForm.get('trangThaiDangKy')?.setValue('Chờ duyệt'); // Đặt lại trạng thái mặc định
    this.deTaiForm.get('maGV')?.setValue('');
    this.deTaiForm.get('maDotDoAn')?.setValue('');
    this.deTaiForm.get('maSV')?.setValue('');
  }

  refreshDeTaiList(): void {
    this.refreshTriggerSubject.next();
  }

  onSearchTermChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchTermSubject.next(searchTerm);
  }

  onGvFilterChange(event: Event): void {
    const gvId = (event.target as HTMLSelectElement).value;
    this.gvFilterSubject.next(gvId);
    // Khi thay đổi bộ lọc GV, các bộ lọc khác nên được reset hoặc xem xét lại
    this.dotDoAnFilterSubject.next('');
    this.statusFilterSubject.next('Tất cả');
  }

  onDotDoAnFilterChange(event: Event): void {
    const dotDoAnId = (event.target as HTMLSelectElement).value;
    this.dotDoAnFilterSubject.next(dotDoAnId);
    // Khi thay đổi bộ lọc Đợt Đồ án, các bộ lọc khác nên được reset hoặc xem xét lại
    this.gvFilterSubject.next('');
    this.statusFilterSubject.next('Tất cả');
  }

  onStatusFilterChange(event: Event): void {
    const status = (event.target as HTMLSelectElement).value;
    this.statusFilterSubject.next(status);
    // Đảm bảo không reset các bộ lọc khác khi chỉ thay đổi trạng thái
  }

  // Helpers để lấy tên từ ID
  getGiangVienTen(maGV?: string): string {
    const gv = this.giangVienList.find(g => g.maGV === maGV);
    return gv ? gv.hoTen : 'N/A';
  }

  getDotDoAnTen(maDotDoAn?: string): string {
    const dot = this.dotDoAnList.find(d => d.maDotDoAn === maDotDoAn);
    return dot ? dot.tenDotDoAn : 'N/A';
  }

  getSinhVienTen(maSV?: string): string {
    const sv = this.sinhVienList.find(s => s.maSV === maSV);
    return sv ? sv.hoTen : 'Chưa phân công';
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}