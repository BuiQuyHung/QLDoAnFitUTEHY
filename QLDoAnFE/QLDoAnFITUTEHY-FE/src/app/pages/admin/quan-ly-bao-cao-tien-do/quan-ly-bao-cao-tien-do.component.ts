import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, startWith, map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import { BaoCaoTienDoService } from '../../../services/bao-cao-tien-do.service';
import { DeTaiService } from '../../../services/de-tai.service';
import { SinhVienService } from '../../../services/sinh-vien.service';
import { GiangVienService } from '../../../services/giang-vien.service';

import { BaoCaoTienDo } from '../../../models/BaoCaoTienDo';
import { DeTai } from '../../../models/DeTai';
import { SinhVien } from '../../../models/SinhVien';
import { GiangVien } from '../../../models/GiangVien';


@Component({
  selector: 'app-quan-ly-bao-cao-tien-do',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe
  ],
  templateUrl: './quan-ly-bao-cao-tien-do.component.html',
  styleUrls: ['./quan-ly-bao-cao-tien-do.component.css']
})
export class QuanLyBaoCaoTienDoComponent implements OnInit {
  baoCaoList: BaoCaoTienDo[] = [];
  originalBaoCaoList: BaoCaoTienDo[] = [];
  deTaiList: DeTai[] = [];
  sinhVienList: SinhVien[] = [];
  giangVienList: GiangVien[] = [];

  reviewForm: FormGroup;
  selectedBaoCao: BaoCaoTienDo | null = null;

  errorMessage: string = '';
  successMessage: string = '';

  private searchTermSubject = new Subject<string>();
  private deTaiFilterSubject = new Subject<string>();
  private refreshTriggerSubject = new Subject<void>();

  currentSearchTerm: string = '';
  currentDeTaiFilter: string = '';

  trangThaiDuyetOptions: string[] = ['Đã đánh giá', 'Cần sửa đổi', 'Chờ đánh giá']; 

  constructor(
    private baoCaoTienDoService: BaoCaoTienDoService,
    private deTaiService: DeTaiService,
    private sinhVienService: SinhVienService,
    private giangVienService: GiangVienService,
    private fb: FormBuilder
  ) {
    this.reviewForm = this.fb.group({
      nhanXetCuaGV: ['', Validators.required],
      diemSo: [null, [Validators.required, Validators.min(0), Validators.max(10)]],
      trangThai: ['Đã đánh giá', Validators.required], 
      ngayNhanXet: [this.formatDate(new Date()), Validators.required]
    });

  }

  ngOnInit(): void {
    this.loadAllDropdownData();

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

        return this.baoCaoTienDoService.getAllBaoCaoTienDo().pipe(
          map(baocaos => {
            let filtered = baocaos;
            if (deTaiFilter) {
              filtered = filtered.filter(bc => bc.maDeTai === deTaiFilter);
            }
            if (searchTerm) {
              filtered = filtered.filter(baoCao =>
                (baoCao.maBaoCao?.toString().toLowerCase().includes(searchTerm.toLowerCase())) ||
                (baoCao.ghiChuCuaSV?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (baoCao.loaiBaoCao?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (baoCao.maDeTai && this.getDeTaiTen(baoCao.maDeTai).toLowerCase().includes(searchTerm.toLowerCase())) ||
                (baoCao.maSV && this.getTenSinhVien(baoCao.maSV).toLowerCase().includes(searchTerm.toLowerCase()))
              );
            }
            return filtered;
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
      this.baoCaoList = data;
    });
  }

  loadAllDropdownData(): void {
    this.deTaiService.getDeTais().subscribe({
      next: (data) => this.deTaiList = data,
      error: (err: HttpErrorResponse) => console.error('Lỗi tải đề tài:', err)
    });
    this.sinhVienService.searchSinhVien().subscribe({
      next: (data) => this.sinhVienList = data,
      error: (err: HttpErrorResponse) => console.error('Lỗi tải sinh viên:', err)
    });
    this.giangVienService.searchGiangVien().subscribe({
      next: (data) => this.giangVienList = data,
      error: (err: HttpErrorResponse) => console.error('Lỗi tải giảng viên:', err)
    });
  }

  onSelectBaoCao(baoCao: BaoCaoTienDo): void {
    this.selectedBaoCao = baoCao;
    this.clearMessages();

    this.reviewForm.reset();
    this.reviewForm.patchValue({
      nhanXetCuaGV: baoCao.nhanXetCuaGV || '',
      diemSo: baoCao.diemSo ?? null,
      trangThai: baoCao.trangThai || 'Chờ đánh giá',
      ngayNhanXet: baoCao.ngayNhanXet ? this.formatDate(new Date(baoCao.ngayNhanXet)) : this.formatDate(new Date())
    });
  }

  onSubmitReview(): void {
    if (!this.selectedBaoCao || typeof this.selectedBaoCao.maBaoCao !== 'number') {
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
      ngayNhanXet: new Date(this.reviewForm.value.ngayNhanXet)
    };

    this.baoCaoTienDoService.danhGiaBaoCaoTienDo(this.selectedBaoCao.maBaoCao, reviewData).subscribe({
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

  onDeleteBaoCao(maBaoCao: number): void {
    if (confirm(`Bạn có chắc chắn muốn xóa Báo cáo Tiến độ ID '${maBaoCao}' không?`)) {
      this.baoCaoTienDoService.deleteBaoCaoTienDo(maBaoCao).subscribe({
        next: (_) => {
          this.successMessage = `Báo cáo Tiến độ ID '${maBaoCao}' đã được xóa thành công!`;
          this.refreshBaoCaoList();
          this.resetForm(); 
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi khi xóa báo cáo: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi xóa báo cáo:', err);
        }
      });
    }
  }

  onDownloadFile(url?: string | null): void {
    if (!url) {
      this.errorMessage = 'Không có tệp đính kèm để mở.';
      return;
    }
    window.open(url, '_blank');
    this.successMessage = 'Đang mở tệp đính kèm trong tab mới.';
  }
  resetForm(): void {
    this.reviewForm.reset();
    this.selectedBaoCao = null;
    this.clearMessages();
    this.reviewForm.patchValue({
      ngayNhanXet: this.formatDate(new Date()),
      trangThai: 'Đã đánh giá'
    });
  }

  cancelReview(): void {
    this.resetForm();
    this.successMessage = 'Đã hủy thao tác nhận xét.';
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
    const deTai = this.deTaiList.find(dt => dt.maDeTai === maDeTai);
    return deTai ? deTai.tenDeTai : 'N/A';
  }

  getTenSinhVien(maSV?: string): string {
    const sv = this.sinhVienList.find(s => s.maSV === maSV);
    return sv ? sv.hoTen : 'N/A';
  }

  getTenGiangVien(maGV: string | null | undefined): string {
    if (maGV === null || maGV === undefined) {
      return 'N/A';
    }
    const giangVien = this.giangVienList.find(gv => gv.maGV === maGV);
    return giangVien ? giangVien.hoTen : 'Không xác định';
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