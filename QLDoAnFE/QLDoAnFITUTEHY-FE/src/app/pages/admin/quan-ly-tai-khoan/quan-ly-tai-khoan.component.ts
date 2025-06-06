import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { TaiKhoanService } from '../../../services/tai-khoan.service';
import { GiangVienService } from '../../../services/giang-vien.service';
import { SinhVienService } from '../../../services/sinh-vien.service';

import { TaiKhoan } from '../../../models/TaiKhoan';
import { GiangVien } from '../../../models/GiangVien';
import { SinhVien } from '../../../models/SinhVien';

import { HttpErrorResponse } from '@angular/common/http';
import { Subject, combineLatest, of, throwError, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-quan-ly-tai-khoan',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './quan-ly-tai-khoan.component.html',
  styleUrls: ['./quan-ly-tai-khoan.component.css']
})
export class QuanLyTaiKhoanComponent implements OnInit {
  taiKhoanList: TaiKhoan[] = [];
  originalTaiKhoanList: TaiKhoan[] = [];
  giangVienList: GiangVien[] = [];
  sinhVienList: SinhVien[] = [];

  taiKhoanForm: FormGroup;
  selectedTaiKhoan: TaiKhoan | null = null;

  errorMessage: string = '';
  successMessage: string = '';

  private searchTermSubject = new Subject<string>();
  private vaiTroFilterSubject = new Subject<string>();
  private refreshTriggerSubject = new Subject<void>();

  currentSearchTerm: string = '';
  currentVaiTroFilter: string = '';

  vaiTroOptions: string[] = ['QTV', 'GV', 'SV'];

  constructor(
    private taiKhoanService: TaiKhoanService,
    private giangVienService: GiangVienService,
    private sinhVienService: SinhVienService,
    private fb: FormBuilder
  ) {
    this.taiKhoanForm = this.fb.group({
      tenDangNhap: ['', Validators.required],
      matKhau: ['', Validators.required],
      vaiTro: ['', Validators.required],
      maGV: [null], 
      maSV: [null]  
    });

    this.taiKhoanForm.setValidators(this.validateMaGVMaSV());

    this.taiKhoanForm.get('vaiTro')?.valueChanges.subscribe(vaiTro => {
      const maGVControl = this.taiKhoanForm.get('maGV');
      const maSVControl = this.taiKhoanForm.get('maSV');

      if (vaiTro === 'GV') {
        maGVControl?.setValidators(Validators.required);
        maSVControl?.clearValidators();
        maSVControl?.setValue(null);
      } else if (vaiTro === 'SV') {
        maSVControl?.setValidators(Validators.required);
        maGVControl?.clearValidators();
        maGVControl?.setValue(null);
      } else { 
        maGVControl?.clearValidators();
        maSVControl?.clearValidators();
        maGVControl?.setValue(null);
        maSVControl?.setValue(null);
      }
      maGVControl?.updateValueAndValidity();
      maSVControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.loadDropdownData();

    this.searchTermSubject.next('');
    this.vaiTroFilterSubject.next('');

    combineLatest([
      this.searchTermSubject.pipe(startWith(this.currentSearchTerm), debounceTime(300), distinctUntilChanged()),
      this.vaiTroFilterSubject.pipe(startWith(this.currentVaiTroFilter), distinctUntilChanged()),
      this.refreshTriggerSubject.pipe(startWith(undefined as void))
    ]).pipe(
      switchMap(([searchTerm, vaiTroFilter, refreshTrigger]) => {
        this.currentSearchTerm = searchTerm;
        this.currentVaiTroFilter = vaiTroFilter;
        this.clearMessages();

        return this.taiKhoanService.getAllTaiKhoan().pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Lỗi khi tải danh sách tài khoản:', error);
            this.errorMessage = 'Không thể tải danh sách tài khoản.';
            return of([]);
          })
        );
      })
    ).subscribe(data => {
      this.originalTaiKhoanList = data;
      this.applyClientSideFilters();
    });
  }

  validateMaGVMaSV(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const form = control as FormGroup;
      const vaiTro = form.get('vaiTro')?.value;
      const maGV = form.get('maGV')?.value;
      const maSV = form.get('maSV')?.value;

      const maGVValidated = (maGV === '' ? null : maGV);
      const maSVValidated = (maSV === '' ? null : maSV);


      if (vaiTro === 'GV' && (maGVValidated === null)) {
        return { 'maGVRequired': true };
      }
      if (vaiTro === 'SV' && (maSVValidated === null)) {
        return { 'maSVRequired': true };
      }
      if (vaiTro === 'QTV' && (maGVValidated !== null || maSVValidated !== null)) {
        return { 'adminHasAssociation': true };
      }
      if (vaiTro !== 'GV' && vaiTro !== 'SV' && (maGVValidated !== null || maSVValidated !== null)) {
        return { 'invalidAssociation': true };
      }

      if (vaiTro === 'GV' && maSVValidated !== null) {
          return {'invalidAssociationForRole': true};
      }
      if (vaiTro === 'SV' && maGVValidated !== null) {
          return {'invalidAssociationForRole': true};
      }


      return null;
    };
  }

  loadDropdownData(): void {
    this.giangVienService.searchGiangVien().subscribe({
      next: (data) => this.giangVienList = data,
      error: (err: HttpErrorResponse) => console.error('Lỗi khi tải danh sách giảng viên:', err)
    });
    this.sinhVienService.searchSinhVien().subscribe({
      next: (data) => this.sinhVienList = data,
      error: (err: HttpErrorResponse) => console.error('Lỗi khi tải danh sách sinh viên:', err)
    });
  }

  applyClientSideFilters(): void {
    let filteredList = [...this.originalTaiKhoanList];

    if (this.currentVaiTroFilter) {
      filteredList = filteredList.filter(tk => tk.vaiTro === this.currentVaiTroFilter);
    }
    if (this.currentSearchTerm) {
      filteredList = filteredList.filter(tk =>
        tk.tenDangNhap.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
        tk.vaiTro.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
        (tk.maGV && this.getGiangVienTen(tk.maGV).toLowerCase().includes(this.currentSearchTerm.toLowerCase())) ||
        (tk.maSV && this.getSinhVienTen(tk.maSV).toLowerCase().includes(this.currentSearchTerm.toLowerCase()))
      );
    }
    this.taiKhoanList = filteredList;
  }

  onSelectTaiKhoan(taiKhoan: TaiKhoan): void {
    this.selectedTaiKhoan = taiKhoan;
    this.taiKhoanForm.patchValue({
      tenDangNhap: taiKhoan.tenDangNhap,
      matKhau: taiKhoan.matKhau, 
      vaiTro: taiKhoan.vaiTro,
      maGV: taiKhoan.maGV || null, 
      maSV: taiKhoan.maSV || null  
    });
    this.taiKhoanForm.get('tenDangNhap')?.disable();
    this.clearMessages();
  }

  onSubmit(): void {
    this.taiKhoanForm.get('tenDangNhap')?.enable();
    const formData = this.taiKhoanForm.getRawValue(); 
    if (this.selectedTaiKhoan) {
        this.taiKhoanForm.get('tenDangNhap')?.disable();
    }


    if (this.taiKhoanForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ và đúng thông tin.';
      this.taiKhoanForm.markAllAsTouched();
      console.log('Form invalid:', this.taiKhoanForm.errors); 
      console.log('Errors by control:', this.taiKhoanForm.controls['maGV'].errors, this.taiKhoanForm.controls['maSV'].errors, this.taiKhoanForm.controls['vaiTro'].errors);
      return;
    }

    const taiKhoanToSend: TaiKhoan = {
      tenDangNhap: formData.tenDangNhap,
      matKhau: formData.matKhau,
      vaiTro: formData.vaiTro,
      maGV: null, 
      maSV: null  
    };

    if (formData.vaiTro === 'GV') {
      taiKhoanToSend.maGV = formData.maGV ? formData.maGV : null;
      taiKhoanToSend.maSV = null;
    } else if (formData.vaiTro === 'SV') {
      taiKhoanToSend.maSV = formData.maSV ? formData.maSV : null;
      taiKhoanToSend.maGV = null;
    } else { 
      taiKhoanToSend.maGV = null;
      taiKhoanToSend.maSV = null;
    }

    this.clearMessages();

    if (this.selectedTaiKhoan) {
      this.taiKhoanService.updateTaiKhoan(this.selectedTaiKhoan.tenDangNhap, taiKhoanToSend).subscribe({
        next: (_) => {
          this.successMessage = 'Cập nhật tài khoản thành công!';
          this.resetForm();
          this.refreshTaiKhoanList();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi khi cập nhật tài khoản: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi cập nhật tài khoản:', err);
        }
      });
    } else {
      this.taiKhoanService.addTaiKhoan(taiKhoanToSend).subscribe({
        next: (_) => {
          this.successMessage = 'Thêm mới tài khoản thành công!';
          this.resetForm();
          this.refreshTaiKhoanList();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi khi thêm mới tài khoản: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi thêm mới tài khoản:', err);
        }
      });
    }
  }

  onDeleteTaiKhoan(tenDangNhap: string): void {
    if (confirm(`Bạn có chắc chắn muốn xóa Tài Khoản '${tenDangNhap}' không?`)) {
      this.taiKhoanService.deleteTaiKhoan(tenDangNhap).subscribe({
        next: (_) => {
          this.successMessage = `Tài Khoản '${tenDangNhap}' đã được xóa thành công!`;
          this.refreshTaiKhoanList();
          this.resetForm();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi khi xóa tài khoản: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi xóa tài khoản:', err);
        }
      });
    }
  }

  resetForm(): void {
    this.taiKhoanForm.reset();
    this.selectedTaiKhoan = null;
    this.taiKhoanForm.get('tenDangNhap')?.enable();
    this.clearMessages();
    this.taiKhoanForm.get('vaiTro')?.setValue('');
    this.taiKhoanForm.get('maGV')?.setValue(null);
    this.taiKhoanForm.get('maSV')?.setValue(null);
    this.taiKhoanForm.get('maGV')?.updateValueAndValidity();
    this.taiKhoanForm.get('maSV')?.updateValueAndValidity();
    this.taiKhoanForm.updateValueAndValidity();
  }

  refreshTaiKhoanList(): void {
    this.refreshTriggerSubject.next();
  }

  onSearchTermChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchTermSubject.next(searchTerm);
  }

  onVaiTroFilterChange(event: Event): void {
    const vaiTro = (event.target as HTMLSelectElement).value;
    this.vaiTroFilterSubject.next(vaiTro);
  }

  getGiangVienTen(maGV: string | null | undefined): string {
    if (!maGV) return 'N/A';
    const giangVien = this.giangVienList.find(gv => gv.maGV === maGV);
    return giangVien ? giangVien.hoTen : 'N/A';
  }

  getSinhVienTen(maSV: string | null | undefined): string {
    if (!maSV) return 'N/A';
    const sinhVien = this.sinhVienList.find(sv => sv.maSV === maSV);
    return sinhVien ? sinhVien.hoTen : 'N/A';
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}