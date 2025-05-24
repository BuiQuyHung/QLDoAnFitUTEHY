import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BoMonService } from '../../../services/bo-mon.service';
import { KhoaService } from '../../../services/khoa.service'; 
import { BoMon } from '../../../models/BoMon'; // Đã sửa: bo-mon.model.ts
import { Khoa } from '../../../models/Khoa'; // Đã sửa: khoa.model.ts
import { HttpErrorResponse } from '@angular/common/http';

import { Subject, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-quan-ly-bo-mon',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './quan-ly-bo-mon.component.html',
  styleUrls: ['./quan-ly-bo-mon.component.css']
})
export class QuanLyBoMonComponent implements OnInit {
  boMonList: BoMon[] = [];
  originalBoMonList: BoMon[] = []; // Danh sách Bộ Môn ban đầu từ API (sau khi đã lọc Khoa bởi backend)
  khoaList: Khoa[] = [];
  boMonForm: FormGroup;
  selectedBoMon: BoMon | null = null;

  errorMessage: string = '';
  successMessage: string = '';

  private searchTermSubject = new Subject<string>();
  private khoaFilterSubject = new Subject<string>();
  private refreshTriggerSubject = new Subject<void>(); // Subject để kích hoạt làm mới

  currentSearchTerm: string = '';
  currentKhoaFilter: string = '';

  constructor(
    private boMonService: BoMonService,
    private khoaService: KhoaService, 
    private fb: FormBuilder
  ) {
    this.boMonForm = this.fb.group({
      maBoMon: ['', Validators.required],
      tenBoMon: ['', Validators.required],
      moTa: [''],
      maKhoa: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadKhoaList();
    
    // Khởi tạo các Subject để combineLatest chạy lần đầu
    this.searchTermSubject.next('');
    this.khoaFilterSubject.next('');

    combineLatest([
      // Sử dụng startWith để đảm bảo các giá trị ban đầu được emit ngay lập tức
      this.searchTermSubject.pipe(startWith(this.currentSearchTerm), debounceTime(300), distinctUntilChanged()),
      this.khoaFilterSubject.pipe(startWith(this.currentKhoaFilter), distinctUntilChanged()),
      // refreshTriggerSubject cũng cần startWith để kích hoạt lần tải đầu tiên
      this.refreshTriggerSubject.pipe(startWith(undefined as void))
    ]).pipe(
      switchMap(([searchTerm, khoaFilter, refreshTrigger]) => {
        // Cập nhật các giá trị hiện tại
        this.currentSearchTerm = searchTerm;
        this.currentKhoaFilter = khoaFilter;
        this.clearMessages(); // Xóa thông báo lỗi/thành công cũ

        // Logic tải dữ liệu:
        if (khoaFilter) {
          // Nếu có lọc theo Khoa, API sẽ trả về danh sách đã lọc theo Khoa
          // Giả định API này KHÔNG hỗ trợ tìm kiếm theo 'term'
          return this.boMonService.getBoMonByKhoaId(khoaFilter).pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Lỗi khi tải bộ môn theo khoa:', error);
              this.errorMessage = `Không thể tải bộ môn cho khoa '${this.getKhoaTen(khoaFilter)}'.`;
              return of([]);
            })
          );
        } else {
          // Nếu không có lọc theo Khoa, API sẽ trả về tất cả Bộ Môn (có thể kèm tìm kiếm theo term)
          // Đã sửa: Gọi searchBoMon() thay vì getAllBoMon()
          return this.boMonService.searchBoMon(searchTerm).pipe( 
            catchError((error: HttpErrorResponse) => {
              console.error('Lỗi khi tải danh sách bộ môn:', error);
              this.errorMessage = 'Không thể tải danh sách bộ môn.';
              return of([]);
            })
          );
        }
      })
    ).subscribe(data => {
      this.originalBoMonList = data;
      // Áp dụng bộ lọc tìm kiếm (nếu có) trên client,
      // ĐẶC BIỆT NẾU API getBoMonByKhoaId KHÔNG hỗ trợ tìm kiếm theo term.
      // Nếu searchBoMon đã làm việc tìm kiếm trên server, applyClientSideFilters sẽ không cần thiết khi không có khoaFilter.
      // Để an toàn, chúng ta vẫn gọi nó để đảm bảo logic lọc luôn được áp dụng nhất quán.
      this.applyClientSideFilters(); 
    });
  }

  loadKhoaList(): void {
    // Đã sửa: Gọi searchKhoa() không có tham số để lấy tất cả Khoa
    this.khoaService.searchKhoa().subscribe({ 
      next: (data) => {
        this.khoaList = data;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Lỗi khi tải danh sách khoa:', err);
        this.errorMessage = 'Không thể tải danh sách khoa để lọc.';
      }
    });
  }

  // Phương thức applyClientSideFilters đã được thêm và tối ưu
  applyClientSideFilters(): void {
    let filteredList = [...this.originalBoMonList]; // Bắt đầu với bản sao của danh sách từ API

    // Áp dụng bộ lọc tìm kiếm trên client (theo tên Bộ Môn hoặc mã Bộ Môn)
    // Dòng này chỉ cần nếu API của bạn không xử lý tìm kiếm theo 'term' khi có 'khoaFilter'
    // hoặc nếu bạn muốn thêm một lớp lọc client-side cho sự tiện lợi.
    if (this.currentSearchTerm && !this.currentKhoaFilter) { // Chỉ lọc client-side nếu không có bộ lọc khoa
       filteredList = filteredList.filter(boMon =>
         boMon.tenBoMon.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
         boMon.maBoMon.toLowerCase().includes(this.currentSearchTerm.toLowerCase())
       );
    } else if (this.currentSearchTerm && this.currentKhoaFilter) {
        // Nếu có cả bộ lọc khoa VÀ search term, và API theo khoa không hỗ trợ tìm kiếm
        // thì vẫn cần lọc client-side.
        filteredList = filteredList.filter(boMon =>
            (boMon.tenBoMon.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
            boMon.maBoMon.toLowerCase().includes(this.currentSearchTerm.toLowerCase()))
        );
    }

    this.boMonList = filteredList; // Cập nhật danh sách hiển thị
  }

  onSelectBoMon(boMon: BoMon): void {
    this.selectedBoMon = boMon;
    this.boMonForm.patchValue({
      maBoMon: boMon.maBoMon,
      tenBoMon: boMon.tenBoMon,
      moTa: boMon.moTa,
      maKhoa: boMon.maKhoa
    });
    this.boMonForm.get('maBoMon')?.disable(); // Tắt trường mã khi chỉnh sửa
    this.clearMessages();
  }

  onSubmit(): void {
    // getRawValue() để lấy cả giá trị của trường bị disable (maBoMon khi chỉnh sửa)
    const formData = this.boMonForm.getRawValue(); 

    if (this.boMonForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ và đúng thông tin.';
      this.boMonForm.markAllAsTouched(); // Hiển thị lỗi validation cho tất cả các trường
      return;
    }

    if (this.selectedBoMon) {
      // Truyền maBoMon của selectedBoMon (đối tượng gốc) để đảm bảo đúng ID
      this.boMonService.updateBoMon(this.selectedBoMon.maBoMon, formData).subscribe({
        next: (_) => {
          this.successMessage = 'Cập nhật bộ môn thành công!';
          this.resetForm();
          this.refreshBoMonList(); // Làm mới danh sách sau khi cập nhật
        },
        // Đã sửa: Sửa kiểu lỗi thành Error và truy cập err.message
        error: (err: Error) => { 
          this.errorMessage = 'Lỗi khi cập nhật bộ môn: ' + (err.message || 'Lỗi không xác định.');
          console.error('Lỗi cập nhật bộ môn:', err);
        }
      });
    } else {
      this.boMonService.addBoMon(formData).subscribe({
        next: (_) => {
          this.successMessage = 'Thêm mới bộ môn thành công!';
          this.resetForm();
          this.refreshBoMonList(); // Làm mới danh sách sau khi thêm mới
        },
        // Đã sửa: Sửa kiểu lỗi thành Error và truy cập err.message
        error: (err: Error) => { 
          this.errorMessage = 'Lỗi khi thêm mới bộ môn: ' + (err.message || 'Lỗi không xác định.');
          console.error('Lỗi thêm mới bộ môn:', err);
        }
      });
    }
  }

  onDeleteBoMon(maBoMon: string): void {
    if (confirm(`Bạn có chắc chắn muốn xóa Bộ Môn '${maBoMon}' không?`)) {
      this.boMonService.deleteBoMon(maBoMon).subscribe({
        next: (_) => {
          this.successMessage = `Bộ Môn '${maBoMon}' đã được xóa thành công!`;
          this.refreshBoMonList(); // Làm mới danh sách sau khi xóa
          this.resetForm(); // Đảm bảo form được reset nếu Bộ Môn đang được chọn bị xóa
        },
        // Đã sửa: Sửa kiểu lỗi thành Error và truy cập err.message
        error: (err: Error) => { 
          this.errorMessage = 'Lỗi khi xóa bộ môn: ' + (err.message || 'Lỗi không xác định.');
          console.error('Lỗi xóa bộ môn:', err);
        }
      });
    }
  }

  resetForm(): void {
    this.boMonForm.reset();
    this.selectedBoMon = null;
    this.boMonForm.get('maBoMon')?.enable(); // Mở lại trường Mã Bộ Môn cho thêm mới
    this.clearMessages();
    this.boMonForm.get('maKhoa')?.setValue(''); // Đảm bảo dropdown khoa được reset
  }

  // Hàm refreshBoMonList đã được chỉnh sửa để kích hoạt refreshTriggerSubject
  refreshBoMonList(): void {
    this.refreshTriggerSubject.next();
  }

  onSearchTermChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchTermSubject.next(searchTerm);
  }

  onKhoaFilterChange(event: Event): void {
    const khoaId = (event.target as HTMLSelectElement).value;
    this.khoaFilterSubject.next(khoaId);
  }

  getKhoaTen(maKhoa: string): string {
    const khoa = this.khoaList.find(k => k.maKhoa === maKhoa);
    return khoa ? khoa.tenKhoa : 'N/A';
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}