import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GiangVienService } from '../../../services/giang-vien.service';
import { ChuyenNganhService } from '../../../services/chuyen-nganh.service'; 
import { GiangVien } from '../../../models/GiangVien';
import { ChuyenNganh } from '../../../models/ChuyenNganh'; 
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-quan-ly-giang-vien',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './quan-ly-giang-vien.component.html',
  styleUrls: ['./quan-ly-giang-vien.component.css']
})
export class QuanLyGiangVienComponent implements OnInit {
  giangVienList: GiangVien[] = [];
  originalGiangVienList: GiangVien[] = [];
  chuyenNganhList: ChuyenNganh[] = []; 
  giangVienForm: FormGroup;
  selectedGiangVien: GiangVien | null = null;

  errorMessage: string = '';
  successMessage: string = '';

  private searchTermSubject = new Subject<string>();
  private chuyenNganhFilterSubject = new Subject<string>(); 
  private refreshTriggerSubject = new Subject<void>();

  currentSearchTerm: string = '';
  currentChuyenNganhFilter: string = '';

  constructor(
    private giangVienService: GiangVienService,
    private chuyenNganhService: ChuyenNganhService, 
    private fb: FormBuilder
  ) {
    this.giangVienForm = this.fb.group({
      maGV: ['', Validators.required],
      hoTen: ['', Validators.required],
      chuyenNganh: ['', Validators.required], 
      hocVi: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      soDienThoai: [''] 
    });
  }

  ngOnInit(): void {
    this.loadChuyenNganhList(); 

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
          return this.giangVienService.getGiangVienByChuyenNganh(chuyenNganhFilter).pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Lỗi khi tải giảng viên theo chuyên ngành:', error);
              this.errorMessage = `Không thể tải giảng viên cho chuyên ngành '${chuyenNganhFilter}'.`;
              return of([]);
            })
          );
        } else {
          return this.giangVienService.searchGiangVien(searchTerm).pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Lỗi khi tải danh sách giảng viên:', error);
              this.errorMessage = 'Không thể tải danh sách giảng viên.';
              return of([]);
            })
          );
        }
      })
    ).subscribe(data => {
      this.originalGiangVienList = data;
      this.applyClientSideFilters(); 
    });
  }

  loadChuyenNganhList(): void {
    this.chuyenNganhService.searchChuyenNganh().subscribe({ 
      next: (data) => {
        this.chuyenNganhList = data;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Lỗi khi tải danh sách chuyên ngành:', err);
        this.errorMessage = 'Không thể tải danh sách chuyên ngành để lọc.';
      }
    });
  }

  applyClientSideFilters(): void {
    let filteredList = [...this.originalGiangVienList];

    if (this.currentSearchTerm) {
      filteredList = filteredList.filter(gv =>
        gv.hoTen.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
        gv.maGV.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
        gv.email.toLowerCase().includes(this.currentSearchTerm.toLowerCase())
      );
    }
    this.giangVienList = filteredList;
  }

  onSelectGiangVien(giangVien: GiangVien): void {
    this.selectedGiangVien = giangVien;
    this.giangVienForm.patchValue({
      maGV: giangVien.maGV,
      hoTen: giangVien.hoTen,
      chuyenNganh: giangVien.chuyenNganh, 
      hocVi: giangVien.hocVi,
      email: giangVien.email,
      soDienThoai: giangVien.soDienThoai
    });
    this.giangVienForm.get('maGV')?.disable(); 
    this.clearMessages();
  }

  onSubmit(): void {
    const formData = this.giangVienForm.getRawValue(); 

    if (this.giangVienForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ và đúng thông tin.';
      this.giangVienForm.markAllAsTouched();
      return;
    }

    if (this.selectedGiangVien) {
      this.giangVienService.updateGiangVien(this.selectedGiangVien.maGV, formData).subscribe({
        next: (_) => {
          this.successMessage = 'Cập nhật giảng viên thành công!';
          this.resetForm();
          this.refreshGiangVienList();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi khi cập nhật giảng viên: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi cập nhật giảng viên:', err);
        }
      });
    } else {
      this.giangVienService.addGiangVien(formData).subscribe({
        next: (_) => {
          this.successMessage = 'Thêm mới giảng viên thành công!';
          this.resetForm();
          this.refreshGiangVienList();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi khi thêm mới giảng viên: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi thêm mới giảng viên:', err);
        }
      });
    }
  }

  onDeleteGiangVien(maGV: string): void {
    if (confirm(`Bạn có chắc chắn muốn xóa Giảng viên '${maGV}' không?`)) {
      this.giangVienService.deleteGiangVien(maGV).subscribe({
        next: (_) => {
          this.successMessage = `Giảng viên '${maGV}' đã được xóa thành công!`;
          this.refreshGiangVienList();
          this.resetForm();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi khi xóa giảng viên: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi xóa giảng viên:', err);
        }
      });
    }
  }

  resetForm(): void {
    this.giangVienForm.reset();
    this.selectedGiangVien = null;
    this.giangVienForm.get('maGV')?.enable();
    this.clearMessages();
    this.giangVienForm.get('chuyenNganh')?.setValue(''); 
  }

  refreshGiangVienList(): void {
    this.refreshTriggerSubject.next();
  }

  onSearchTermChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchTermSubject.next(searchTerm);
  }

  onChuyenNganhFilterChange(event: Event): void {
    const chuyenNganhTen = (event.target as HTMLSelectElement).value;
    this.chuyenNganhFilterSubject.next(chuyenNganhTen);
  }

  getChuyenNganhTen(tenChuyenNganh: string): string {
    return tenChuyenNganh || 'N/A';
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}