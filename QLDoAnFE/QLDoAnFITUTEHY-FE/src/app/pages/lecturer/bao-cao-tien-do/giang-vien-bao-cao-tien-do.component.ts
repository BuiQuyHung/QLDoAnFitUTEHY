import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, startWith, map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import { BaoCaoTienDoService } from '../../../services/bao-cao-tien-do.service';
import { DeTaiService } from '../../../services/de-tai.service';
import { BaoCaoTienDo } from '../../../models/BaoCaoTienDo';
import { DeTai } from '../../../models/DeTai';
import { AuthService } from '../../../services/auth.service'; 

@Component({
  selector: 'app-giang-vien-bao-cao-tien-do',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe
  ],
  templateUrl: './giang-vien-bao-cao-tien-do.component.html',
  styleUrls: ['./giang-vien-bao-cao-tien-do.component.css']
})
export class GiangVienBaoCaoTienDoComponent implements OnInit {
  baoCaoList: BaoCaoTienDo[] = [];
  originalBaoCaoList: BaoCaoTienDo[] = [];
  deTaiHuongDanList: DeTai[] = [];

  reviewForm: FormGroup;
  selectedBaoCao: BaoCaoTienDo | null = null;

  errorMessage: string = '';
  successMessage: string = '';

  private searchTermSubject = new Subject<string>();
  private deTaiFilterSubject = new Subject<string>();
  private refreshTriggerSubject = new Subject<void>();

  currentSearchTerm: string = '';
  currentDeTaiFilter: string = '';
  currentMaGV: string | null = null;

  constructor(
    private baoCaoTienDoService: BaoCaoTienDoService,
    private deTaiService: DeTaiService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.reviewForm = this.fb.group({
      nhanXetCuaGV: ['', Validators.required],
      diemSo: ['', [Validators.required, Validators.min(0), Validators.max(10)]],
      trangThai: ['Đã duyệt', Validators.required],
      ngayDuyet: [this.formatDate(new Date()), Validators.required]
    });
  }

 ngOnInit(): void {
    // --- DÒNG ĐÃ SỬA ---
    // Sử dụng currentUserValue để lấy giá trị hiện tại của UserInfo
    // Và kiểm tra xem có phải là Giảng viên (GV) không trước khi lấy maGV
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.role === 'GV') {
      this.currentMaGV = currentUser.maGV || null;
    }
    // Hoặc nếu bạn muốn lấy bất kể vai trò gì, chỉ cần:
    // this.currentMaGV = this.authService.currentUserValue.maGV || null;


    if (!this.currentMaGV) {
      this.errorMessage = 'Không tìm thấy thông tin giảng viên hoặc vai trò không hợp lệ. Vui lòng đăng nhập lại.';
      return;
    }

    this.loadGiangVienDeTai(this.currentMaGV);

    this.searchTermSubject.next('');
    this.deTaiFilterSubject.next('');

    combineLatest([
      this.searchTermSubject.pipe(startWith(this.currentSearchTerm), debounceTime(300), distinctUntilChanged()),
      this.deTaiFilterSubject.pipe(startWith(this.currentDeTaiFilter), distinctUntilChanged()),
      this.refreshTriggerSubject.pipe(startWith(undefined as void))
    ]).pipe(
      switchMap(([searchTerm, deTaiFilter, refreshTrigger]) => {
        this.currentSearchTerm = searchTerm;
        this.currentDeTaiFilter = deTaiFilter;
        this.clearMessages();

        return this.baoCaoTienDoService.getBaoCaoTienDos().pipe(
          map(baocaos => {
            const deTaiIdsHuongDan = this.deTaiHuongDanList.map(dt => dt.maDeTai);
            let filteredByDeTai = baocaos.filter(bc => deTaiIdsHuongDan.includes(bc.maDeTai));

            if (deTaiFilter) {
              filteredByDeTai = filteredByDeTai.filter(bc => bc.maDeTai === deTaiFilter);
            }
            return filteredByDeTai;
          }),
          catchError((error: HttpErrorResponse) => {
            console.error('Lỗi khi tải danh sách báo cáo tiến độ:', error);
            this.errorMessage = 'Không thể tải danh sách báo cáo tiến độ.';
            return of([]);
          })
        );
      })
    ).subscribe(data => {
      this.originalBaoCaoList = data;
      this.applyClientSideFilters();
    });
  }

  loadGiangVienDeTai(maGV: string): void {
    this.deTaiService.getDeTaisByGiangVienId(maGV).subscribe({
      next: (data) => this.deTaiHuongDanList = data,
      error: (err: HttpErrorResponse) => {
        console.error('Lỗi tải đề tài của giảng viên:', err);
        this.errorMessage = 'Không thể tải danh sách đề tài bạn hướng dẫn.';
      }
    });
  }

  applyClientSideFilters(): void {
    let filteredList = [...this.originalBaoCaoList];

    // Lọc theo search term
    if (this.currentSearchTerm) {
      filteredList = filteredList.filter(baoCao =>
        baoCao.noiDungBaoCao.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
        baoCao.maBaoCao.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
        (baoCao.maDeTai && this.getDeTaiTen(baoCao.maDeTai).toLowerCase().includes(this.currentSearchTerm.toLowerCase()))
      );
    }
    this.baoCaoList = filteredList;
  }

  onSelectBaoCao(baoCao: BaoCaoTienDo): void {
    this.selectedBaoCao = baoCao;
    this.clearMessages();

    this.reviewForm.reset();
    this.reviewForm.patchValue({
      nhanXetCuaGV: baoCao.nhanXetCuaGV || '',
      diemSo: baoCao.diemSo || null,
      trangThai: baoCao.trangThai || 'Đã duyệt',
      ngayDuyet: baoCao.ngayDuyet ? this.formatDate(new Date(baoCao.ngayDuyet)) : this.formatDate(new Date())
    });
  }

  onSubmitReview(): void {
    if (!this.selectedBaoCao) {
      this.errorMessage = 'Vui lòng chọn một báo cáo để nhận xét.';
      return;
    }

    if (this.reviewForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ và đúng thông tin nhận xét.';
      this.reviewForm.markAllAsTouched();
      return;
    }

    const reviewData = {
      ...this.reviewForm.value,
      ngayDuyet: new Date(this.reviewForm.value.ngayDuyet)
    };

    this.baoCaoTienDoService.reviewBaoCaoTienDo(this.selectedBaoCao.maBaoCao, reviewData).subscribe({
      next: (_) => {
        this.successMessage = 'Nhận xét và cập nhật trạng thái báo cáo thành công!';
        this.resetForm();
        this.refreshBaoCaoList();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = 'Lỗi khi nhận xét báo cáo: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
        console.error('Lỗi nhận xét báo cáo:', err);
      }
    });
  }

  resetForm(): void {
    this.reviewForm.reset();
    this.selectedBaoCao = null;
    this.clearMessages();
    this.reviewForm.patchValue({
      ngayDuyet: this.formatDate(new Date()),
      trangThai: 'Đã duyệt'
    });
  }

  refreshBaoCaoList(): void {
    this.refreshTriggerSubject.next();
  }

  onSearchTermChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchTermSubject.next(searchTerm);
  }

  onDeTaiFilterChange(event: Event): void {
    const deTaiId = (event.target as HTMLSelectElement).value;
    this.deTaiFilterSubject.next(deTaiId);
  }

  getDeTaiTen(maDeTai?: string): string {
    const deTai = this.deTaiHuongDanList.find(dt => dt.maDeTai === maDeTai);
    return deTai ? deTai.tenDeTai : 'N/A';
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}