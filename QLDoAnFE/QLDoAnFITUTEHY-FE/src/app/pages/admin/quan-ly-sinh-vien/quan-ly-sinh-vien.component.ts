import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SinhVienService } from '../../../services/sinh-vien.service';
import { LopService } from '../../../services/lop.service'; 
import { SinhVien } from '../../../models/SinhVien';
import { Lop } from '../../../models/Lop'; 
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, startWith, map } from 'rxjs/operators';
import { format } from 'date-fns'; 

@Component({
  selector: 'app-quan-ly-sinh-vien',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './quan-ly-sinh-vien.component.html',
  styleUrls: ['./quan-ly-sinh-vien.component.css']
})
export class QuanLySinhVienComponent implements OnInit {
  sinhVienList: SinhVien[] = [];
  originalSinhVienList: SinhVien[] = [];
  lopList: Lop[] = []; 
  sinhVienForm: FormGroup;
  selectedSinhVien: SinhVien | null = null;

  errorMessage: string = '';
  successMessage: string = '';

  private searchTermSubject = new Subject<string>();
  private lopFilterSubject = new Subject<string>(); 
  private refreshTriggerSubject = new Subject<void>();

  currentSearchTerm: string = '';
  currentLopFilter: string = '';

  constructor(
    private sinhVienService: SinhVienService,
    private lopService: LopService, 
    private fb: FormBuilder
  ) {
    this.sinhVienForm = this.fb.group({
      maSV: ['', Validators.required],
      hoTen: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      soDienThoai: [''],
      ngaySinh: [''], 
      maLop: ['', Validators.required] 
    });
  }

  ngOnInit(): void {
    this.loadLopList(); 

    this.searchTermSubject.next('');
    this.lopFilterSubject.next('');

    combineLatest([
      this.searchTermSubject.pipe(startWith(this.currentSearchTerm), debounceTime(300), distinctUntilChanged()),
      this.lopFilterSubject.pipe(startWith(this.currentLopFilter), distinctUntilChanged()),
      this.refreshTriggerSubject.pipe(startWith(undefined as void))
    ]).pipe(
      switchMap(([searchTerm, lopFilter, refreshTrigger]) => {
        this.currentSearchTerm = searchTerm;
        this.currentLopFilter = lopFilter;
        this.clearMessages();

        if (lopFilter) {
          return this.sinhVienService.getSinhVienByLopId(lopFilter).pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Lỗi khi tải sinh viên theo lớp:', error);
              this.errorMessage = `Không thể tải sinh viên cho lớp '${this.getLopTen(lopFilter)}'.`;
              return of([]);
            })
          );
        } else {
          return this.sinhVienService.searchSinhVien(searchTerm).pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Lỗi khi tải danh sách sinh viên:', error);
              this.errorMessage = 'Không thể tải danh sách sinh viên.';
              return of([]);
            })
          );
        }
      })
    ).subscribe(data => {
      this.originalSinhVienList = data;
      this.applyClientSideFilters(); 
    });
  }

  loadLopList(): void {
    this.lopService.searchLop().subscribe({ 
      next: (data) => {
        this.lopList = data;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Lỗi khi tải danh sách lớp:', err);
        this.errorMessage = 'Không thể tải danh sách lớp để lọc.';
      }
    });
  }

  applyClientSideFilters(): void {
    let filteredList = [...this.originalSinhVienList]; 

    if (this.currentSearchTerm) {
      filteredList = filteredList.filter(sinhVien =>
        sinhVien.hoTen.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
        sinhVien.maSV.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
        sinhVien.email.toLowerCase().includes(this.currentSearchTerm.toLowerCase())
      );
    }
    this.sinhVienList = filteredList; 
  }

  onSelectSinhVien(sinhVien: SinhVien): void {
    this.selectedSinhVien = sinhVien;
    const ngaySinhFormatted = sinhVien.ngaySinh ? format(new Date(sinhVien.ngaySinh), 'yyyy-MM-dd') : '';

    this.sinhVienForm.patchValue({
      maSV: sinhVien.maSV,
      hoTen: sinhVien.hoTen,
      email: sinhVien.email,
      soDienThoai: sinhVien.soDienThoai,
      ngaySinh: ngaySinhFormatted,
      maLop: sinhVien.maLop
    });
    this.sinhVienForm.get('maSV')?.disable(); 
    this.clearMessages();
  }

  onSubmit(): void {
    const formData = this.sinhVienForm.getRawValue(); 

    if (this.sinhVienForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ và đúng thông tin.';
      if (this.sinhVienForm.get('email')?.errors?.['email']) {
        this.errorMessage = 'Email không hợp lệ.';
      }
      this.sinhVienForm.markAllAsTouched(); 
      return;
    }

    const sinhVienToSend: SinhVien = {
        ...formData,
        ngaySinh: formData.ngaySinh ? new Date(formData.ngaySinh) : undefined
    };

    if (this.selectedSinhVien) {
      this.sinhVienService.updateSinhVien(this.selectedSinhVien.maSV, sinhVienToSend).subscribe({
        next: (_) => {
          this.successMessage = 'Cập nhật sinh viên thành công!';
          this.resetForm();
          this.refreshSinhVienList(); 
        },
        error: (err: HttpErrorResponse) => { 
          this.errorMessage = 'Lỗi khi cập nhật sinh viên: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi cập nhật sinh viên:', err);
        }
      });
    } else {
      this.sinhVienService.addSinhVien(sinhVienToSend).subscribe({
        next: (_) => {
          this.successMessage = 'Thêm mới sinh viên thành công!';
          this.resetForm();
          this.refreshSinhVienList(); 
        },
        error: (err: HttpErrorResponse) => { 
          this.errorMessage = 'Lỗi khi thêm mới sinh viên: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi thêm mới sinh viên:', err);
        }
      });
    }
  }

  onDeleteSinhVien(maSV: string): void {
    if (confirm(`Bạn có chắc chắn muốn xóa Sinh Viên '${maSV}' không?`)) {
      this.sinhVienService.deleteSinhVien(maSV).subscribe({
        next: (_) => {
          this.successMessage = `Sinh Viên '${maSV}' đã được xóa thành công!`;
          this.refreshSinhVienList(); 
          this.resetForm(); 
        },
        error: (err: HttpErrorResponse) => { 
          this.errorMessage = 'Lỗi khi xóa sinh viên: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi xóa sinh viên:', err);
        }
      });
    }
  }

  resetForm(): void {
    this.sinhVienForm.reset();
    this.selectedSinhVien = null;
    this.sinhVienForm.get('maSV')?.enable(); 
    this.clearMessages();
    this.sinhVienForm.get('maLop')?.setValue(''); 
  }

  refreshSinhVienList(): void {
    this.refreshTriggerSubject.next();
  }

  onSearchTermChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchTermSubject.next(searchTerm);
  }

  onLopFilterChange(event: Event): void {
    const lopId = (event.target as HTMLSelectElement).value;
    this.lopFilterSubject.next(lopId);
  }

  getLopTen(maLop: string): string {
    const lop = this.lopList.find(l => l.maLop === maLop);
    return lop ? lop.tenLop : 'N/A';
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}