// src/app/pages/admin/quan-ly-lop/quan-ly-lop.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LopService } from '../../../services/lop.service';
import { ChuyenNganhService } from '../../../services/chuyen-nganh.service'; // Cần để lấy danh sách Chuyên Ngành
import { Lop } from '../../../models/Lop';
import { ChuyenNganh } from '../../../models/ChuyenNganh'; // Import model ChuyenNganh
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-quan-ly-lop',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './quan-ly-lop.component.html',
  styleUrls: ['./quan-ly-lop.component.css']
})
export class QuanLyLopComponent implements OnInit {
  lopList: Lop[] = [];
  originalLopList: Lop[] = [];
  chuyenNganhList: ChuyenNganh[] = []; // Danh sách Chuyên Ngành cho dropdown
  lopForm: FormGroup;
  selectedLop: Lop | null = null;

  errorMessage: string = '';
  successMessage: string = '';

  private searchTermSubject = new Subject<string>();
  private chuyenNganhFilterSubject = new Subject<string>(); // Lọc theo Chuyên Ngành
  private refreshTriggerSubject = new Subject<void>();

  currentSearchTerm: string = '';
  currentChuyenNganhFilter: string = '';

  constructor(
    private lopService: LopService,
    private chuyenNganhService: ChuyenNganhService, // Inject ChuyenNganhService
    private fb: FormBuilder
  ) {
    this.lopForm = this.fb.group({
      maLop: ['', Validators.required],
      tenLop: ['', Validators.required],
      maChuyenNganh: ['', Validators.required] // Trường khóa ngoại
    });
  }

  ngOnInit(): void {
    this.loadChuyenNganhList(); // Tải danh sách Chuyên Ngành cho dropdown

    this.searchTermSubject.next('');
    this.chuyenNganhFilterSubject.next('');

    combineLatest([
      this.searchTermSubject.pipe(startWith(this.currentSearchTerm), debounceTime(300), distinctUntilChanged()),
      this.chuyenNganhFilterSubject.pipe(startWith(this.currentChuyenNganhFilter), distinctUntilChanged()),
      this.refreshTriggerSubject.pipe(startWith(undefined as void))
    ]).pipe(
      switchMap(([searchTerm, chuyenNganhFilter, refreshTrigger]) => {
        this.currentSearchTerm = searchTerm;
        this.currentChuyenNganhFilter = chuyenNganhFilter;
        this.clearMessages();

        if (chuyenNganhFilter) {
          // Nếu có lọc theo Chuyên Ngành
          return this.lopService.getLopByChuyenNganhId(chuyenNganhFilter).pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Lỗi khi tải lớp theo chuyên ngành:', error);
              this.errorMessage = `Không thể tải lớp cho chuyên ngành '${this.getChuyenNganhTen(chuyenNganhFilter)}'.`;
              return of([]);
            })
          );
        } else {
          // Nếu không có lọc theo Chuyên Ngành, tải tất cả hoặc tìm kiếm theo term
          return this.lopService.searchLop(searchTerm).pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Lỗi khi tải danh sách lớp:', error);
              this.errorMessage = 'Không thể tải danh sách lớp.';
              return of([]);
            })
          );
        }
      })
    ).subscribe(data => {
      this.originalLopList = data;
      this.applyClientSideFilters(); // Áp dụng lọc tìm kiếm (nếu có)
    });
  }

  // Tải danh sách Chuyên Ngành cho dropdown lọc và form
  loadChuyenNganhList(): void {
    this.chuyenNganhService.searchChuyenNganh().subscribe({ // Sử dụng searchChuyenNganh để lấy tất cả
      next: (data) => {
        this.chuyenNganhList = data;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Lỗi khi tải danh sách chuyên ngành:', err);
        this.errorMessage = 'Không thể tải danh sách chuyên ngành để lọc.';
      }
    });
  }

  // Áp dụng bộ lọc tìm kiếm trên client-side
  applyClientSideFilters(): void {
    let filteredList = [...this.originalLopList]; 

    if (this.currentSearchTerm) {
      filteredList = filteredList.filter(lop =>
        lop.tenLop.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
        lop.maLop.toLowerCase().includes(this.currentSearchTerm.toLowerCase())
      );
    }
    this.lopList = filteredList; 
  }

  onSelectLop(lop: Lop): void {
    this.selectedLop = lop;
    this.lopForm.patchValue({
      maLop: lop.maLop,
      tenLop: lop.tenLop,
      maChuyenNganh: lop.maChuyenNganh
    });
    this.lopForm.get('maLop')?.disable(); // Tắt trường mã khi chỉnh sửa
    this.clearMessages();
  }

  onSubmit(): void {
    const formData = this.lopForm.getRawValue(); 

    if (this.lopForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ và đúng thông tin.';
      this.lopForm.markAllAsTouched(); 
      return;
    }

    if (this.selectedLop) {
      this.lopService.updateLop(this.selectedLop.maLop, formData).subscribe({
        next: (_) => {
          this.successMessage = 'Cập nhật lớp thành công!';
          this.resetForm();
          this.refreshLopList(); 
        },
        error: (err: HttpErrorResponse) => { 
          this.errorMessage = 'Lỗi khi cập nhật lớp: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi cập nhật lớp:', err);
        }
      });
    } else {
      this.lopService.addLop(formData).subscribe({
        next: (_) => {
          this.successMessage = 'Thêm mới lớp thành công!';
          this.resetForm();
          this.refreshLopList(); 
        },
        error: (err: HttpErrorResponse) => { 
          this.errorMessage = 'Lỗi khi thêm mới lớp: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi thêm mới lớp:', err);
        }
      });
    }
  }

  onDeleteLop(maLop: string): void {
    if (confirm(`Bạn có chắc chắn muốn xóa Lớp '${maLop}' không?`)) {
      this.lopService.deleteLop(maLop).subscribe({
        next: (_) => {
          this.successMessage = `Lớp '${maLop}' đã được xóa thành công!`;
          this.refreshLopList(); 
          this.resetForm(); 
        },
        error: (err: HttpErrorResponse) => { 
          this.errorMessage = 'Lỗi khi xóa lớp: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi xóa lớp:', err);
        }
      });
    }
  }

  resetForm(): void {
    this.lopForm.reset();
    this.selectedLop = null;
    this.lopForm.get('maLop')?.enable(); 
    this.clearMessages();
    this.lopForm.get('maChuyenNganh')?.setValue(''); // Đảm bảo dropdown chuyên ngành được reset
  }

  refreshLopList(): void {
    this.refreshTriggerSubject.next();
  }

  onSearchTermChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchTermSubject.next(searchTerm);
  }

  onChuyenNganhFilterChange(event: Event): void {
    const chuyenNganhId = (event.target as HTMLSelectElement).value;
    this.chuyenNganhFilterSubject.next(chuyenNganhId);
  }

  getChuyenNganhTen(maChuyenNganh: string): string {
    const chuyenNganh = this.chuyenNganhList.find(cn => cn.maChuyenNganh === maChuyenNganh);
    return chuyenNganh ? chuyenNganh.tenChuyenNganh : 'N/A';
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}