import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Khoa } from '../../../models/Khoa';
import { KhoaService }  from '../../../services/khoa.service';
import { catchError, debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs/operators';
import { of, Subject, combineLatest, throwError } from 'rxjs'; 

@Component({
  selector: 'app-quan-ly-khoa',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './quan-ly-khoa.component.html',
  styleUrls: ['./quan-ly-khoa.component.css']
})
export class QuanLyKhoaComponent implements OnInit {
  khoaForm!: FormGroup;
  khoaList: Khoa[] = [];
  selectedKhoa: Khoa | null = null;
  errorMessage: string = ''; 
  successMessage: string = ''; 

  private searchTerms = new Subject<string>();
  private refreshTriggerSubject = new Subject<void>(); 
  searchTerm: string = ''; 

  constructor(
    private fb: FormBuilder,
    private khoaService: KhoaService
  ) { }

  ngOnInit(): void {
    this.initForm();

    combineLatest([
      this.searchTerms.pipe(
        startWith(this.searchTerm), 
        debounceTime(300),
        distinctUntilChanged()
      ),
      this.refreshTriggerSubject.pipe(startWith(undefined as void))
    ]).pipe(
      switchMap(([term, refreshTrigger]) => {
        this.searchTerm = term; 
        this.clearMessages(); 

        return this.khoaService.searchKhoa(term).pipe(
          catchError(error => {
            console.error('Lỗi tải danh sách khoa:', error);
            return throwError(() => new Error('Không thể tải danh sách khoa. Vui lòng kiểm tra kết nối và API Back-End.'));
          })
        );
      })
    ).subscribe({
      next: (data: Khoa[]) => {
        this.khoaList = data;
      },
      error: (err: Error) => { 
        this.errorMessage = err.message;
      }
    });

  }

  initForm(): void {
    this.khoaForm = this.fb.group({
      maKhoa: ['', Validators.required],
      tenKhoa: ['', Validators.required]
    });
  }

  refreshKhoaList(): void {
    this.refreshTriggerSubject.next();
  }

  onSubmit(): void {
    if (this.khoaForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin bắt buộc.';
      this.markFormGroupTouched(this.khoaForm);
      return;
    }

    const formData: Khoa = this.khoaForm.getRawValue(); 

    if (this.selectedKhoa) {
       const maKhoaToUpdate = this.selectedKhoa.maKhoa; 
      console.log('--- ĐANG THỰC HIỆN CẬP NHẬT KHOA ---'); 
      console.log('Mã Khoa sẽ gửi đi để cập nhật:', maKhoaToUpdate); 
      console.log('Dữ liệu form gửi đi:', formData); 
      
      this.khoaService.updateKhoa(this.selectedKhoa.maKhoa, formData).subscribe({
        next: (response) => {
          this.successMessage = 'Cập nhật khoa thành công!';
          this.refreshKhoaList(); 
          this.resetForm();
        },
        error: (err: Error) => { 
          this.errorMessage = 'Cập nhật khoa thất bại: ' + (err.message || 'Lỗi không xác định.');
          console.error('Lỗi cập nhật khoa:', err);
        }
      });
    } else {
      this.khoaService.addKhoa(formData).subscribe({
        next: (response) => {
          this.successMessage = 'Thêm mới khoa thành công!';
          this.refreshKhoaList();
          this.resetForm();
        },
        error: (err: Error) => { 
          this.errorMessage = 'Thêm mới khoa thất bại: ' + (err.message || 'Lỗi không xác định.');
          console.error('Lỗi thêm mới khoa:', err);
        }
      });
    }
  }

  onSelectKhoa(khoa: Khoa): void {
    this.selectedKhoa = { ...khoa };
    this.khoaForm.patchValue(this.selectedKhoa);
    this.khoaForm.get('maKhoa')?.disable();
    this.clearMessages();
  }

  onDeleteKhoa(maKhoa: string): void {
    if (confirm('Bạn có chắc chắn muốn xóa khoa này? Thao tác này không thể hoàn tác!')) {
      this.khoaService.deleteKhoa(maKhoa).subscribe({
        next: (response) => {
          this.successMessage = 'Xóa khoa thành công!';
          this.refreshKhoaList(); 
          this.resetForm();
        },
        error: (err: Error) => { 
          this.errorMessage = 'Xóa khoa thất bại: ' + (err.message || 'Lỗi không xác định.');
          console.error('Lỗi xóa khoa:', err);
        }
      });
    }
  }

  resetForm(): void {
    this.khoaForm.reset();
    this.selectedKhoa = null;
    this.khoaForm.get('maKhoa')?.enable(); 
    this.clearMessages();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  clearMessages(): void {
    this.errorMessage = ''; 
    this.successMessage = ''; 
  }

  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchTerms.next(searchTerm);
  }
}