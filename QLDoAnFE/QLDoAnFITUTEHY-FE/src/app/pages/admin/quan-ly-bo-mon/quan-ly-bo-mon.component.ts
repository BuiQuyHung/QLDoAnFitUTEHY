import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BoMonService } from '../../../services/bo-mon.service';
import { KhoaService } from '../../../services/khoa.service'; 
import { BoMon } from '../../../models/BoMon'; 
import { Khoa } from '../../../models/Khoa'; 
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
  originalBoMonList: BoMon[] = []; 
  khoaList: Khoa[] = [];
  boMonForm: FormGroup;
  selectedBoMon: BoMon | null = null;

  errorMessage: string = '';
  successMessage: string = '';

  private searchTermSubject = new Subject<string>();
  private khoaFilterSubject = new Subject<string>();
  private refreshTriggerSubject = new Subject<void>(); 

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
    
    this.searchTermSubject.next('');
    this.khoaFilterSubject.next('');

    combineLatest([
      this.searchTermSubject.pipe(startWith(this.currentSearchTerm), debounceTime(300), distinctUntilChanged()),
      this.khoaFilterSubject.pipe(startWith(this.currentKhoaFilter), distinctUntilChanged()),
      this.refreshTriggerSubject.pipe(startWith(undefined as void))
    ]).pipe(
      switchMap(([searchTerm, khoaFilter, refreshTrigger]) => {
        this.currentSearchTerm = searchTerm;
        this.currentKhoaFilter = khoaFilter;
        this.clearMessages(); 

        if (khoaFilter) {
          return this.boMonService.getBoMonByKhoaId(khoaFilter).pipe(
            catchError((error: HttpErrorResponse) => {
              console.error('Lỗi khi tải bộ môn theo khoa:', error);
              this.errorMessage = `Không thể tải bộ môn cho khoa '${this.getKhoaTen(khoaFilter)}'.`;
              return of([]);
            })
          );
        } else {
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
      this.applyClientSideFilters(); 
    });
  }

  loadKhoaList(): void {
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

  applyClientSideFilters(): void {
    let filteredList = [...this.originalBoMonList]; 
    if (this.currentSearchTerm && !this.currentKhoaFilter) { 
       filteredList = filteredList.filter(boMon =>
         boMon.tenBoMon.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
         boMon.maBoMon.toLowerCase().includes(this.currentSearchTerm.toLowerCase())
       );
    } else if (this.currentSearchTerm && this.currentKhoaFilter) {
        filteredList = filteredList.filter(boMon =>
            (boMon.tenBoMon.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
            boMon.maBoMon.toLowerCase().includes(this.currentSearchTerm.toLowerCase()))
        );
    }

    this.boMonList = filteredList; 
  }

  onSelectBoMon(boMon: BoMon): void {
    this.selectedBoMon = boMon;
    this.boMonForm.patchValue({
      maBoMon: boMon.maBoMon,
      tenBoMon: boMon.tenBoMon,
      moTa: boMon.moTa,
      maKhoa: boMon.maKhoa
    });
    this.boMonForm.get('maBoMon')?.disable();
    this.clearMessages();
  }

  onSubmit(): void {
    const formData = this.boMonForm.getRawValue(); 

    if (this.boMonForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ và đúng thông tin.';
      this.boMonForm.markAllAsTouched(); 
      return;
    }

    if (this.selectedBoMon) {
      this.boMonService.updateBoMon(this.selectedBoMon.maBoMon, formData).subscribe({
        next: (_) => {
          this.successMessage = 'Cập nhật bộ môn thành công!';
          this.resetForm();
          this.refreshBoMonList(); 
        },
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
          this.refreshBoMonList(); 
        },
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
          this.refreshBoMonList(); 
          this.resetForm(); 
        },
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
    this.boMonForm.get('maBoMon')?.enable(); 
    this.clearMessages();
    this.boMonForm.get('maKhoa')?.setValue(''); 
  }

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