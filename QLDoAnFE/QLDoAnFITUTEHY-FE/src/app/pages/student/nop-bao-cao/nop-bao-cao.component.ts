import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
import { catchError, forkJoin, of, Observable } from 'rxjs';

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

  successMessage: string = '';
  errorMessage: string = '';
  currentMaSV: string | null = null;
  targetMaSV: string | null = null;
  targetMaDeTai: string | null = null;

  trangThaiBaoCaoOptions: string[] = ['Đã nộp', 'Đang thực hiện', 'Cần sửa đổi'];

  maxTuanBaoCao: number = 0;

  isLecturerView: boolean = false;
  baoCaoDangChinhSuaNhanXet: BaoCaoTienDo | null = null;

  constructor(
    private fb: FormBuilder,
    private baoCaoService: BaoCaoTienDoService,
    private deTaiService: DeTaiService,
    private sinhVienService: SinhVienService,
    private giangVienService: GiangVienService,
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(data => {
      this.isLecturerView = (data['mode'] === 'lecturerView');
    });

    this.activatedRoute.paramMap.subscribe(params => {
      if (this.isLecturerView) {
        this.targetMaSV = params.get('maSV');
        this.targetMaDeTai = params.get('maDeTai');
        if (!this.targetMaSV || !this.targetMaDeTai) {
          this.errorMessage = 'Không tìm thấy thông tin sinh viên hoặc đề tài. Vui lòng kiểm tra lại đường dẫn.';
          return;
        }
        this.currentMaSV = this.targetMaSV;
      } else {
        this.currentMaSV = this.authService.getUserMaSV();
        if (!this.currentMaSV) {
          this.errorMessage = 'Không tìm thấy thông tin sinh viên. Vui lòng đăng nhập lại.';
          this.router.navigate(['/login']);
          return;
        }
      }

      this.initForm();
      this.loadInitialData();
    });
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
      tepDinhKem: [null],
      trangThai: ['Đã nộp', Validators.required],
      nhanXetCuaGV: [{ value: null, disabled: true }],
      diemSo: [{ value: null, disabled: true }],
      maGV: [{ value: null, disabled: true }],
      ngayNhanXet: [{ value: null, disabled: true }]
    });

    if (!this.isLecturerView) {
      this.baoCaoForm.get('nhanXetCuaGV')?.disable();
      this.baoCaoForm.get('diemSo')?.disable();
      this.baoCaoForm.get('maGV')?.disable();
      this.baoCaoForm.get('ngayNhanXet')?.disable();
      this.baoCaoForm.get('maDeTai')?.disable();
      this.baoCaoForm.get('trangThai')?.disable();
    } else {
      this.baoCaoForm.get('tuanBaoCao')?.disable();
      this.baoCaoForm.get('ngayNop')?.disable();
      this.baoCaoForm.get('loaiBaoCao')?.disable();
      this.baoCaoForm.get('ghiChuCuaSV')?.disable();
      this.baoCaoForm.get('tepDinhKem')?.disable();
      this.baoCaoForm.get('trangThai')?.disable();
    }
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

    const deTaiObservable = this.isLecturerView
      ? this.deTaiService.getDeTaiById(this.targetMaDeTai!).pipe(
          catchError(err => {
            console.error('Lỗi khi tải đề tài (chế độ GV):', err);
            this.errorMessage = `Không thể tải đề tài. Lỗi: ${err.error?.message || 'Không tìm thấy tài nguyên bạn yêu cầu.'}`;
            return of(null);
          })
        )
      : this.deTaiService.getDeTaisBySinhVienId(this.currentMaSV).pipe(
          catchError(err => {
            console.error('Lỗi khi tải đề tài của sinh viên:', err);
            this.errorMessage = `Không thể tải đề tài của bạn. Lỗi: ${err.error?.message || 'Không tìm thấy tài nguyên bạn yêu cầu.'}`;
            return of(null);
          })
        );

    forkJoin({
      deTai: deTaiObservable,
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

        let selectedDeTai: DeTai | null = null;
        if (this.isLecturerView) {
          selectedDeTai = deTai;
        } else {
          selectedDeTai = deTai;
        }

        if (selectedDeTai) {
          this.currentDeTaiOfStudent = selectedDeTai;
          this.deTaiList = [selectedDeTai];
          this.baoCaoForm.get('maDeTai')?.setValue(this.currentDeTaiOfStudent.maDeTai);
          this.loadBaoCaoByDeTaiAndSV(this.currentDeTaiOfStudent.maDeTai);
        } else {
          this.errorMessage = 'Không tìm thấy đề tài được phân công hoặc đăng ký.';
          this.deTaiList = [];
          this.baoCaoList = [];
          this.maxTuanBaoCao = 0;
          this.resetForm();
        }
      },
      error: (err) => {
        console.error('Lỗi chung khi tải dữ liệu ban đầu:', err);
      }
    });
  }

  onDeTaiChange(): void {
    if (this.isLecturerView) return;
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

        if (!this.isLecturerView) {
          if (this.baoCaoList && this.baoCaoList.length > 0) {
            this.maxTuanBaoCao = Math.max(...this.baoCaoList.map(bc => bc.tuanBaoCao || 0));
          } else {
            this.maxTuanBaoCao = 0;
          }
          this.resetForm();
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Lỗi khi tải báo cáo tiến độ:', err);
        this.errorMessage = `Không thể tải báo cáo tiến độ. Lỗi: ${err.error?.message || 'Không xác định'}.`;
        this.baoCaoList = [];
        if (!this.isLecturerView) {
          this.maxTuanBaoCao = 0;
          this.resetForm();
        }
      }
    });
  }

  getDeTaiTen(maDeTai: string | undefined): string {
    return this.deTaiList.find(dt => dt.maDeTai === maDeTai)?.tenDeTai || 'N/A';
  }

  getTenGiangVien(maGV: string | undefined): string {
    return this.giangVienList.find(gv => gv.maGV === maGV)?.hoTen || 'N/A';
  }

  getTenSinhVien(maSV: string | undefined): string {
    return this.sinhVienList.find(sv => sv.maSV === maSV)?.hoTen || 'N/A';
  }

  onSubmitBaoCao(): void {
    if (this.isLecturerView) return;

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
    baoCaoData.ngayNhanXet = null;
    baoCaoData.nhanXetCuaGV = null;
    baoCaoData.diemSo = null;

    if (typeof baoCaoData.tepDinhKem === 'string' && baoCaoData.tepDinhKem.trim() === '') {
      baoCaoData.tepDinhKem = null;
    }

    let actionObservable: Observable<any>;

    if (this.selectedBaoCao) {
      actionObservable = this.baoCaoService.updateBaoCaoTienDo(baoCaoData.maBaoCao!, baoCaoData);
    } else {
      actionObservable = this.baoCaoService.addBaoCaoTienDo(baoCaoData);
    }

    actionObservable.pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`Lỗi khi ${this.selectedBaoCao ? 'cập nhật' : 'thêm mới'} báo cáo:`, err);
        this.errorMessage = `Không thể ${this.selectedBaoCao ? 'cập nhật' : 'thêm mới'} báo cáo. Lỗi: ${err.error?.message || 'Không xác định'}.`;
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response) {
          this.successMessage = `${this.selectedBaoCao ? 'Cập nhật' : 'Thêm mới'} báo cáo thành công!`;
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
    this.baoCaoDangChinhSuaNhanXet = null;

    this.baoCaoForm.patchValue({
      maBaoCao: baoCao.maBaoCao,
      maDeTai: baoCao.maDeTai,
      maSV: baoCao.maSV,
      tuanBaoCao: baoCao.tuanBaoCao,
      ngayNop: baoCao.ngayNop ? this.formatDate(new Date(baoCao.ngayNop)) : this.formatDate(new Date()),
      loaiBaoCao: baoCao.loaiBaoCao,
      ghiChuCuaSV: baoCao.ghiChuCuaSV,
      tepDinhKem: baoCao.tepDinhKem,
      trangThai: baoCao.trangThai,
      nhanXetCuaGV: baoCao.nhanXetCuaGV,
      diemSo: baoCao.diemSo,
      maGV: baoCao.maGV,
      ngayNhanXet: baoCao.ngayNhanXet ? this.formatDate(new Date(baoCao.ngayNhanXet)) : null
    });

    this.baoCaoForm.get('maBaoCao')?.disable();
    this.baoCaoForm.get('maSV')?.disable();
    this.baoCaoForm.get('maGV')?.disable();

    if (!this.isLecturerView) {
      this.baoCaoForm.get('nhanXetCuaGV')?.disable();
      this.baoCaoForm.get('diemSo')?.disable();
      this.baoCaoForm.get('ngayNhanXet')?.disable();
      this.baoCaoForm.get('tuanBaoCao')?.enable();
      this.baoCaoForm.get('ngayNop')?.enable();
      this.baoCaoForm.get('loaiBaoCao')?.enable();
      this.baoCaoForm.get('ghiChuCuaSV')?.enable();
      this.baoCaoForm.get('tepDinhKem')?.enable();
      this.baoCaoForm.get('trangThai')?.enable();
    } else {
      this.baoCaoForm.get('tuanBaoCao')?.disable();
      this.baoCaoForm.get('ngayNop')?.disable();
      this.baoCaoForm.get('loaiBaoCao')?.disable();
      this.baoCaoForm.get('ghiChuCuaSV')?.disable();
      this.baoCaoForm.get('tepDinhKem')?.disable();
      this.baoCaoForm.get('trangThai')?.enable();
      this.baoCaoForm.get('nhanXetCuaGV')?.enable();
      this.baoCaoForm.get('diemSo')?.enable();
      this.baoCaoForm.get('ngayNhanXet')?.enable();
    }
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSaveLecturerReview(): void {
    if (!this.isLecturerView || !this.selectedBaoCao) return;
    const nhanXetCuaGVFormValue = this.baoCaoForm.get('nhanXetCuaGV')?.value;
    const trangThaiFormValue = this.baoCaoForm.get('trangThai')?.value;
    const diemSoFormRawValue = this.baoCaoForm.get('diemSo')?.value;
    let finalDiemSo: number | null = null; 

    if (typeof diemSoFormRawValue === 'string') {
      const trimmedDiemSo = diemSoFormRawValue.trim(); 
      if (trimmedDiemSo !== '') { 
        const parsedDiemSo = parseFloat(trimmedDiemSo); 
        if (!isNaN(parsedDiemSo)) { 
          finalDiemSo = parsedDiemSo; 
        }
      }
    }
    else if (typeof diemSoFormRawValue === 'number') {
      finalDiemSo = diemSoFormRawValue; 
    }
    const updatedBaoCao: BaoCaoTienDo = {
      ...this.selectedBaoCao, 
      nhanXetCuaGV: (typeof nhanXetCuaGVFormValue === 'string' && nhanXetCuaGVFormValue.trim() === '') ? null : nhanXetCuaGVFormValue,
      diemSo: finalDiemSo, 
      trangThai: trangThaiFormValue,
      maGV: this.authService.getUserMaGV(), 
      ngayNhanXet: new Date() 
    };

    this.baoCaoService.updateBaoCaoTienDo(updatedBaoCao.maBaoCao!, updatedBaoCao).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Lỗi khi cập nhật nhận xét/điểm:', err);
        this.errorMessage = `Không thể cập nhật nhận xét/điểm. Lỗi: ${err.error?.message || 'Không xác định'}.`;
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (response) {
          this.successMessage = 'Cập nhật nhận xét và điểm thành công!';
          if (this.targetMaDeTai) {
            this.loadBaoCaoByDeTaiAndSV(this.targetMaDeTai);
          }
          this.baoCaoDangChinhSuaNhanXet = null;
          this.resetForm();
        }
      },
      complete: () => {
        this.baoCaoForm.get('maSV')?.disable();
      }
    });
  }

  openLecturerReviewForm(baoCao: BaoCaoTienDo): void {
    this.onSelectBaoCao(baoCao);
    this.baoCaoDangChinhSuaNhanXet = { ...baoCao };
    this.baoCaoForm.get('nhanXetCuaGV')?.enable();
    this.baoCaoForm.get('diemSo')?.enable();
    this.baoCaoForm.get('trangThai')?.enable();
  }

  cancelLecturerReviewEdit(): void {
    this.baoCaoDangChinhSuaNhanXet = null;
    this.resetForm();
    this.errorMessage = '';
    this.successMessage = '';
  }

  onDeleteBaoCao(maBaoCao: number | undefined): void {
    if (this.isLecturerView) return;

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
            this.maxTuanBaoCao = 0;
            this.resetForm();
          }
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
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('ftp://')) {
      window.open(url, '_blank');
      this.successMessage = 'Đang mở tệp đính kèm trong tab mới.';
    } else {
      this.errorMessage = 'Đường dẫn tệp không hợp lệ (không phải URL).';
    }
  }

  removeAttachedFile(): void {
    if (this.isLecturerView) return;
    this.baoCaoForm.get('tepDinhKem')?.setValue(null);
    this.errorMessage = '';
    this.successMessage = '';
  }

  resetForm(): void {
    this.selectedBaoCao = null;
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
    this.baoCaoForm.get('tepDinhKem')?.setValue(null);
    this.successMessage = '';
    this.errorMessage = '';

    if (this.currentDeTaiOfStudent) {
      this.baoCaoForm.get('maDeTai')?.setValue(this.currentDeTaiOfStudent.maDeTai);
    } else if (this.deTaiList.length > 0) {
      this.baoCaoForm.get('maDeTai')?.setValue(this.deTaiList[0].maDeTai);
    }

    if (!this.isLecturerView) {
      this.baoCaoForm.get('tuanBaoCao')?.setValue(this.maxTuanBaoCao > 0 ? this.maxTuanBaoCao + 1 : 1);
      this.baoCaoForm.get('ghiChuCuaSV')?.setValue('');
      this.baoCaoForm.get('nhanXetCuaGV')?.disable();
      this.baoCaoForm.get('diemSo')?.disable();
      this.baoCaoForm.get('maGV')?.disable();
      this.baoCaoForm.get('ngayNhanXet')?.disable();
      this.baoCaoForm.get('trangThai')?.disable();
    } else {
      this.baoCaoForm.get('tuanBaoCao')?.disable();
      this.baoCaoForm.get('ngayNop')?.disable();
      this.baoCaoForm.get('loaiBaoCao')?.disable();
      this.baoCaoForm.get('ghiChuCuaSV')?.disable();
      this.baoCaoForm.get('tepDinhKem')?.disable();
      this.baoCaoForm.get('trangThai')?.disable();
    }
  }
}