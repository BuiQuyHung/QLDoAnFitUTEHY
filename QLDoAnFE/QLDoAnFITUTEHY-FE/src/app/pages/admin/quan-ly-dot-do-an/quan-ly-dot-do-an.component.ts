import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { DotDoAnService } from '../../../services/dot-do-an.service';
import { LopService } from '../../../services/lop.service';
import { GiangVienService } from '../../../services/giang-vien.service';
import { DotDoAn, DotDoAnForManipulation } from '../../../models/DotDoAn';
import { Lop } from '../../../models/Lop';
import { GiangVien } from '../../../models/GiangVien';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, combineLatest, of, Subscription, interval } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-quan-ly-dot-do-an',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './quan-ly-dot-do-an.component.html',
  styleUrls: ['./quan-ly-dot-do-an.component.css']
})
export class QuanLyDotDoAnComponent implements OnInit, OnDestroy {
  dotDoAnList: DotDoAn[] = [];
  lopList: Lop[] = [];
  giangVienList: GiangVien[] = [];
  dotDoAnForm: FormGroup;
  selectedDotDoAn: DotDoAn | null = null;

  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  private searchTermSubject = new Subject<string>();
  private refreshTriggerSubject = new Subject<void>();
  private formControlSubscription: Subscription | undefined;
  private intervalSubscription: Subscription | undefined;

  constructor(
    private dotDoAnService: DotDoAnService,
    private lopService: LopService,
    private giangVienService: GiangVienService,
    private fb: FormBuilder
  ) {
    this.dotDoAnForm = this.fb.group({
      maDotDoAn: ['', Validators.required],
      tenDotDoAn: ['', Validators.required],
      khoaHoc: ['', Validators.required],
      ngayBatDau: ['', Validators.required],
      ngayKetThuc: [{ value: '', disabled: true }],
      soTuanThucHien: [0, [Validators.required, Validators.min(1)]],
      lopIds: this.fb.array([]),
      giangVienIds: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadDependencies();
    this.setupDataLoading();
    this.setupAutomaticDateCalculation();
    this.startStatusUpdateInterval();
  }

  ngOnDestroy(): void {
    if (this.formControlSubscription) {
      this.formControlSubscription.unsubscribe();
    }
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
    this.searchTermSubject.complete();
    this.refreshTriggerSubject.complete();
  }

  get lopIdsFormArray(): FormArray {
    return this.dotDoAnForm.get('lopIds') as FormArray;
  }

  get giangVienIdsFormArray(): FormArray {
    return this.dotDoAnForm.get('giangVienIds') as FormArray;
  }

  setupAutomaticDateCalculation(): void {
    this.formControlSubscription = combineLatest([
      this.dotDoAnForm.get('ngayBatDau')!.valueChanges.pipe(startWith(this.dotDoAnForm.get('ngayBatDau')!.value)),
      this.dotDoAnForm.get('soTuanThucHien')!.valueChanges.pipe(startWith(this.dotDoAnForm.get('soTuanThucHien')!.value))
    ]).pipe(
      debounceTime(100),
      map(([ngayBatDau, soTuanThucHien]) => {
        if (ngayBatDau && soTuanThucHien && soTuanThucHien > 0) {
          const startDate = new Date(ngayBatDau);
          startDate.setDate(startDate.getDate() + (soTuanThucHien * 7));
          return startDate.toISOString().split('T')[0];
        }
        return '';
      })
    ).subscribe(calculatedNgayKetThuc => {
      if (!this.selectedDotDoAn || this.dotDoAnForm.get('ngayKetThuc')?.pristine) {
           this.dotDoAnForm.get('ngayKetThuc')?.setValue(calculatedNgayKetThuc);
      }
    });
  }

  calculateTrangThai(ngayKetThuc: string | undefined): string {
    if (!ngayKetThuc) {
      return 'N/A';
    }
    const endDate = new Date(ngayKetThuc);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (today > endDate) {
      return 'Kết thúc';
    } else {
      return 'Đang diễn ra';
    }
  }

  startStatusUpdateInterval(): void {
    this.intervalSubscription = interval(60 * 60 * 1000)
      .pipe(startWith(0))
      .subscribe(() => {
        this.dotDoAnList = this.dotDoAnList.map(dda => ({
          ...dda,
          trangThai: this.calculateTrangThai(dda.ngayKetThuc ? new Date(dda.ngayKetThuc).toISOString().split('T')[0] : undefined) as 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'CANCELLED' | undefined
        }));
      });
  }


  loadDependencies(): void {
    this.isLoading = true;
    combineLatest([
      this.lopService.searchLop().pipe(
        catchError((err) => {
          console.error('Lỗi khi tải danh sách lớp:', err);
          this.errorMessage = 'Không thể tải danh sách lớp.';
          return of([]);
        })
      ),
      this.giangVienService.searchGiangVien().pipe(
        catchError((err) => {
          console.error('Lỗi khi tải danh sách giảng viên:', err);
          this.errorMessage = 'Không thể tải danh sách giảng viên.';
          return of([]);
        })
      )
    ]).subscribe(([lops, giangViens]) => {
      this.lopList = lops;
      this.giangVienList = giangViens;
      this.isLoading = false;
    });
  }

  setupDataLoading(): void {
    combineLatest([
      this.searchTermSubject.pipe(startWith(''), debounceTime(300), distinctUntilChanged()),
      this.refreshTriggerSubject.pipe(startWith(undefined as void))
    ]).pipe(
      switchMap(([searchTerm, _]) => {
        this.clearMessages();
        this.isLoading = true;
        return this.dotDoAnService.getAllDotDoAn().pipe(
          map(data => {
            return data.map(dda => ({
              ...dda,
              trangThai: this.calculateTrangThai(dda.ngayKetThuc ? new Date(dda.ngayKetThuc).toISOString().split('T')[0] : undefined) as 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'CANCELLED' | undefined
            })).filter(dda =>
                searchTerm ? (dda.tenDotDoAn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                dda.maDotDoAn.toLowerCase().includes(searchTerm.toLowerCase())) : true
              );
          }),
          catchError((error: HttpErrorResponse) => {
            console.error('Lỗi khi tải danh sách đợt đồ án:', error);
            this.errorMessage = 'Không thể tải danh sách đợt đồ án.';
            return of([]);
          })
        );
      })
    ).subscribe(data => {
      this.dotDoAnList = data;
      this.isLoading = false;
    });
  }

  onSelectDotDoAn(dotDoAn: DotDoAn): void {
    this.selectedDotDoAn = dotDoAn;
    const ngayBatDauFormatted = dotDoAn.ngayBatDau ? new Date(dotDoAn.ngayBatDau).toISOString().split('T')[0] : '';
    const ngayKetThucFormatted = dotDoAn.ngayKetThuc ? new Date(dotDoAn.ngayKetThuc).toISOString().split('T')[0] : '';

    this.dotDoAnForm.patchValue({
      maDotDoAn: dotDoAn.maDotDoAn,
      tenDotDoAn: dotDoAn.tenDotDoAn,
      khoaHoc: dotDoAn.khoaHoc,
      ngayBatDau: ngayBatDauFormatted,
      ngayKetThuc: ngayKetThucFormatted,
      soTuanThucHien: dotDoAn.soTuanThucHien,
    });

    this.lopIdsFormArray.clear();
    dotDoAn.dsLop?.forEach((lop: Lop) => this.lopIdsFormArray.push(new FormControl(lop.maLop)));

    this.giangVienIdsFormArray.clear();
    dotDoAn.dsGiangVien?.forEach((gv: GiangVien) => this.giangVienIdsFormArray.push(new FormControl(gv.maGV)));

    this.dotDoAnForm.get('maDotDoAn')?.disable();
    this.clearMessages();
  }

  isLopSelected(maLop: string): boolean {
    return this.lopIdsFormArray.controls.some(control => control.value === maLop);
  }

  isGiangVienSelected(maGV: string): boolean {
    return this.giangVienIdsFormArray.controls.some(control => control.value === maGV);
  }

  onLopSelectionChange(event: any): void {
    const selectedOptions = Array.from(event.target.selectedOptions) as HTMLOptionElement[];
    const selectedLopIds = selectedOptions.map(option => option.value);

    this.lopIdsFormArray.clear();
    selectedLopIds.forEach(id => this.lopIdsFormArray.push(new FormControl(id)));
  }

  onGiangVienSelectionChange(event: any): void {
    const selectedOptions = Array.from(event.target.selectedOptions) as HTMLOptionElement[];
    const selectedGiangVienIds = selectedOptions.map(option => option.value);

    this.giangVienIdsFormArray.clear();
    selectedGiangVienIds.forEach(id => this.giangVienIdsFormArray.push(new FormControl(id)));
  }

  onSubmit(): void {
    this.clearMessages();
    this.dotDoAnForm.get('ngayKetThuc')?.enable();

    if (this.dotDoAnForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ và đúng thông tin.';
      this.dotDoAnForm.markAllAsTouched();
      this.dotDoAnForm.get('ngayKetThuc')?.disable();
      return;
    }

    if (this.lopIdsFormArray.length === 0) {
      this.errorMessage = 'Vui lòng chọn ít nhất một lớp.';
      this.lopIdsFormArray.markAsTouched();
      this.dotDoAnForm.get('ngayKetThuc')?.disable();
      return;
    }
    if (this.giangVienIdsFormArray.length === 0) {
      this.errorMessage = 'Vui lòng chọn ít nhất một giảng viên.';
      this.giangVienIdsFormArray.markAsTouched();
      this.dotDoAnForm.get('ngayKetThuc')?.disable();
      return;
    }

    const formData: DotDoAnForManipulation = this.dotDoAnForm.getRawValue();

     const payload: DotDoAnForManipulation = {
      maDotDoAn: formData.maDotDoAn,
      tenDotDoAn: formData.tenDotDoAn,
      khoaHoc: formData.khoaHoc,
      ngayBatDau: formData.ngayBatDau,
      ngayKetThuc: formData.ngayKetThuc,
      soTuanThucHien: formData.soTuanThucHien,
      lopIds: formData.lopIds,
      giangVienIds: formData.giangVienIds,
    };


    if (this.selectedDotDoAn) {
      this.dotDoAnService.updateDotDoAn(this.selectedDotDoAn.maDotDoAn, payload).subscribe({
        next: () => {
          this.successMessage = 'Cập nhật đợt đồ án thành công!';
          this.resetForm();
          this.refreshDotDoAnList();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = `Lỗi khi cập nhật đợt đồ án: ${err.error?.message || err.message || 'Lỗi không xác định.'}`;
          console.error('Lỗi cập nhật đợt đồ án:', err);
        },
        complete: () => {
             this.dotDoAnForm.get('ngayKetThuc')?.disable();
        }
      });
    } else {
      this.dotDoAnService.addDotDoAn(payload).subscribe({
        next: () => {
          this.successMessage = 'Thêm mới đợt đồ án thành công!';
          this.resetForm();
          this.refreshDotDoAnList();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = `Lỗi khi thêm mới đợt đồ án: ${err.error?.message || err.message || 'Lỗi không xác định.'}`;
          console.error('Lỗi thêm mới đợt đồ án:', err);
        },
        complete: () => {
            this.dotDoAnForm.get('ngayKetThuc')?.disable();
        }
      });
    }
  }

  onDeleteDotDoAn(maDotDoAn: string): void {
    if (confirm(`Bạn có chắc chắn muốn xóa Đợt Đồ Án '${maDotDoAn}' không?`)) {
      this.dotDoAnService.deleteDotDoAn(maDotDoAn).subscribe({
        next: () => {
          this.successMessage = `Đợt Đồ Án '${maDotDoAn}' đã được xóa thành công!`;
          this.refreshDotDoAnList();
          this.resetForm();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = `Lỗi khi xóa đợt đồ án: ${err.error?.message || err.message || 'Lỗi không xác định.'}`;
          console.error('Lỗi xóa đợt đồ án:', err);
        }
      });
    }
  }

  resetForm(): void {
    this.dotDoAnForm.reset({
      maDotDoAn: '',
      tenDotDoAn: '',
      khoaHoc: '',
      ngayBatDau: '',
      ngayKetThuc: '',
      soTuanThucHien: 0,
    });
    this.selectedDotDoAn = null;
    this.dotDoAnForm.get('maDotDoAn')?.enable();
    this.dotDoAnForm.get('ngayKetThuc')?.disable();
    this.clearMessages();
    this.lopIdsFormArray.clear();
    this.giangVienIdsFormArray.clear();
  }

  refreshDotDoAnList(): void {
    this.refreshTriggerSubject.next();
  }

  onSearchTermChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchTermSubject.next(searchTerm);
  }

  getLopNames(dsLop: Lop[] | undefined): string {
    if (!dsLop || dsLop.length === 0) {
      return 'N/A';
    }
    return dsLop.map(lop => lop.tenLop).join(', ');
  }

  getGiangVienNames(dsGiangVien: GiangVien[] | undefined): string {
    if (!dsGiangVien || dsGiangVien.length === 0) {
      return 'N/A';
    }
    return dsGiangVien.map(gv => gv.hoTen).join(', ');
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}