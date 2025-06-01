// src/app/pages/admin/quan-ly-tai-khoan/quan-ly-tai-khoan.component.ts
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
      maGV: [null], // Mặc định là null
      maSV: [null]  // Mặc định là null
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
      } else { // QTV hoặc các vai trò khác
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

      // Chuyển đổi chuỗi rỗng thành null để kiểm tra
      const maGVValidated = (maGV === '' ? null : maGV);
      const maSVValidated = (maSV === '' ? null : maSV);


      if (vaiTro === 'GV' && (maGVValidated === null)) {
        return { 'maGVRequired': true };
      }
      if (vaiTro === 'SV' && (maSVValidated === null)) {
        return { 'maSVRequired': true };
      }
      // Kiểm tra nếu vai trò là QTV nhưng lại có liên kết
      if (vaiTro === 'QTV' && (maGVValidated !== null || maSVValidated !== null)) {
        return { 'adminHasAssociation': true };
      }
      // Kiểm tra nếu vai trò không phải GV/SV nhưng lại có liên kết
      if (vaiTro !== 'GV' && vaiTro !== 'SV' && (maGVValidated !== null || maSVValidated !== null)) {
        return { 'invalidAssociation': true };
      }

      // Đảm bảo chỉ một trong hai trường có giá trị khi vai trò là GV hoặc SV
      // Ví dụ: nếu vai trò là GV mà maSV lại có giá trị
      if (vaiTro === 'GV' && maSVValidated !== null) {
          return {'invalidAssociationForRole': true};
      }
      // Ví dụ: nếu vai trò là SV mà maGV lại có giá trị
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
      matKhau: taiKhoan.matKhau, // Mật khẩu thường không nên hiển thị ra như này
      vaiTro: taiKhoan.vaiTro,
      maGV: taiKhoan.maGV || null, // Gán null nếu là undefined/rỗng
      maSV: taiKhoan.maSV || null  // Gán null nếu là undefined/rỗng
    });
    this.taiKhoanForm.get('tenDangNhap')?.disable();
    this.clearMessages();
  }

  onSubmit(): void {
    // 1. Kích hoạt lại trường tenDangNhap để lấy giá trị từ form nếu nó đang bị disable
    this.taiKhoanForm.get('tenDangNhap')?.enable();
    const formData = this.taiKhoanForm.getRawValue(); // Lấy tất cả giá trị, bao gồm cả trường bị disable
    // 2. Tắt lại trường tenDangNhap sau khi lấy giá trị (chỉ áp dụng nếu selectedTaiKhoan tồn tại)
    if (this.selectedTaiKhoan) {
        this.taiKhoanForm.get('tenDangNhap')?.disable();
    }


    if (this.taiKhoanForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ và đúng thông tin.';
      this.taiKhoanForm.markAllAsTouched();
      console.log('Form invalid:', this.taiKhoanForm.errors); // Debugging
      console.log('Errors by control:', this.taiKhoanForm.controls['maGV'].errors, this.taiKhoanForm.controls['maSV'].errors, this.taiKhoanForm.controls['vaiTro'].errors);
      return;
    }

    // --- LOGIC XỬ LÝ MA_GV/MA_SV THÀNH NULL HOẶC GIÁ TRỊ CỤ THỂ ---
    // Tạo một đối tượng TaiKhoanToSend riêng để đảm bảo dữ liệu đúng định dạng
    const taiKhoanToSend: TaiKhoan = {
      tenDangNhap: formData.tenDangNhap,
      matKhau: formData.matKhau,
      vaiTro: formData.vaiTro,
      maGV: null, // Mặc định là null
      maSV: null  // Mặc định là null
    };

    // Áp dụng giá trị dựa trên vai trò
    if (formData.vaiTro === 'GV') {
      // Nếu là GV, lấy maGV từ form. Nếu nó là chuỗi rỗng, gán null.
      taiKhoanToSend.maGV = formData.maGV ? formData.maGV : null;
      // Đảm bảo maSV là null
      taiKhoanToSend.maSV = null;
    } else if (formData.vaiTro === 'SV') {
      // Nếu là SV, lấy maSV từ form. Nếu nó là chuỗi rỗng, gán null.
      taiKhoanToSend.maSV = formData.maSV ? formData.maSV : null;
      // Đảm bảo maGV là null
      taiKhoanToSend.maGV = null;
    } else { // Vai trò là QTV (hoặc bất kỳ vai trò nào khác không liên quan đến GV/SV)
      // Đảm bảo cả maGV và maSV đều là null
      taiKhoanToSend.maGV = null;
      taiKhoanToSend.maSV = null;
    }

    this.clearMessages();

    if (this.selectedTaiKhoan) {
      // Cập nhật tài khoản hiện có
      // Dùng taiKhoanToSend đã được xử lý
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
      // Thêm mới tài khoản
      // Dùng taiKhoanToSend đã được xử lý
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