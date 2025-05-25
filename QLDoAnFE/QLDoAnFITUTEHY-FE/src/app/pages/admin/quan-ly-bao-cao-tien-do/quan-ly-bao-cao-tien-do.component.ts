// src/app/pages/quan-ly-bao-cao-tien-do/quan-ly-bao-cao-tien-do.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, startWith, map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';

import { BaoCaoTienDoService } from '../../../services/bao-cao-tien-do.service';
import { DeTaiService } from '../../../services/de-tai.service';

import { BaoCaoTienDo } from '../../../models/BaoCaoTienDo';
import { DeTai } from '../../../models/DeTai';

@Component({
  selector: 'app-quan-ly-bao-cao-tien-do',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe
  ],
  templateUrl: './quan-ly-bao-cao-tien-do.component.html',
  styleUrls: ['./quan-ly-bao-cao-tien-do.component.css']
})
export class QuanLyBaoCaoTienDoComponent implements OnInit {
  baoCaoList: BaoCaoTienDo[] = [];
  originalBaoCaoList: BaoCaoTienDo[] = [];
  deTaiList: DeTai[] = [];

  baoCaoForm: FormGroup;
  reviewForm: FormGroup;
  selectedBaoCao: BaoCaoTienDo | null = null;
  // ĐÃ BỎ: Không cần biến này nữa vì chúng ta không upload file vật lý
  // selectedFile: File | null = null; 

  errorMessage: string = '';
  successMessage: string = '';

  private searchTermSubject = new Subject<string>();
  private deTaiFilterSubject = new Subject<string>();
  private refreshTriggerSubject = new Subject<void>();

  currentSearchTerm: string = '';
  currentDeTaiFilter: string = '';

  trangThaiBaoCaoOptions: string[] = ['Đã nộp', 'Đã duyệt', 'Cần sửa đổi'];

  constructor(
    private baoCaoTienDoService: BaoCaoTienDoService,
    private deTaiService: DeTaiService,
    private fb: FormBuilder
  ) {
    this.baoCaoForm = this.fb.group({
      maBaoCao: ['', Validators.required],
      maDeTai: ['', Validators.required],
      tuanBaoCao: ['', [Validators.required, Validators.min(1)]],
      ngayBaoCao: [this.formatDate(new Date()), Validators.required],
      noiDungBaoCao: ['', Validators.required],
      trangThai: ['Đã nộp', Validators.required],
      // THÊM TRƯỜNG tepDinhKem VÀO FORMGROUP VỚI VALIDATOR URL
      tepDinhKem: ['', Validators.pattern('^(https?|ftp)://[^\\s/$.?#].[^\\s]*$')] // Validator URL cơ bản
    });

    this.reviewForm = this.fb.group({
      nhanXetCuaGV: ['', Validators.required],
      diemSo: ['', [Validators.required, Validators.min(0), Validators.max(10)]],
      trangThai: ['Đã duyệt', Validators.required],
      ngayDuyet: [this.formatDate(new Date()), Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDropdownData();

    this.searchTermSubject.next('');
    this.deTaiFilterSubject.next('');

    combineLatest([
      this.searchTermSubject.pipe(startWith(this.currentSearchTerm), debounceTime(300), distinctUntilChanged()),
      this.deTaiFilterSubject.pipe(startWith(this.currentDeTaiFilter), distinctUntilChanged()),
      this.refreshTriggerSubject.pipe(startWith(undefined as void))
    ]).pipe(
      switchMap(([searchTerm, deTaiFilter, refreshTrigger]) => {
        this.currentSearchTerm = searchTerm;
        this.currentDeTaiFilter = deTaiFilter;
        this.clearMessages();

        return this.baoCaoTienDoService.getBaoCaoTienDos().pipe(
          map(baocaos => {
            if (deTaiFilter) {
              return baocaos.filter(bc => bc.maDeTai === deTaiFilter);
            }
            return baocaos;
          }),
          catchError((error: HttpErrorResponse) => {
            console.error('Lỗi khi tải danh sách báo cáo tiến độ:', error);
            this.errorMessage = 'Không thể tải danh sách báo cáo tiến độ.';
            return of([]);
          })
        );
      })
    ).subscribe(data => {
      this.originalBaoCaoList = data;
      this.applyClientSideFilters();
    });
  }

  loadDropdownData(): void {
    this.deTaiService.getDeTais().subscribe({
      next: (data) => this.deTaiList = data,
      error: (err: HttpErrorResponse) => console.error('Lỗi tải đề tài:', err)
    });
  }

  applyClientSideFilters(): void {
    let filteredList = [...this.originalBaoCaoList];

    if (this.currentSearchTerm) {
      filteredList = filteredList.filter(baoCao =>
        baoCao.noiDungBaoCao.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
        baoCao.maBaoCao.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
        (baoCao.maDeTai && this.getDeTaiTen(baoCao.maDeTai).toLowerCase().includes(this.currentSearchTerm.toLowerCase()))
      );
    }
    this.baoCaoList = filteredList;
  }

  onSelectBaoCao(baoCao: BaoCaoTienDo): void {
    this.selectedBaoCao = baoCao;
    this.baoCaoForm.patchValue({
      maBaoCao: baoCao.maBaoCao,
      maDeTai: baoCao.maDeTai,
      tuanBaoCao: baoCao.tuanBaoCao,
      ngayBaoCao: baoCao.ngayBaoCao ? this.formatDate(new Date(baoCao.ngayBaoCao)) : '',
      noiDungBaoCao: baoCao.noiDungBaoCao,
      trangThai: baoCao.trangThai,
      tepDinhKem: baoCao.tepDinhKem || '' // Gán giá trị tepDinhKem vào form
    });
    this.baoCaoForm.get('maBaoCao')?.disable();
    this.clearMessages();

    this.reviewForm.reset();
    this.reviewForm.patchValue({
      nhanXetCuaGV: baoCao.nhanXetCuaGV || '',
      diemSo: baoCao.diemSo || null,
      trangThai: baoCao.trangThai || 'Đã duyệt',
      ngayDuyet: baoCao.ngayDuyet ? this.formatDate(new Date(baoCao.ngayDuyet)) : this.formatDate(new Date())
    });
  }

  // ĐÃ BỎ: Không cần phương thức onFileSelected NỮA
  // onFileSelected(event: Event): void {
  //   const element = event.target as HTMLInputElement;
  //   if (element.files && element.files.length > 0) {
  //     this.selectedFile = element.files[0];
  //   } else {
  //     this.selectedFile = null;
  //   }
  // }

  onSubmitBaoCao(): void {
    const formData = this.baoCaoForm.getRawValue();

    if (this.baoCaoForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ và đúng thông tin báo cáo.';
      this.baoCaoForm.markAllAsTouched();
      return;
    }

    // ĐÃ BỎ: Không còn logic upload file vật lý nữa
    // if (this.selectedFile) {
    //   this.baoCaoTienDoService.uploadFile(this.selectedFile).subscribe({
    //     next: (response) => {
    //       formData.tepDinhKem = response.fileName;
    //       this.sendBaoCaoData(formData);
    //     },
    //     error: (err: HttpErrorResponse) => {
    //       this.errorMessage = 'Lỗi khi upload file: ' + (err.error?.message || err.message);
    //       console.error('Lỗi upload file:', err);
    //     }
    //   });
    // } else {
    //   this.sendBaoCaoData(formData);
    // }

    // CHỈ GỬI formData (bao gồm URL của tệp đính kèm nếu có)
    this.sendBaoCaoData(formData);
  }

  private sendBaoCaoData(data: BaoCaoTienDo): void {
    if (this.selectedBaoCao) {
      this.baoCaoTienDoService.updateBaoCaoTienDo(this.selectedBaoCao.maBaoCao, data).subscribe({
        next: (_) => {
          this.successMessage = 'Cập nhật báo cáo tiến độ thành công!';
          this.resetForm();
          this.refreshBaoCaoList();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi khi cập nhật báo cáo: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi cập nhật báo cáo:', err);
        }
      });
    } else {
      this.baoCaoTienDoService.addBaoCaoTienDo(data).subscribe({
        next: (_) => {
          this.successMessage = 'Thêm mới báo cáo tiến độ thành công!';
          this.resetForm();
          this.refreshBaoCaoList();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi khi thêm mới báo cáo: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi thêm mới báo cáo:', err);
        }
      });
    }
  }

  onSubmitReview(): void {
    if (!this.selectedBaoCao) {
      this.errorMessage = 'Vui lòng chọn một báo cáo để nhận xét.';
      return;
    }

    if (this.reviewForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ và đúng thông tin nhận xét.';
      this.reviewForm.markAllAsTouched();
      return;
    }

    const reviewData = {
      ...this.reviewForm.value,
      ngayDuyet: new Date(this.reviewForm.value.ngayDuyet)
    };

    this.baoCaoTienDoService.reviewBaoCaoTienDo(this.selectedBaoCao.maBaoCao, reviewData).subscribe({
      next: (_) => {
        this.successMessage = 'Nhận xét và cập nhật trạng thái báo cáo thành công!';
        this.resetForm();
        this.refreshBaoCaoList();
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage = 'Lỗi khi nhận xét báo cáo: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
        console.error('Lỗi nhận xét báo cáo:', err);
      }
    });
  }

  onDeleteBaoCao(maBaoCao: string): void {
    if (confirm(`Bạn có chắc chắn muốn xóa Báo cáo Tiến độ '${maBaoCao}' không?`)) {
      this.baoCaoTienDoService.deleteBaoCaoTienDo(maBaoCao).subscribe({
        next: (_) => {
          this.successMessage = `Báo cáo Tiến độ '${maBaoCao}' đã được xóa thành công!`;
          this.refreshBaoCaoList();
          this.resetForm();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi khi xóa báo cáo: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi xóa báo cáo:', err);
        }
      });
    }
  }

  // ĐÃ SỬA: Phương thức này giờ sẽ mở URL trong tab mới thay vì tải file vật lý
  onDownloadFile(url?: string): void {
    if (!url) {
      this.errorMessage = 'Không có tệp đính kèm để mở.';
      return;
    }
    // Giả sử url bây giờ là một URL hợp lệ
    window.open(url, '_blank');
    this.successMessage = 'Đang mở tệp đính kèm trong tab mới.';
    // ĐÃ BỎ: Không còn logic tải file vật lý nữa
    // this.baoCaoTienDoService.downloadFile(fileName).subscribe({
    //   next: (blob) => {
    //     const url = window.URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = fileName;
    //     document.body.appendChild(a);
    //     a.click();
    //     document.body.removeChild(a);
    //     window.URL.revokeObjectURL(url);
    //   },
    //   error: (err: HttpErrorResponse) => {
    //     this.errorMessage = 'Lỗi khi tải tệp đính kèm: ' + (err.status === 404 ? 'Không tìm thấy tệp.' : err.message || 'Lỗi không xác định.');
    //     console.error('Lỗi tải file:', err);
    //   }
    // });
  }

  // THÊM PHƯƠNG THỨC ĐỂ XÓA ĐƯỜNG DẪN TỆP ĐÍNH KÈM
  removeAttachedFile(): void {
    if (this.selectedBaoCao) {
      this.selectedBaoCao.tepDinhKem = null; // Xóa trong đối tượng selectedBaoCao nếu đang sửa
    }
    this.baoCaoForm.patchValue({ tepDinhKem: '' }); // Đặt lại trường đường dẫn trong form
    this.clearMessages();
    this.successMessage = 'Đã xóa đường dẫn tệp đính kèm khỏi form.';
  }

  resetForm(): void {
    this.baoCaoForm.reset();
    this.reviewForm.reset();
    this.selectedBaoCao = null;
    // ĐÃ BỎ: Không cần thiết nữa
    // this.selectedFile = null; 
    this.baoCaoForm.get('maBaoCao')?.enable();
    this.clearMessages();
    this.baoCaoForm.patchValue({
      ngayBaoCao: this.formatDate(new Date()),
      trangThai: 'Đã nộp',
      maDeTai: '',
      tepDinhKem: '' // Đặt lại trường đường dẫn tệp đính kèm khi reset form
    });
    this.reviewForm.patchValue({
      ngayDuyet: this.formatDate(new Date()),
      trangThai: 'Đã duyệt'
    });
  }

  refreshBaoCaoList(): void {
    this.refreshTriggerSubject.next();
  }

  onSearchTermChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchTermSubject.next(searchTerm);
  }

  onDeTaiFilterChange(event: Event): void {
    const deTaiId = (event.target as HTMLSelectElement).value;
    this.deTaiFilterSubject.next(deTaiId);
  }

  getDeTaiTen(maDeTai?: string): string {
    const deTai = this.deTaiList.find(dt => dt.maDeTai === maDeTai);
    return deTai ? deTai.tenDeTai : 'N/A';
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}