import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThanhVienHoiDongService } from '../../../services/thanh-vien-hoi-dong.service';
import { HoiDongService } from '../../../services/hoi-dong.service'; 
import { GiangVienService } from '../../../services/giang-vien.service'; 

import { ThanhVienHoiDong } from '../../../models/ThanhVienHoiDong';
import { HoiDong } from '../../../models/HoiDong'; 
import { GiangVien } from '../../../models/GiangVien'; 

import { HttpErrorResponse } from '@angular/common/http';
import { Subject, combineLatest, of, throwError, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-quan-ly-thanh-vien-hoi-dong',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './quan-ly-thanh-vien-hoi-dong.component.html',
  styleUrls: ['./quan-ly-thanh-vien-hoi-dong.component.css']
})
export class QuanLyThanhVienHoiDongComponent implements OnInit {
  thanhVienHoiDongList: ThanhVienHoiDong[] = [];
  originalThanhVienHoiDongList: ThanhVienHoiDong[] = [];
  hoiDongList: HoiDong[] = []; 
  giangVienList: GiangVien[] = []; 

  thanhVienHoiDongForm: FormGroup;
  selectedThanhVienHoiDong: ThanhVienHoiDong | null = null; 

  errorMessage: string = '';
  successMessage: string = '';

  private searchTermSubject = new Subject<string>(); 
  private hoiDongFilterSubject = new Subject<string>();
  private gvFilterSubject = new Subject<string>(); 
  private refreshTriggerSubject = new Subject<void>();

  currentSearchTerm: string = '';
  currentHoiDongFilter: string = '';
  currentGvFilter: string = '';

  vaiTroOptions: string[] = ['Chủ tịch', 'Thư ký', 'Phản biện', 'Ủy viên'];

  constructor(
    private thanhVienHoiDongService: ThanhVienHoiDongService,
    private hoiDongService: HoiDongService,
    private giangVienService: GiangVienService,
    private fb: FormBuilder
  ) {
    this.thanhVienHoiDongForm = this.fb.group({
      maHoiDong: ['', Validators.required],
      maGV: ['', Validators.required],
      vaiTro: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDropdownData(); 

    this.searchTermSubject.next('');
    this.hoiDongFilterSubject.next('');
    this.gvFilterSubject.next('');

    combineLatest([
      this.searchTermSubject.pipe(startWith(this.currentSearchTerm), debounceTime(300), distinctUntilChanged()),
      this.hoiDongFilterSubject.pipe(startWith(this.currentHoiDongFilter), distinctUntilChanged()),
      this.gvFilterSubject.pipe(startWith(this.currentGvFilter), distinctUntilChanged()),
      this.refreshTriggerSubject.pipe(startWith(undefined as void))
    ]).pipe(
      switchMap(([searchTerm, hoiDongFilter, gvFilter, refreshTrigger]) => {
        this.currentSearchTerm = searchTerm;
        this.currentHoiDongFilter = hoiDongFilter;
        this.currentGvFilter = gvFilter;
        this.clearMessages();

        if (hoiDongFilter) {
          return this.thanhVienHoiDongService.getThanhVienHoiDongByHoiDongId(hoiDongFilter).pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Lỗi khi tải thành viên hội đồng theo hội đồng:', error);
              this.errorMessage = `Không thể tải thành viên cho hội đồng '${this.getHoiDongTen(hoiDongFilter)}'.`;
              return of([]);
            })
          );
        } else if (gvFilter) {
          return this.thanhVienHoiDongService.getThanhVienHoiDongByGiangVienId(gvFilter).pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Lỗi khi tải thành viên hội đồng theo giảng viên:', error);
              this.errorMessage = `Không thể tải thành viên cho giảng viên '${this.getGiangVienTen(gvFilter)}'.`;
              return of([]);
            })
          );
        } else {
          return this.thanhVienHoiDongService.getAllThanhVienHoiDong().pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Lỗi khi tải danh sách thành viên hội đồng:', error);
              this.errorMessage = 'Không thể tải danh sách thành viên hội đồng.';
              return of([]);
            })
          );
        }
      })
    ).subscribe(data => {
      this.originalThanhVienHoiDongList = data;
      this.applyClientSideFilters(); 
    });
  }

  loadDropdownData(): void {
    this.hoiDongService.searchHoiDong().subscribe({ 
      next: (data) => this.hoiDongList = data,
      error: (err: HttpErrorResponse) => console.error('Lỗi khi tải danh sách hội đồng:', err)
    });
    this.giangVienService.searchGiangVien().subscribe({
      next: (data) => this.giangVienList = data,
      error: (err: HttpErrorResponse) => console.error('Lỗi khi tải danh sách giảng viên:', err)
    });
  }

  applyClientSideFilters(): void {
    let filteredList = [...this.originalThanhVienHoiDongList];

    if (this.currentSearchTerm) {
      filteredList = filteredList.filter(tv =>
        tv.vaiTro.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
        this.getHoiDongTen(tv.maHoiDong).toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
        this.getGiangVienTen(tv.maGV).toLowerCase().includes(this.currentSearchTerm.toLowerCase())
      );
    }
    this.thanhVienHoiDongList = filteredList;
  }

  onSelectThanhVienHoiDong(thanhVien: ThanhVienHoiDong): void {
    this.selectedThanhVienHoiDong = thanhVien;
    this.thanhVienHoiDongForm.patchValue({
      maHoiDong: thanhVien.maHoiDong,
      maGV: thanhVien.maGV,
      vaiTro: thanhVien.vaiTro
    });
    this.thanhVienHoiDongForm.get('maHoiDong')?.disable(); 
    this.thanhVienHoiDongForm.get('maGV')?.disable(); 
    this.clearMessages();
  }

  onSubmit(): void {
    const formData = this.thanhVienHoiDongForm.getRawValue();

    if (this.thanhVienHoiDongForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ và đúng thông tin.';
      this.thanhVienHoiDongForm.markAllAsTouched();
      return;
    }

    if (this.selectedThanhVienHoiDong) {
      this.thanhVienHoiDongService.updateThanhVienHoiDong(
        this.selectedThanhVienHoiDong.maHoiDong,
        this.selectedThanhVienHoiDong.maGV,
        formData 
      ).subscribe({
        next: (_) => {
          this.successMessage = 'Cập nhật thành viên hội đồng thành công!';
          this.resetForm();
          this.refreshThanhVienHoiDongList();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi khi cập nhật thành viên hội đồng: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi cập nhật thành viên hội đồng:', err);
        }
      });
    } else {
      this.thanhVienHoiDongService.addThanhVienHoiDong(formData).subscribe({
        next: (_) => {
          this.successMessage = 'Thêm mới thành viên hội đồng thành công!';
          this.resetForm();
          this.refreshThanhVienHoiDongList();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi khi thêm mới thành viên hội đồng: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi thêm mới thành viên hội đồng:', err);
        }
      });
    }
  }

  onDeleteThanhVienHoiDong(maHoiDong: string, maGV: string): void {
    if (confirm(`Bạn có chắc chắn muốn xóa thành viên '${this.getGiangVienTen(maGV)}' khỏi Hội Đồng '${this.getHoiDongTen(maHoiDong)}' không?`)) {
      this.thanhVienHoiDongService.deleteThanhVienHoiDong(maHoiDong, maGV).subscribe({
        next: (_) => {
          this.successMessage = `Thành viên đã được xóa thành công!`;
          this.refreshThanhVienHoiDongList();
          this.resetForm();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi khi xóa thành viên hội đồng: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi xóa thành viên hội đồng:', err);
        }
      });
    }
  }

  resetForm(): void {
    this.thanhVienHoiDongForm.reset();
    this.selectedThanhVienHoiDong = null;
    this.thanhVienHoiDongForm.get('maHoiDong')?.enable();
    this.thanhVienHoiDongForm.get('maGV')?.enable();
    this.clearMessages();
    this.thanhVienHoiDongForm.get('maHoiDong')?.setValue(''); 
    this.thanhVienHoiDongForm.get('maGV')?.setValue(''); 
    this.thanhVienHoiDongForm.get('vaiTro')?.setValue(''); 
  }

  refreshThanhVienHoiDongList(): void {
    this.refreshTriggerSubject.next();
  }

  onSearchTermChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchTermSubject.next(searchTerm);
  }

  onHoiDongFilterChange(event: Event): void {
    const hoiDongId = (event.target as HTMLSelectElement).value;
    this.hoiDongFilterSubject.next(hoiDongId);
    this.gvFilterSubject.next(''); 
  }

  onGvFilterChange(event: Event): void {
    const gvId = (event.target as HTMLSelectElement).value;
    this.gvFilterSubject.next(gvId);
    this.hoiDongFilterSubject.next(''); 
  }

  getHoiDongTen(maHoiDong: string): string {
    const hoiDong = this.hoiDongList.find(hd => hd.maHoiDong === maHoiDong);
    return hoiDong ? hoiDong.tenHoiDong : 'N/A';
  }

  getGiangVienTen(maGV: string): string {
    const giangVien = this.giangVienList.find(gv => gv.maGV === maGV);
    return giangVien ? giangVien.hoTen : 'N/A';
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}
