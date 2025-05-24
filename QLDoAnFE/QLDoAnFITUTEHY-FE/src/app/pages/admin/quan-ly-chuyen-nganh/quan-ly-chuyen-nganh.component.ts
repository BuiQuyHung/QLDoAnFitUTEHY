// src/app/pages/admin/quan-ly-chuyen-nganh/quan-ly-chuyen-nganh.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChuyenNganhService } from '../../../services/chuyen-nganh.service';
import { NganhService } from '../../../services/nganh.service'; // Cần để lấy danh sách Ngành
import { ChuyenNganh } from '../../../models/ChuyenNganh';
import { Nganh } from '../../../models/Nganh'; // Import model Nganh
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-quan-ly-chuyen-nganh',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './quan-ly-chuyen-nganh.component.html',
  styleUrls: ['./quan-ly-chuyen-nganh.component.css']
})
export class QuanLyChuyenNganhComponent implements OnInit {
  chuyenNganhList: ChuyenNganh[] = [];
  originalChuyenNganhList: ChuyenNganh[] = [];
  nganhList: Nganh[] = []; // Danh sách Ngành cho dropdown
  chuyenNganhForm: FormGroup;
  selectedChuyenNganh: ChuyenNganh | null = null;

  errorMessage: string = '';
  successMessage: string = '';

  private searchTermSubject = new Subject<string>();
  private nganhFilterSubject = new Subject<string>(); // Lọc theo Ngành
  private refreshTriggerSubject = new Subject<void>();

  currentSearchTerm: string = '';
  currentNganhFilter: string = '';

  constructor(
    private chuyenNganhService: ChuyenNganhService,
    private nganhService: NganhService, // Inject NganhService
    private fb: FormBuilder
  ) {
    this.chuyenNganhForm = this.fb.group({
      maChuyenNganh: ['', Validators.required],
      tenChuyenNganh: ['', Validators.required],
      maNganh: ['', Validators.required] // Trường khóa ngoại
    });
  }

  ngOnInit(): void {
    this.loadNganhList(); // Tải danh sách Ngành cho dropdown

    this.searchTermSubject.next('');
    this.nganhFilterSubject.next('');

    combineLatest([
      this.searchTermSubject.pipe(startWith(this.currentSearchTerm), debounceTime(300), distinctUntilChanged()),
      this.nganhFilterSubject.pipe(startWith(this.currentNganhFilter), distinctUntilChanged()),
      this.refreshTriggerSubject.pipe(startWith(undefined as void))
    ]).pipe(
      switchMap(([searchTerm, nganhFilter, refreshTrigger]) => {
        this.currentSearchTerm = searchTerm;
        this.currentNganhFilter = nganhFilter;
        this.clearMessages();

        if (nganhFilter) {
          // Nếu có lọc theo Ngành
          return this.chuyenNganhService.getChuyenNganhByNganhId(nganhFilter).pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Lỗi khi tải chuyên ngành theo ngành:', error);
              this.errorMessage = `Không thể tải chuyên ngành cho ngành '${this.getNganhTen(nganhFilter)}'.`;
              return of([]);
            })
          );
        } else {
          // Nếu không có lọc theo Ngành, tải tất cả hoặc tìm kiếm theo term
          return this.chuyenNganhService.searchChuyenNganh(searchTerm).pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Lỗi khi tải danh sách chuyên ngành:', error);
              this.errorMessage = 'Không thể tải danh sách chuyên ngành.';
              return of([]);
            })
          );
        }
      })
    ).subscribe(data => {
      this.originalChuyenNganhList = data;
      this.applyClientSideFilters(); // Áp dụng lọc tìm kiếm (nếu có)
    });
  }

  // Tải danh sách Ngành cho dropdown lọc và form
  loadNganhList(): void {
    this.nganhService.searchNganh().subscribe({ // Sử dụng searchNganh để lấy tất cả
      next: (data) => {
        this.nganhList = data;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Lỗi khi tải danh sách ngành:', err);
        this.errorMessage = 'Không thể tải danh sách ngành để lọc.';
      }
    });
  }

  // Áp dụng bộ lọc tìm kiếm trên client-side
  applyClientSideFilters(): void {
    let filteredList = [...this.originalChuyenNganhList]; 

    if (this.currentSearchTerm) {
      filteredList = filteredList.filter(chuyenNganh =>
        chuyenNganh.tenChuyenNganh.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
        chuyenNganh.maChuyenNganh.toLowerCase().includes(this.currentSearchTerm.toLowerCase())
      );
    }
    this.chuyenNganhList = filteredList; 
  }

  onSelectChuyenNganh(chuyenNganh: ChuyenNganh): void {
    this.selectedChuyenNganh = chuyenNganh;
    this.chuyenNganhForm.patchValue({
      maChuyenNganh: chuyenNganh.maChuyenNganh,
      tenChuyenNganh: chuyenNganh.tenChuyenNganh,
      maNganh: chuyenNganh.maNganh
    });
    this.chuyenNganhForm.get('maChuyenNganh')?.disable(); // Tắt trường mã khi chỉnh sửa
    this.clearMessages();
  }

  onSubmit(): void {
    const formData = this.chuyenNganhForm.getRawValue(); 

    if (this.chuyenNganhForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ và đúng thông tin.';
      this.chuyenNganhForm.markAllAsTouched(); 
      return;
    }

    if (this.selectedChuyenNganh) {
      this.chuyenNganhService.updateChuyenNganh(this.selectedChuyenNganh.maChuyenNganh, formData).subscribe({
        next: (_) => {
          this.successMessage = 'Cập nhật chuyên ngành thành công!';
          this.resetForm();
          this.refreshChuyenNganhList(); 
        },
        error: (err: HttpErrorResponse) => { // Sử dụng HttpErrorResponse
          this.errorMessage = 'Lỗi khi cập nhật chuyên ngành: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi cập nhật chuyên ngành:', err);
        }
      });
    } else {
      this.chuyenNganhService.addChuyenNganh(formData).subscribe({
        next: (_) => {
          this.successMessage = 'Thêm mới chuyên ngành thành công!';
          this.resetForm();
          this.refreshChuyenNganhList(); 
        },
        error: (err: HttpErrorResponse) => { // Sử dụng HttpErrorResponse
          this.errorMessage = 'Lỗi khi thêm mới chuyên ngành: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi thêm mới chuyên ngành:', err);
        }
      });
    }
  }

  onDeleteChuyenNganh(maChuyenNganh: string): void {
    if (confirm(`Bạn có chắc chắn muốn xóa Chuyên Ngành '${maChuyenNganh}' không?`)) {
      this.chuyenNganhService.deleteChuyenNganh(maChuyenNganh).subscribe({
        next: (_) => {
          this.successMessage = `Chuyên Ngành '${maChuyenNganh}' đã được xóa thành công!`;
          this.refreshChuyenNganhList(); 
          this.resetForm(); 
        },
        error: (err: HttpErrorResponse) => { // Sử dụng HttpErrorResponse
          this.errorMessage = 'Lỗi khi xóa chuyên ngành: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi xóa chuyên ngành:', err);
        }
      });
    }
  }

  resetForm(): void {
    this.chuyenNganhForm.reset();
    this.selectedChuyenNganh = null;
    this.chuyenNganhForm.get('maChuyenNganh')?.enable(); 
    this.clearMessages();
    this.chuyenNganhForm.get('maNganh')?.setValue(''); // Đảm bảo dropdown ngành được reset
  }

  refreshChuyenNganhList(): void {
    this.refreshTriggerSubject.next();
  }

  onSearchTermChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchTermSubject.next(searchTerm);
  }

  onNganhFilterChange(event: Event): void {
    const nganhId = (event.target as HTMLSelectElement).value;
    this.nganhFilterSubject.next(nganhId);
  }

  getNganhTen(maNganh: string): string {
    const nganh = this.nganhList.find(n => n.maNganh === maNganh);
    return nganh ? nganh.tenNganh : 'N/A';
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}