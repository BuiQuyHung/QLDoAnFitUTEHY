// src/app/pages/sinh-vien/bao-cao-tien-do/sinh-vien-bao-cao-tien-do.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, startWith, map, filter } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

import { BaoCaoTienDoService } from '../../../services/bao-cao-tien-do.service';
import { DeTaiService } from '../../../services/de-tai.service';
import { BaoCaoTienDo } from '../../../models/BaoCaoTienDo';
import { DeTai } from '../../../models/DeTai';
import { AuthService } from '../../../services/auth.service';
// import { UserInfo } from '../../../models/auth.model'; // Import UserInfo nếu bạn muốn kiểu dữ liệu chặt chẽ hơn

@Component({
  selector: 'app-sinh-vien-bao-cao-tien-do',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe
  ],
  templateUrl: './sinh-vien-bao-cao-tien-do.component.html',
  styleUrls: ['./sinh-vien-bao-cao-tien-do.component.css']
})
export class SinhVienBaoCaoTienDoComponent implements OnInit {
  baoCaoList: BaoCaoTienDo[] = [];
  originalBaoCaoList: BaoCaoTienDo[] = [];
  deTaiCuaToi: DeTai | null = null;

  baoCaoForm: FormGroup;
  selectedBaoCao: BaoCaoTienDo | null = null;

  errorMessage: string = '';
  successMessage: string = '';

  private searchTermSubject = new Subject<string>();
  private refreshTriggerSubject = new Subject<void>();
  private deTaiLoadedSubject = new Subject<boolean>(); // Sử dụng để đồng bộ việc tải đề tài và báo cáo

  currentSearchTerm: string = '';
  currentMaSV: string | null = null;

  // Thuộc tính này không còn cần thiết vì trạng thái được quản lý tự động hoặc chỉ đọc từ server
  // trangThaiBaoCaoOptions: string[] = ['Đã nộp', 'Cần sửa đổi'];

  constructor(
    private baoCaoTienDoService: BaoCaoTienDoService,
    private deTaiService: DeTaiService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.baoCaoForm = this.fb.group({
      maBaoCao: ['', Validators.required],
      // Đảm bảo disabled là boolean và có Validators.required cho giá trị bên trong (nếu cần validation)
      maDeTai: [{ value: '', disabled: true }, Validators.required],
      tuanBaoCao: ['', [Validators.required, Validators.min(1)]],
      ngayBaoCao: [this.formatDate(new Date()), Validators.required],
      noiDungBaoCao: ['', Validators.required],
      // Trang thái là trường chỉ đọc, có giá trị mặc định là 'Chờ duyệt', và disabled
      trangThai: [{ value: 'Chờ duyệt', disabled: true }],
      // THÊM TRƯỜNG tepDinhKem VÀO FORMGROUP VỚI VALIDATOR URL
      tepDinhKem: ['', Validators.pattern('^(https?|ftp)://[^\\s/$.?#].[^\\s]*$')] // Validator URL cơ bản
    });
  }

  ngOnInit(): void {
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.role === 'SV') {
      this.currentMaSV = currentUser.maSV || null;
    } else {
      this.errorMessage = 'Không tìm thấy thông tin sinh viên hoặc vai trò không hợp lệ. Vui lòng đăng nhập lại với tư cách sinh viên.';
      this.currentMaSV = null; // Đảm bảo currentMaSV là null nếu không hợp lệ
      return; // Dừng thực thi nếu không có thông tin hợp lệ
    }

    // Nếu không có mã sinh viên hợp lệ, dừng ngay
    if (!this.currentMaSV) {
      return;
    }

    // Tải đề tài của sinh viên trước
    this.loadDeTaiCuaSinhVien(this.currentMaSV);

    // Kích hoạt tìm kiếm ban đầu và refresh
    this.searchTermSubject.next('');

    // Sử dụng combineLatest để phản ứng với thay đổi search, refresh và khi deTaiCuaToi đã tải xong
    combineLatest([
      this.searchTermSubject.pipe(startWith(this.currentSearchTerm), debounceTime(300), distinctUntilChanged()),
      this.refreshTriggerSubject.pipe(startWith(undefined as void)),
      this.deTaiLoadedSubject.pipe(filter(loaded => loaded)) // Chờ đến khi deTaiLoadedSubject phát ra true
    ]).pipe(
      switchMap(([searchTerm, refreshTrigger, deTaiLoaded]) => { // deTaiLoaded không được dùng trực tiếp ở đây
        this.currentSearchTerm = searchTerm;
        this.clearMessages();

        if (this.deTaiCuaToi?.maDeTai) {
          return this.baoCaoTienDoService.getBaoCaoTienDos().pipe(
            map(baocaos => baocaos.filter(bc => bc.maDeTai === this.deTaiCuaToi!.maDeTai)),
            catchError((error: HttpErrorResponse) => {
              console.error('Lỗi khi tải báo cáo của sinh viên:', error);
              this.errorMessage = 'Không thể tải báo cáo tiến độ của bạn.';
              return of([]);
            })
          );
        } else {
          // Trả về một Observable rỗng nếu chưa có đề tài để tránh lỗi
          return of([]);
        }
      })
    ).subscribe(data => {
      this.originalBaoCaoList = data;
      this.applyClientSideFilters();
    });
  }

  loadDeTaiCuaSinhVien(maSV: string): void {
    this.deTaiService.getDeTaisBySinhVienId(maSV).subscribe({
      next: (data) => {
        if (data.length > 0) {
          this.deTaiCuaToi = data[0];
          this.baoCaoForm.patchValue({ maDeTai: this.deTaiCuaToi.maDeTai });
          this.deTaiLoadedSubject.next(true); // Báo hiệu đề tài đã tải thành công
        } else {
          this.deTaiCuaToi = null;
          this.errorMessage = 'Bạn chưa được phân công đề tài đồ án.';
          this.deTaiLoadedSubject.next(false); // Báo hiệu không có đề tài
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Lỗi tải đề tài của sinh viên:', err);
        this.errorMessage = 'Không thể tải thông tin đề tài của bạn.';
        this.deTaiCuaToi = null; // Đảm bảo đặt null nếu có lỗi
        this.deTaiLoadedSubject.next(false); // Báo hiệu lỗi khi tải đề tài
      }
    });
  }

  applyClientSideFilters(): void {
    let filteredList = [...this.originalBaoCaoList];

    if (this.currentSearchTerm) {
      filteredList = filteredList.filter(baoCao =>
        baoCao.noiDungBaoCao.toLowerCase().includes(this.currentSearchTerm.toLowerCase()) ||
        baoCao.maBaoCao.toLowerCase().includes(this.currentSearchTerm.toLowerCase())
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
      trangThai: baoCao.trangThai, // Trạng thái sẽ bị disabled trong form
      tepDinhKem: baoCao.tepDinhKem || '' // Gán giá trị tepDinhKem vào form
    });
    // Mã báo cáo không được phép sửa khi đang cập nhật
    this.baoCaoForm.get('maBaoCao')?.disable();
    this.clearMessages();
  }

  onSubmitBaoCao(): void {
    if (!this.deTaiCuaToi) {
      this.errorMessage = 'Bạn chưa có đề tài đồ án để nộp báo cáo.';
      return;
    }

    // Lấy giá trị form, bao gồm cả các trường disabled
    const formData = this.baoCaoForm.getRawValue();
    // Đảm bảo maDeTai luôn đúng
    formData.maDeTai = this.deTaiCuaToi.maDeTai;

    if (this.baoCaoForm.invalid) {
      this.errorMessage = 'Vui lòng điền đầy đủ và đúng thông tin báo cáo.';
      this.baoCaoForm.markAllAsTouched();
      return;
    }

    // KHÔNG CÒN LOGIC UPLOAD FILE VẬT LÝ NỮA, CHỈ GỬI formData
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
      // Khi thêm mới, đảm bảo trạng thái mặc định là 'Chờ duyệt'
      // vì sinh viên chỉ có thể nộp chứ không thể tự đặt trạng thái khác
      data.trangThai = 'Chờ duyệt';
      this.baoCaoTienDoService.addBaoCaoTienDo(data).subscribe({
        next: (_) => {
          this.successMessage = 'Nộp báo cáo tiến độ thành công!';
          this.resetForm();
          this.refreshBaoCaoList();
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage = 'Lỗi khi nộp báo cáo: ' + (err.error?.message || err.message || 'Lỗi không xác định.');
          console.error('Lỗi nộp báo cáo:', err);
        }
      });
    }
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

  onDownloadFile(url?: string): void {
    if (!url) {
      this.errorMessage = 'Không có tệp đính kèm để mở.';
      return;
    }
    // Giả sử url là một URL hợp lệ để mở trong tab mới
    window.open(url, '_blank');
    this.successMessage = 'Đang mở tệp đính kèm trong tab mới.';
  }

  removeAttachedFile(): void {
    // Nếu đang chỉnh sửa báo cáo đã tồn tại, hãy cập nhật đối tượng selectedBaoCao
    if (this.selectedBaoCao) {
      this.selectedBaoCao.tepDinhKem = null;
    }
    this.baoCaoForm.patchValue({ tepDinhKem: '' }); // Đặt lại trường đường dẫn trong form
    this.clearMessages();
    this.successMessage = 'Đã xóa đường dẫn tệp đính kèm khỏi form.';
  }

  resetForm(): void {
    this.selectedBaoCao = null;
    this.baoCaoForm.reset();
    this.clearMessages();

    // Enable tất cả các control để reset trạng thái disabled của chúng
    this.baoCaoForm.enable();

    this.baoCaoForm.patchValue({
      ngayBaoCao: this.formatDate(new Date()),
      trangThai: 'Chờ duyệt', // Đặt lại trạng thái mặc định khi reset form
      maDeTai: this.deTaiCuaToi?.maDeTai || '',
      tepDinhKem: '' // Đặt lại trường đường dẫn tệp đính kèm khi reset form
    });

    // Tắt lại các trường cần disabled
    this.baoCaoForm.get('maDeTai')?.disable();
    this.baoCaoForm.get('trangThai')?.disable();
  }

  refreshBaoCaoList(): void {
    this.refreshTriggerSubject.next();
  }

  onSearchTermChange(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchTermSubject.next(searchTerm);
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