// src/app/pages/admin/quan-ly-tai-khoan/quan-ly-tai-khoan.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// Import thêm AbstractControl, ValidatorFn, ValidationErrors
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { TaiKhoanService } from '../../../services/tai-khoan.service';
import { GiangVienService } from '../../../services/giang-vien.service'; // Cần để lấy danh sách Giảng viên
import { SinhVienService } from '../../../services/sinh-vien.service'; // Cần để lấy danh sách Sinh viên

import { TaiKhoan } from '../../../models/TaiKhoan';
import { GiangVien } from '../../../models/GiangVien'; // Import model GiangVien, đảm bảo casing đúng
import { SinhVien } from '../../../models/SinhVien'; // Import model SinhVien, đảm bảo casing đúng

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
  giangVienList: GiangVien[] = []; // Danh sách Giảng viên cho dropdown
  sinhVienList: SinhVien[] = []; // Danh sách Sinh viên cho dropdown

  taiKhoanForm: FormGroup;
  selectedTaiKhoan: TaiKhoan | null = null; // Để lưu đối tượng đang chỉnh sửa

  errorMessage: string = '';
  successMessage: string = '';

  private searchTermSubject = new Subject<string>(); // Cho tìm kiếm client-side
  private vaiTroFilterSubject = new Subject<string>(); // Lọc theo Vai trò
  private refreshTriggerSubject = new Subject<void>();

  currentSearchTerm: string = '';
  currentVaiTroFilter: string = '';

  // Các vai trò có thể có
  // ĐÃ SỬA: Thay đổi giá trị hiển thị của vai trò
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

    // Thêm validator tùy chỉnh cho toàn bộ form
    this.taiKhoanForm.setValidators(this.validateMaGVMaSV());

    // Theo dõi sự thay đổi của vaiTro để cập nhật Validators cho maGV/maSV
    this.taiKhoanForm.get('vaiTro')?.valueChanges.subscribe(vaiTro => {
      const maGVControl = this.taiKhoanForm.get('maGV');
      const maSVControl = this.taiKhoanForm.get('maSV');

      // ĐÃ SỬA: Cập nhật điều kiện dựa trên giá trị mới của vai trò
      if (vaiTro === 'GV') { // Nếu vai trò là GV
        maGVControl?.setValidators(Validators.required);
        maSVControl?.clearValidators();
        maSVControl?.setValue(null); // Reset giá trị
      } else if (vaiTro === 'SV') { // Nếu vai trò là SV
        maSVControl?.setValidators(Validators.required);
        maGVControl?.clearValidators();
        maGVControl?.setValue(null); // Reset giá trị
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
    this.loadDropdownData(); // Tải dữ liệu cho các dropdown

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

        // Luôn lấy tất cả tài khoản và lọc client-side để đơn giản hóa logic
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
      this.applyClientSideFilters(); // Áp dụng lọc tìm kiếm (nếu có)
    });
  }

  // Validator tùy chỉnh cho ràng buộc maGV/maSV
  validateMaGVMaSV(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const form = control as FormGroup; // Ép kiểu AbstractControl thành FormGroup
      const vaiTro = form.get('vaiTro')?.value;
      const maGV = form.get('maGV')?.value;
      const maSV = form.get('maSV')?.value;

      // ĐÃ SỬA: Cập nhật điều kiện dựa trên giá trị mới của vai trò
      if (vaiTro === 'GV' && (maGV === null || maGV === '')) {
        return { 'maGVRequired': true };
      }
      if (vaiTro === 'SV' && (maSV === null || maSV === '')) {
        return { 'maSVRequired': true };
      }
      // Kiểm tra nếu vai trò là QTV nhưng lại có liên kết
      if (vaiTro === 'QTV' && (maGV !== null || maSV !== null)) {
        return { 'adminHasAssociation': true };
      }
      // Kiểm tra nếu vai trò không phải GV/SV nhưng lại có liên kết
      if (vaiTro !== 'GV' && vaiTro !== 'SV' && (maGV !== null || maSV !== null)) {
        return { 'invalidAssociation': true };
      }

      return null;
    };
  }


  // Tải danh sách cho các dropdown
  loadDropdownData(): void {
    this.giangVienService.searchGiangVien().subscribe({ // Giả định có searchGiangVien()
      next: (data) => this.giangVienList = data,
      error: (err: HttpErrorResponse) => console.error('Lỗi khi tải danh sách giảng viên:', err)
    });
    this.sinhVienService.searchSinhVien().subscribe({ // Giả định có searchSinhVien()
      next: (data) => this.sinhVienList = data,
      error: (err: HttpErrorResponse) => console.error('Lỗi khi tải danh sách sinh viên:', err)
    });
  }

  // Áp dụng bộ lọc tìm kiếm trên client-side
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
      matKhau: taiKhoan.matKhau, // Cân nhắc không hiển thị mật khẩu thực
      vaiTro: taiKhoan.vaiTro,
      maGV: taiKhoan.maGV || null,
      maSV: taiKhoan.maSV || null
    });
    this.taiKhoanForm.get('tenDangNhap')?.disable(); // Tắt trường tên đăng nhập khi chỉnh sửa
    this.clearMessages();
  }

  onSubmit(): void {
    // Kích hoạt lại trường tenDangNhap để lấy giá trị từ form (nếu đang ở chế độ sửa)
    this.taiKhoanForm.get('tenDangNhap')?.enable();
    const formData = this.taiKhoanForm.getRawValue(); // Lấy giá trị bao gồm cả trường bị disable
    // Tắt lại trường tenDangNhap sau khi lấy giá trị
    this.taiKhoanForm.get('tenDangNhap')?.disable();


    if (this.taiKhoanForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ và đúng thông tin.';
      this.taiKhoanForm.markAllAsTouched();
      console.log('Form invalid:', this.taiKhoanForm.errors); // Debugging
      return;
    }

    // Xử lý giá trị null cho maGV, maSV nếu không được chọn hoặc không phù hợp với vai trò
    // ĐÃ SỬA: Cập nhật điều kiện dựa trên giá trị mới của vai trò
    if (formData.vaiTro !== 'GV') {
      formData.maGV = null;
    }
    if (formData.vaiTro !== 'SV') {
      formData.maSV = null;
    }

    if (this.selectedTaiKhoan) {
      // Cập nhật
      this.taiKhoanService.updateTaiKhoan(this.selectedTaiKhoan.tenDangNhap, formData).subscribe({
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
      // Thêm mới
      this.taiKhoanService.addTaiKhoan(formData).subscribe({
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
    this.taiKhoanForm.get('tenDangNhap')?.enable(); // Kích hoạt lại trường tên đăng nhập
    this.clearMessages();
    // Đảm bảo các dropdown được reset về giá trị mặc định
    this.taiKhoanForm.get('vaiTro')?.setValue('');
    this.taiKhoanForm.get('maGV')?.setValue(null);
    this.taiKhoanForm.get('maSV')?.setValue(null);
    // Cập nhật lại validation sau khi reset
    this.taiKhoanForm.get('maGV')?.updateValueAndValidity();
    this.taiKhoanForm.get('maSV')?.updateValueAndValidity();
    // Đảm bảo validator tổng thể của form được chạy lại
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

  getGiangVienTen(maGV: string): string {
    const giangVien = this.giangVienList.find(gv => gv.maGV === maGV);
    return giangVien ? giangVien.hoTen : 'N/A';
  }

  getSinhVienTen(maSV: string): string {
    const sinhVien = this.sinhVienList.find(sv => sv.maSV === maSV);
    return sinhVien ? sinhVien.hoTen : 'N/A';
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
