import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BaoCaoTienDo } from '../../../models/BaoCaoTienDo';
import { DeTai } from '../../../models/DeTai';
import { GiangVien } from '../../../models/GiangVien';
import { SinhVien } from '../../../models/SinhVien';
import { AuthService } from '../../../services/auth.service';
import { BaoCaoTienDoService } from '../../../services/bao-cao-tien-do.service';
import { DeTaiService } from '../../../services/de-tai.service';
import { GiangVienService } from '../../../services/giang-vien.service';
import { SinhVienService } from '../../../services/sinh-vien.service';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, forkJoin, of, Observable } from 'rxjs'; // Đã loại bỏ 'switchMap'

@Component({
  selector: 'app-nop-bao-cao',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe
  ],
  templateUrl: './nop-bao-cao.component.html',
  styleUrls: ['./nop-bao-cao.component.css']
})
export class NopBaoCaoComponent implements OnInit {
  baoCaoForm!: FormGroup;
  deTaiList: DeTai[] = [];
  baoCaoList: BaoCaoTienDo[] = [];
  sinhVienList: SinhVien[] = [];
  giangVienList: GiangVien[] = [];

  selectedBaoCao: BaoCaoTienDo | null = null;
  currentDeTaiOfStudent: DeTai | null = null;
  // selectedFile: File | null = null; // Đã loại bỏ biến này vì không còn xử lý file vật lý

  successMessage: string = '';
  errorMessage: string = '';
  currentMaSV: string | null = null;

  trangThaiBaoCaoOptions: string[] = ['Đã nộp', 'Đang thực hiện', 'Cần sửa đổi'];

  constructor(
    private fb: FormBuilder,
    private baoCaoService: BaoCaoTienDoService,
    private deTaiService: DeTaiService,
    private sinhVienService: SinhVienService,
    private giangVienService: GiangVienService,
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.currentMaSV = this.authService.getUserMaSV();
    if (!this.currentMaSV) {
      this.errorMessage = 'Không tìm thấy thông tin sinh viên. Vui lòng đăng nhập lại.';
      this.router.navigate(['/login']);
      return;
    }

    this.initForm();
    this.loadInitialData();
  }

  initForm(): void {
    this.baoCaoForm = this.fb.group({
      maBaoCao: [{ value: null, disabled: true }],
      maDeTai: ['', Validators.required],
      maSV: [{ value: this.currentMaSV, disabled: true }],
      tuanBaoCao: [null, [Validators.required, Validators.min(1)]],
      ngayNop: [this.formatDate(new Date()), Validators.required],
      loaiBaoCao: ['Báo cáo tuần', Validators.required],
      ghiChuCuaSV: ['', Validators.required],
      tepDinhKem: [null], // Giữ nguyên, sẽ nhận giá trị text từ form
      trangThai: ['Đã nộp', Validators.required],
      nhanXetCuaGV: [{ value: null, disabled: true }],
      diemSo: [{ value: null, disabled: true }],
      maGV: [{ value: null, disabled: true }],
      ngayNhanXet: [{ value: null, disabled: true }]
    });
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  loadInitialData(): void {
    if (!this.currentMaSV) {
      this.errorMessage = 'Mã sinh viên không hợp lệ để tải dữ liệu.';
      return;
    }

    forkJoin({
      deTai: this.deTaiService.getDeTaisBySinhVienId(this.currentMaSV).pipe(
        catchError(err => {
          console.error('Lỗi khi tải đề tài của sinh viên:', err);
          this.errorMessage = `Không thể tải đề tài của bạn. Lỗi: ${err.error?.message || 'Không tìm thấy tài nguyên bạn yêu cầu.'}`;
          return of(null);
        })
      ),
      sinhViens: this.sinhVienService.searchSinhVien().pipe(
        catchError(err => {
          console.error('Lỗi khi tải danh sách sinh viên:', err);
          return of([]);
        })
      ),
      giangViens: this.giangVienService.searchGiangVien().pipe(
        catchError(err => {
          console.error('Lỗi khi tải danh sách giảng viên:', err);
          return of([]);
        })
      )
    }).subscribe({
      next: ({ deTai, sinhViens, giangViens }) => {
        this.sinhVienList = sinhViens;
        this.giangVienList = giangViens;

        if (deTai) {
          this.currentDeTaiOfStudent = deTai;
          this.deTaiList = [deTai];
          this.baoCaoForm.get('maDeTai')?.setValue(this.currentDeTaiOfStudent.maDeTai);
          this.loadBaoCaoByDeTaiAndSV(this.currentDeTaiOfStudent.maDeTai);
        } else {
          this.errorMessage = 'Bạn chưa có đề tài nào được phân công hoặc đăng ký.';
          this.deTaiList = [];
          this.baoCaoList = [];
        }
      },
      error: (err) => {
        console.error('Lỗi chung khi tải dữ liệu ban đầu:', err);
      }
    });
  }

  onDeTaiChange(): void {
    const maDeTai = this.baoCaoForm.get('maDeTai')?.value;
    this.currentDeTaiOfStudent = this.deTaiList.find(dt => dt.maDeTai === maDeTai) || null;

    if (maDeTai && this.currentMaSV) {
      this.loadBaoCaoByDeTaiAndSV(maDeTai);
    }
  }

  loadBaoCaoByDeTaiAndSV(maDeTai: string): void {
    if (!this.currentMaSV || !maDeTai) {
      this.errorMessage = 'Không có đủ thông tin để tải báo cáo.';
      return;
    }
    this.baoCaoService.getBaoCaoBySinhVienAndDeTai(this.currentMaSV, maDeTai).subscribe({
      next: (data) => {
        this.baoCaoList = data;
        this.errorMessage = '';
      },
      error: (err: HttpErrorResponse) => {
        console.error('Lỗi khi tải báo cáo tiến độ:', err);
        this.errorMessage = `Không thể tải báo cáo tiến độ. Lỗi: ${err.error?.message || 'Không xác định'}.`;
        this.baoCaoList = [];
      }
    });
  }

  getDeTaiTen(maDeTai: string | undefined): string {
    return this.deTaiList.find(dt => dt.maDeTai === maDeTai)?.tenDeTai || 'N/A';
  }

  getTenGiangVien(maGV: string | undefined): string {
    return this.giangVienList.find(gv => gv.maGV === maGV)?.hoTen || 'N/A';
  }

  // onFileSelected(event: any): void { // Đã loại bỏ hàm này
  //   // Logic xử lý file vật lý đã bị xóa
  // }

  onSubmitBaoCao(): void {
    this.baoCaoForm.get('maSV')?.enable();
    if (this.baoCaoForm.invalid || !this.currentDeTaiOfStudent) {
      this.errorMessage = 'Vui lòng điền đầy đủ và đúng thông tin các trường bắt buộc và đảm bảo có đề tài được chọn.';
      this.baoCaoForm.markAllAsTouched();
      this.baoCaoForm.get('maSV')?.disable();
      return;
    }

    const baoCaoData: BaoCaoTienDo = {
      ...this.baoCaoForm.getRawValue()
    };

    baoCaoData.maGV = this.currentDeTaiOfStudent.maGV;

    if (baoCaoData.ngayNop && typeof baoCaoData.ngayNop === 'string') {
      baoCaoData.ngayNop = new Date(baoCaoData.ngayNop);
    }
    baoCaoData.ngayNhanXet = (typeof baoCaoData.ngayNhanXet === 'string' && baoCaoData.ngayNhanXet === '') ? null : (typeof baoCaoData.ngayNhanXet === 'string' ? new Date(baoCaoData.ngayNhanXet) : baoCaoData.ngayNhanXet || null);
    baoCaoData.nhanXetCuaGV = (typeof baoCaoData.nhanXetCuaGV === 'string' && baoCaoData.nhanXetCuaGV === '') ? null : baoCaoData.nhanXetCuaGV;
    baoCaoData.diemSo = (typeof baoCaoData.diemSo === 'string' && baoCaoData.diemSo === '') ? null : baoCaoData.diemSo;

    // *** ĐÂY LÀ ĐIỂM THAY ĐỔI QUAN TRỌNG NHẤT ***
    // Đã loại bỏ toàn bộ logic upload file và switchMap
    // Giá trị tepDinhKem sẽ được lấy trực tiếp từ form control
    // Nếu người dùng không nhập gì, nó sẽ là null (do initForm đã set [null])
    // Nếu người dùng nhập chuỗi rỗng, nó sẽ là chuỗi rỗng. Backend của bạn chấp nhận null cho TepDinhKem.
    // Nếu bạn muốn chuỗi rỗng thành null, bạn có thể thêm logic:
    if (typeof baoCaoData.tepDinhKem === 'string' && baoCaoData.tepDinhKem.trim() === '') {
        baoCaoData.tepDinhKem = null;
    }


    let actionObservable: Observable<any>; // Sử dụng 'any' hoặc kiểu trả về cụ thể từ service

    if (this.selectedBaoCao) {
      actionObservable = this.baoCaoService.updateBaoCaoTienDo(baoCaoData.maBaoCao!, baoCaoData);
    } else {
      actionObservable = this.baoCaoService.addBaoCaoTienDo(baoCaoData);
    }

    actionObservable.pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Lỗi khi ${this.selectedBaoCao ? 'cập nhật' : 'thêm mới'} báo cáo:`, err);
        this.errorMessage = `Không thể ${this.selectedBaoCao ? 'cập nhật' : 'thêm mới'} báo cáo. Lỗi: ${err.error?.message || 'Không xác định'}.`;
        return of(null); // Trả về null để complete observable và không gây lỗi tiếp
      })
    ).subscribe({
      next: (response) => {
        if (response) {
          this.successMessage = `${this.selectedBaoCao ? 'Cập nhật' : 'Thêm mới'} báo cáo thành công!`;
          this.resetForm();
          if (baoCaoData.maDeTai) {
            this.loadBaoCaoByDeTaiAndSV(baoCaoData.maDeTai);
          }
        }
      },
      error: (err) => {
        console.error('Lỗi cuối cùng trong subscribe (nếu có):', err);
      },
      complete: () => {
        this.baoCaoForm.get('maSV')?.disable();
      }
    });
  }

  onSelectBaoCao(baoCao: BaoCaoTienDo): void {
    this.selectedBaoCao = { ...baoCao };
    // this.selectedFile = null; // Đã loại bỏ dòng này

    this.baoCaoForm.patchValue({
      maBaoCao: baoCao.maBaoCao,
      maDeTai: baoCao.maDeTai,
      maSV: baoCao.maSV,
      tuanBaoCao: baoCao.tuanBaoCao,
      ngayNop: baoCao.ngayNop ? this.formatDate(new Date(baoCao.ngayNop)) : this.formatDate(new Date()),
      loaiBaoCao: baoCao.loaiBaoCao,
      ghiChuCuaSV: baoCao.ghiChuCuaSV,
      tepDinhKem: baoCao.tepDinhKem, // Vẫn gán URL/path đã lưu
      trangThai: baoCao.trangThai,
      nhanXetCuaGV: baoCao.nhanXetCuaGV,
      diemSo: baoCao.diemSo,
      maGV: baoCao.maGV,
      ngayNhanXet: baoCao.ngayNhanXet ? this.formatDate(new Date(baoCao.ngayNhanXet)) : null
    });
    this.baoCaoForm.get('maBaoCao')?.disable();
    this.baoCaoForm.get('maSV')?.disable();
    this.baoCaoForm.get('nhanXetCuaGV')?.disable();
    this.baoCaoForm.get('diemSo')?.disable();
    this.baoCaoForm.get('maGV')?.disable();
    this.baoCaoForm.get('ngayNhanXet')?.disable();
    this.errorMessage = '';
    this.successMessage = '';
  }

  onDeleteBaoCao(maBaoCao: number | undefined): void {
    if (typeof maBaoCao !== 'number' || maBaoCao <= 0) {
      this.errorMessage = 'Mã báo cáo không hợp lệ để xóa.';
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa báo cáo này không?')) {
      this.baoCaoService.deleteBaoCaoTienDo(maBaoCao).subscribe({
        next: () => {
          this.successMessage = 'Xóa báo cáo thành công!';
          const currentDeTaiId = this.baoCaoForm.get('maDeTai')?.value;
          if (currentDeTaiId) {
            this.loadBaoCaoByDeTaiAndSV(currentDeTaiId);
          } else {
            this.baoCaoList = [];
          }
          this.resetForm();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Lỗi khi xóa báo cáo:', err);
          this.errorMessage = `Không thể xóa báo cáo. Lỗi: ${err.error?.message || 'Không xác định'}.`;
        }
      });
    }
  }

  onDownloadFile(url?: string | null): void {
    if (!url || url.trim() === '') {
      this.errorMessage = 'Không có tệp đính kèm để mở.';
      return;
    }
    // Vẫn giữ kiểm tra URL nếu bạn mong đợi URL hợp lệ được lưu
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('ftp://')) {
      window.open(url, '_blank');
      this.successMessage = 'Đang mở tệp đính kèm trong tab mới.';
    } else {
      // Nếu bạn muốn hỗ trợ đường dẫn tương đối hoặc đường dẫn cục bộ, bạn cần logic riêng ở đây
      // Ví dụ: window.open(`/assets/documents/${url}`, '_blank');
      this.errorMessage = 'Đường dẫn tệp không hợp lệ (không phải URL).';
    }
  }

  removeAttachedFile(): void {
    // this.selectedFile = null; // Đã loại bỏ dòng này
    this.baoCaoForm.get('tepDinhKem')?.setValue(null); // Đặt giá trị form control là null
    this.errorMessage = '';
    this.successMessage = '';
  }

  resetForm(): void {
    this.selectedBaoCao = null;
    // this.selectedFile = null; // Đã loại bỏ dòng này
    this.baoCaoForm.reset();
    this.baoCaoForm.get('maBaoCao')?.disable();
    this.baoCaoForm.get('maSV')?.setValue(this.currentMaSV);
    this.baoCaoForm.get('maSV')?.disable();
    this.baoCaoForm.get('ngayNop')?.setValue(this.formatDate(new Date()));
    this.baoCaoForm.get('loaiBaoCao')?.setValue('Báo cáo tuần');
    this.baoCaoForm.get('trangThai')?.setValue('Đã nộp');
    this.baoCaoForm.get('nhanXetCuaGV')?.setValue(null);
    this.baoCaoForm.get('diemSo')?.setValue(null);
    this.baoCaoForm.get('maGV')?.setValue(null);
    this.baoCaoForm.get('ngayNhanXet')?.setValue(null);
    this.baoCaoForm.get('tepDinhKem')?.setValue(null); // Đảm bảo reset cả tepDinhKem
    this.successMessage = '';
    this.errorMessage = '';
    if (this.currentDeTaiOfStudent) {
      this.baoCaoForm.get('maDeTai')?.setValue(this.currentDeTaiOfStudent.maDeTai);
    } else if (this.deTaiList.length > 0) {
      this.baoCaoForm.get('maDeTai')?.setValue(this.deTaiList[0].maDeTai);
    }
    this.baoCaoForm.get('tuanBaoCao')?.setValue(null);
    this.baoCaoForm.get('ghiChuCuaSV')?.setValue('');
  }
}