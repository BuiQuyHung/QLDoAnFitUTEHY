import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Khoa } from '../../../models/Khoa';
import { KhoaService }  from '../../../services/khoa.service';
import { catchError, debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs/operators';
import { of, Subject, combineLatest, throwError } from 'rxjs'; // Thêm combineLatest và throwError

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
  errorMessage: string = ''; // Thay đổi từ null thành chuỗi rỗng
  successMessage: string = ''; // Thay đổi từ null thành chuỗi rỗng

  private searchTerms = new Subject<string>();
  private refreshTriggerSubject = new Subject<void>(); // Subject để kích hoạt làm mới
  searchTerm: string = ''; // Biến lưu từ khóa tìm kiếm (để hiển thị trong input)

  constructor(
    private fb: FormBuilder,
    private khoaService: KhoaService
  ) { }

  ngOnInit(): void {
    this.initForm();

    // Kết hợp searchTerms và refreshTriggerSubject
    combineLatest([
      this.searchTerms.pipe(
        startWith(this.searchTerm), // Giá trị ban đầu cho tìm kiếm
        debounceTime(300),
        distinctUntilChanged()
      ),
      this.refreshTriggerSubject.pipe(startWith(undefined as void)) // Kích hoạt lần tải đầu tiên
    ]).pipe(
      switchMap(([term, refreshTrigger]) => {
        this.searchTerm = term; // Cập nhật biến hiển thị
        this.clearMessages(); // Xóa các thông báo cũ trước khi tải lại

        // Gọi API tìm kiếm khoa
        return this.khoaService.searchKhoa(term).pipe(
          catchError(error => {
            console.error('Lỗi tải danh sách khoa:', error);
            // Ném ra lỗi cụ thể để component có thể bắt và hiển thị
            return throwError(() => new Error('Không thể tải danh sách khoa. Vui lòng kiểm tra kết nối và API Back-End.'));
          })
        );
      })
    ).subscribe({
      next: (data: Khoa[]) => {
        this.khoaList = data; // Cập nhật danh sách khoa
      },
      error: (err: Error) => { // Bắt lỗi đã được throwError từ switchMap
        this.errorMessage = err.message;
      }
    });

    // Kích hoạt lần tải danh sách đầu tiên (có thể dùng refreshTriggerSubject.next() hoặc searchTermSubject.next('') )
    // Hiện tại startWith đã xử lý điều này.
  }

  initForm(): void {
    this.khoaForm = this.fb.group({
      maKhoa: ['', Validators.required],
      tenKhoa: ['', Validators.required]
    });
  }

  // Hàm này không còn trực tiếp gọi API nữa, mà chỉ kích hoạt Subject
  refreshKhoaList(): void {
    this.refreshTriggerSubject.next();
  }

  onSubmit(): void {
    if (this.khoaForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin bắt buộc.';
      this.markFormGroupTouched(this.khoaForm);
      return;
    }

    const formData: Khoa = this.khoaForm.getRawValue(); // Dùng getRawValue để lấy cả mã khoa khi disable

    if (this.selectedKhoa) {
      // Chế độ sửa
       const maKhoaToUpdate = this.selectedKhoa.maKhoa; // Lấy mã khoa từ đối tượng đã chọn
      console.log('--- ĐANG THỰC HIỆN CẬP NHẬT KHOA ---'); // Thêm log này
      console.log('Mã Khoa sẽ gửi đi để cập nhật:', maKhoaToUpdate); // DÒNG QUAN TRỌNG CẦN KIỂM TRA
      console.log('Dữ liệu form gửi đi:', formData); 
      
      this.khoaService.updateKhoa(this.selectedKhoa.maKhoa, formData).subscribe({
        next: (response) => {
          this.successMessage = 'Cập nhật khoa thành công!';
          this.refreshKhoaList(); // Kích hoạt làm mới danh sách
          this.resetForm();
        },
        error: (err: Error) => { // Bắt lỗi chi tiết từ ApiService
          this.errorMessage = 'Cập nhật khoa thất bại: ' + (err.message || 'Lỗi không xác định.');
          console.error('Lỗi cập nhật khoa:', err);
        }
      });
    } else {
      // Chế độ thêm mới
      this.khoaService.addKhoa(formData).subscribe({
        next: (response) => {
          this.successMessage = 'Thêm mới khoa thành công!';
          this.refreshKhoaList(); // Kích hoạt làm mới danh sách
          this.resetForm();
        },
        error: (err: Error) => { // Bắt lỗi chi tiết từ ApiService
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
          this.refreshKhoaList(); // Kích hoạt làm mới danh sách
          this.resetForm();
        },
        error: (err: Error) => { // Bắt lỗi chi tiết từ ApiService
          this.errorMessage = 'Xóa khoa thất bại: ' + (err.message || 'Lỗi không xác định.');
          console.error('Lỗi xóa khoa:', err);
        }
      });
    }
  }

  resetForm(): void {
    this.khoaForm.reset();
    this.selectedKhoa = null;
    this.khoaForm.get('maKhoa')?.enable(); // Kích hoạt lại trường Mã Khoa
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
    this.errorMessage = ''; // Đặt lại chuỗi rỗng thay vì null
    this.successMessage = ''; // Đặt lại chuỗi rỗng thay vì null
  }

  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchTerms.next(searchTerm);
  }
}