// src/app/pages/admin/quan-ly-nganh/quan-ly-nganh.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NganhService } from '../../../services/nganh.service';
import { BoMonService } from '../../../services/bo-mon.service'; // Cần để lấy danh sách Bộ Môn
import { Nganh } from '../../../models/Nganh';
import { BoMon } from '../../../models/BoMon'; // Import model BoMon
import { HttpErrorResponse } from '@angular/common/http';

import { Subject, combineLatest, of, throwError } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-quan-ly-nganh',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './quan-ly-nganh.component.html',
  styleUrls: ['./quan-ly-nganh.component.css']
})
export class QuanLyNganhComponent implements OnInit {
  nganhList: Nganh[] = [];
  originalNganhList: Nganh[] = [];
  boMonList: BoMon[] = []; // Danh sách Bộ Môn cho dropdown
  nganhForm: FormGroup;
  selectedNganh: Nganh | null = null;

  errorMessage: string = '';
  successMessage: string = '';

  private searchTermSubject = new Subject<string>();
  private boMonFilterSubject = new Subject<string>(); // Lọc theo Bộ Môn
  private refreshTriggerSubject = new Subject<void>();

  currentSearchTerm: string = '';
  currentBoMonFilter: string = '';

  constructor(
    private nganhService: NganhService,
    private boMonService: BoMonService, // Inject BoMonService
    private fb: FormBuilder
  ) {
    this.nganhForm = this.fb.group({
      maNganh: ['', Validators.required],
      tenNganh: ['', Validators.required],
      maBoMon: ['', Validators.required] // Trường khóa ngoại
    });
  }

  ngOnInit(): void {
    this.loadBoMonList(); // Tải danh sách Bộ Môn cho dropdown

    this.searchTermSubject.next('');
    this.boMonFilterSubject.next('');

    combineLatest([
      this.searchTermSubject.pipe(startWith(this.currentSearchTerm), debounceTime(300), distinctUntilChanged()),
      this.boMonFilterSubject.pipe(startWith(this.currentBoMonFilter), distinctUntilChanged()),
      this.refreshTriggerSubject.pipe(startWith(undefined as void))
    ]).pipe(
      switchMap(([searchTerm, boMonFilter, refreshTrigger]) => {
        this.currentSearchTerm = searchTerm;
        this.currentBoMonFilter = boMonFilter;
        this.clearMessages();

        if (boMonFilter) {
          // Nếu có lọc theo Bộ Môn
          return this.nganhService.getNganhByBoMonId(boMonFilter).pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Lỗi khi tải ngành theo bộ môn:', error);
              this.errorMessage = `Không thể tải ngành cho bộ môn '${this.getBoMonTen(boMonFilter)}'.`;
              return of([]);
            })
          );
        } else {
          // Nếu không có lọc theo Bộ Môn, tải tất cả hoặc tìm kiếm theo term
          return this.nganhService.searchNganh(searchTerm).pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Lỗi khi tải danh sách ngành:', error);
              this.errorMessage = 'Không thể tải danh sách ngành.';
              return of([]);
            })
          );
        }
      })
    ).subscribe(data => {
      this.originalNganhList = data;
      this.applyClientSideFilters(); // Áp dụng lọc tìm kiếm (nếu có)
    });
  }

  // Tải danh sách Bộ Môn cho dropdown lọc và form
  loadBoMonList(): void {
    this.boMonService.searchBoMon().subscribe({ // Sử dụng searchBoMon để lấy tất cả
      next: (data) => {
        this.boMonList = data;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Lỗi khi tải danh sách bộ môn:', err);
        this.errorMessage = 'Không thể tải danh sách bộ môn để lọc.';
      }
    });
  }

  // Áp dụng bộ lọc tìm kiếm trên client-side
  applyClientSideFilters(): void {
    let filteredList = [...this.originalNganhList]; 

    if (this.currentSearchTerm) {
      filteredList = filteredList.filter(nganh =>
        nganh.tenNganh.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
        nganh.maNganh.toLowerCase().includes(this.currentSearchTerm.toLowerCase())
      );
    }
    this.nganhList = filteredList; 
  }

  onSelectNganh(nganh: Nganh): void {
    this.selectedNganh = nganh;
    this.nganhForm.patchValue({
      maNganh: nganh.maNganh,
      tenNganh: nganh.tenNganh,
      maBoMon: nganh.maBoMon
    });
    this.nganhForm.get('maNganh')?.disable(); // Tắt trường mã khi chỉnh sửa
    this.clearMessages();
  }

  onSubmit(): void {
    const formData = this.nganhForm.getRawValue(); 

    if (this.nganhForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ và đúng thông tin.';
      this.nganhForm.markAllAsTouched(); 
      return;
    }

    if (this.selectedNganh) {
      this.nganhService.updateNganh(this.selectedNganh.maNganh, formData).subscribe({
        next: (_) => {
          this.successMessage = 'Cập nhật ngành thành công!';
          this.resetForm();
          this.refreshNganhList(); 
        },
        error: (err: Error) => { 
          this.errorMessage = 'Lỗi khi cập nhật ngành: ' + (err.message || 'Lỗi không xác định.');
          console.error('Lỗi cập nhật ngành:', err);
        }
      });
    } else {
      this.nganhService.addNganh(formData).subscribe({
        next: (_) => {
          this.successMessage = 'Thêm mới ngành thành công!';
          this.resetForm();
          this.refreshNganhList(); 
        },
        error: (err: Error) => { 
          this.errorMessage = 'Lỗi khi thêm mới ngành: ' + (err.message || 'Lỗi không xác định.');
          console.error('Lỗi thêm mới ngành:', err);
        }
      });
    }
  }

  onDeleteNganh(maNganh: string): void {
    if (confirm(`Bạn có chắc chắn muốn xóa Ngành '${maNganh}' không?`)) {
      this.nganhService.deleteNganh(maNganh).subscribe({
        next: (_) => {
          this.successMessage = `Ngành '${maNganh}' đã được xóa thành công!`;
          this.refreshNganhList(); 
          this.resetForm(); 
        },
        error: (err: Error) => { 
          this.errorMessage = 'Lỗi khi xóa ngành: ' + (err.message || 'Lỗi không xác định.');
          console.error('Lỗi xóa ngành:', err);
        }
      });
    }
  }

  resetForm(): void {
    this.nganhForm.reset();
    this.selectedNganh = null;
    this.nganhForm.get('maNganh')?.enable(); 
    this.clearMessages();
    this.nganhForm.get('maBoMon')?.setValue(''); // Đảm bảo dropdown bộ môn được reset
  }

  refreshNganhList(): void {
    this.refreshTriggerSubject.next();
  }

  onSearchTermChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchTermSubject.next(searchTerm);
  }

  onBoMonFilterChange(event: Event): void {
    const boMonId = (event.target as HTMLSelectElement).value;
    this.boMonFilterSubject.next(boMonId);
  }

  getBoMonTen(maBoMon: string): string {
    const boMon = this.boMonList.find(bm => bm.maBoMon === maBoMon);
    return boMon ? boMon.tenBoMon : 'N/A';
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}