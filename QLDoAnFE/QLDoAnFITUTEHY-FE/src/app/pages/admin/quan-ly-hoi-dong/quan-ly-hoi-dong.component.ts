import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HoiDongService } from '../../../services/hoi-dong.service'; // Đảm bảo đường dẫn đúng
import { DotDoAnService } from '../../../services/dot-do-an.service'; // Cần để lấy danh sách Đợt Đồ án
import { HoiDong } from '../../../models/HoiDong'; // Đảm bảo đường dẫn đúng
import { DotDoAn } from '../../../models/DotDoAn'; // Import model DotDoAn, đảm bảo casing đúng

import { HttpErrorResponse } from '@angular/common/http';
import { Subject, combineLatest, of, throwError } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-quan-ly-hoi-dong',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './quan-ly-hoi-dong.component.html',
  styleUrls: ['./quan-ly-hoi-dong.component.css']
})
export class QuanLyHoiDongComponent implements OnInit {
  hoiDongList: HoiDong[] = [];
  originalHoiDongList: HoiDong[] = [];
  dotDoAnList: DotDoAn[] = []; // Danh sách Đợt Đồ án cho dropdown

  hoiDongForm: FormGroup;
  selectedHoiDong: HoiDong | null = null;

  errorMessage: string = '';
  successMessage: string = '';

  private searchTermSubject = new Subject<string>();
  private dotDoAnFilterSubject = new Subject<string>(); // Lọc theo Đợt Đồ án
  private refreshTriggerSubject = new Subject<void>();

  currentSearchTerm: string = '';
  currentDotDoAnFilter: string = '';

  constructor(
    private hoiDongService: HoiDongService,
    private dotDoAnService: DotDoAnService, // Inject DotDoAnService
    private fb: FormBuilder
  ) {
    this.hoiDongForm = this.fb.group({
      maHoiDong: ['', Validators.required],
      tenHoiDong: ['', Validators.required],
      ngayBaoVe: [''], // Ngày bảo vệ có thể không bắt buộc
      maDotDoAn: ['', Validators.required] // Trường khóa ngoại
    });
  }

  ngOnInit(): void {
    this.loadDotDoAnList(); // Tải danh sách Đợt Đồ án cho dropdown

    this.searchTermSubject.next('');
    this.dotDoAnFilterSubject.next('');

    combineLatest([
      this.searchTermSubject.pipe(startWith(this.currentSearchTerm), debounceTime(300), distinctUntilChanged()),
      this.dotDoAnFilterSubject.pipe(startWith(this.currentDotDoAnFilter), distinctUntilChanged()),
      this.refreshTriggerSubject.pipe(startWith(undefined as void))
    ]).pipe(
      switchMap(([searchTerm, dotDoAnFilter, refreshTrigger]) => {
        this.currentSearchTerm = searchTerm;
        this.currentDotDoAnFilter = dotDoAnFilter;
        this.clearMessages();

        if (dotDoAnFilter) {
          // Nếu có lọc theo Đợt Đồ án
          return this.hoiDongService.getHoiDongByDotDoAnId(dotDoAnFilter).pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Lỗi khi tải hội đồng theo đợt đồ án:', error);
              this.errorMessage = `Không thể tải hội đồng cho đợt đồ án '${this.getDotDoAnTen(dotDoAnFilter)}'.`;
              return of([]);
            })
          );
        } else {
          // Nếu không có lọc theo Đợt Đồ án, tải tất cả hoặc tìm kiếm theo term
          return this.hoiDongService.searchHoiDong(searchTerm).pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Lỗi khi tải danh sách hội đồng:', error);
              this.errorMessage = 'Không thể tải danh sách hội đồng.';
              return of([]);
            })
          );
        }
      })
    ).subscribe(data => {
      this.originalHoiDongList = data;
      this.applyClientSideFilters(); // Áp dụng lọc tìm kiếm (nếu có)
    });
  }

  // Tải danh sách Đợt Đồ án cho dropdown lọc và form
  loadDotDoAnList(): void {
    this.dotDoAnService.getAllDotDoAn().subscribe({ // Sử dụng getAllDotDoAn để lấy tất cả
      next: (data) => {
        this.dotDoAnList = data;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Lỗi khi tải danh sách đợt đồ án:', err);
        this.errorMessage = 'Không thể tải danh sách đợt đồ án để lọc.';
      }
    });
  }

  // Áp dụng bộ lọc tìm kiếm trên client-side
  applyClientSideFilters(): void {
    let filteredList = [...this.originalHoiDongList];

    if (this.currentSearchTerm) {
      filteredList = filteredList.filter(hoiDong =>
        hoiDong.tenHoiDong.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
        hoiDong.maHoiDong.toLowerCase().includes(this.currentSearchTerm.toLowerCase())
      );
    }
    this.hoiDongList = filteredList;
  }

  onSelectHoiDong(hoiDong: HoiDong): void {
    this.selectedHoiDong = hoiDong;
    this.hoiDongForm.patchValue({
      maHoiDong: hoiDong.maHoiDong,
      tenHoiDong: hoiDong.tenHoiDong,
      // Chuyển đổi Date sang định dạng 'yyyy-MM-dd' cho input type="date"
      ngayBaoVe: hoiDong.ngayBaoVe ? new Date(hoiDong.ngayBaoVe).toISOString().substring(0, 10) : '',
      maDotDoAn: hoiDong.maDotDoAn
    });
    this.hoiDongForm.get('maHoiDong')?.disable(); // Tắt trường mã khi chỉnh sửa
    this.clearMessages();
  }

  onSubmit(): void {
    const formData = this.hoiDongForm.getRawValue();

    if (this.hoiDongForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ và đúng thông tin.';
      this.hoiDongForm.markAllAsTouched();
      return;
    }

    // Chuyển đổi ngày bảo vệ từ string sang Date nếu có
    if (formData.ngayBaoVe) {
      formData.ngayBaoVe = new Date(formData.ngayBaoVe);
    }

    if (this.selectedHoiDong) {
      this.hoiDongService.updateHoiDong(this.selectedHoiDong.maHoiDong, formData).subscribe({
        next: (_) => {
          this.successMessage = 'Cập nhật hội đồng thành công!';
          this.resetForm();
          this.refreshHoiDongList();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi khi cập nhật hội đồng: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi cập nhật hội đồng:', err);
        }
      });
    } else {
      this.hoiDongService.addHoiDong(formData).subscribe({
        next: (_) => {
          this.successMessage = 'Thêm mới hội đồng thành công!';
          this.resetForm();
          this.refreshHoiDongList();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi khi thêm mới hội đồng: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi thêm mới hội đồng:', err);
        }
      });
    }
  }

  onDeleteHoiDong(maHoiDong: string): void {
    if (confirm(`Bạn có chắc chắn muốn xóa Hội Đồng '${maHoiDong}' không?`)) {
      this.hoiDongService.deleteHoiDong(maHoiDong).subscribe({
        next: (_) => {
          this.successMessage = `Hội Đồng '${maHoiDong}' đã được xóa thành công!`;
          this.refreshHoiDongList();
          this.resetForm();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi khi xóa hội đồng: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi xóa hội đồng:', err);
        }
      });
    }
  }

  resetForm(): void {
    this.hoiDongForm.reset();
    this.selectedHoiDong = null;
    this.hoiDongForm.get('maHoiDong')?.enable();
    this.clearMessages();
    this.hoiDongForm.get('maDotDoAn')?.setValue(''); // Đảm bảo dropdown đợt đồ án được reset
  }

  refreshHoiDongList(): void {
    this.refreshTriggerSubject.next();
  }

  onSearchTermChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchTermSubject.next(searchTerm);
  }

  onDotDoAnFilterChange(event: Event): void {
    const dotDoAnId = (event.target as HTMLSelectElement).value;
    this.dotDoAnFilterSubject.next(dotDoAnId);
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
