import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeTai } from '../../../models/DeTai'; 
import { SinhVien } from '../../../models/SinhVien';

import { AuthService } from '../../../services/auth.service';
import { DeTaiService } from '../../../services/de-tai.service';
import { SinhVienService } from '../../../services/sinh-vien.service'; 
import { Lop } from '../../../models/Lop';
import { ChuyenNganh } from '../../../models/ChuyenNganh';
import { Nganh } from '../../../models/Nganh';
import { BoMon } from '../../../models/BoMon';
import { Khoa } from '../../../models/Khoa';

import { LopService } from '../../../services/lop.service';
import { ChuyenNganhService } from '../../../services/chuyen-nganh.service';
import { NganhService } from '../../../services/nganh.service';
import { BoMonService } from '../../../services/bo-mon.service';
import { KhoaService } from '../../../services/khoa.service';

import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-xem-de-tai-cua-toi',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './xem-de-tai-cua-toi.component.html',
  styleUrls: ['./xem-de-tai-cua-toi.component.css'] 
})
export class XemDeTaiCuaToiComponent implements OnInit {
  currentMaSV: string | null = null;
  deTaiCuaToi: DeTai | null = null; 

  errorMessage: string = '';
  isLoading: boolean = true;

  sinhVienChiTiet: SinhVien | null = null; 
  lopChiTiet: Lop | null = null;
  chuyenNganhChiTiet: ChuyenNganh | null = null;
  nganhChiTiet: Nganh | null = null;
  boMonChiTiet: BoMon | null = null;
  khoaChiTiet: Khoa | null = null;

  get hasDeTai(): boolean {
    return !!this.deTaiCuaToi;
  }

  constructor(
    private authService: AuthService,
    private deTaiService: DeTaiService,
    private sinhVienService: SinhVienService, 
    private lopService: LopService,
    private chuyenNganhService: ChuyenNganhService,
    private nganhService: NganhService,
    private boMonService: BoMonService,
    private khoaService: KhoaService,
  ) { }

  ngOnInit(): void {
    this.currentMaSV = this.authService.getUserMaSV();
    if (!this.currentMaSV) {
      this.errorMessage = 'Không tìm thấy thông tin sinh viên. Vui lòng đăng nhập lại.';
      this.isLoading = false;
      return;
    }
    this.loadDeTaiCuaToi();
  }

  loadDeTaiCuaToi(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.deTaiCuaToi = null; 

    this.deTaiService.getDeTaisBySinhVienId(this.currentMaSV!).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error('Lỗi khi tải đề tài của sinh viên:', err);
        this.errorMessage = `Không thể tải thông tin đề tài của bạn. Lỗi: ${err.error?.message || 'Không xác định'}.`;
        this.isLoading = false;
        return of(null);
      })
    ).subscribe((deTai: DeTai | null) => {
      if (deTai) {
        this.deTaiCuaToi = deTai;
        this.loadSinhVienAndLopInfo();
      } else {
        this.errorMessage = 'Bạn chưa có đề tài nào được phân công hoặc đăng ký.';
        this.isLoading = false;
      }
    });
  }

  loadSinhVienAndLopInfo(): void {
    if (!this.currentMaSV) {
      this.isLoading = false;
      return;
    }

    this.sinhVienService.getSinhVienById(this.currentMaSV).pipe(
      catchError(() => of(null))
    ).subscribe(sinhVien => {
      this.sinhVienChiTiet = sinhVien;
      if (sinhVien?.maLop) {
        this.lopService.getLopById(sinhVien.maLop).pipe(
          catchError(() => of(null))
        ).subscribe(lop => {
          this.lopChiTiet = lop;
          if (lop?.maChuyenNganh) {
            this.chuyenNganhService.getChuyenNganhById(lop.maChuyenNganh).pipe(
              catchError(() => of(null))
            ).subscribe(chuyenNganh => {
              this.chuyenNganhChiTiet = chuyenNganh;
              if (chuyenNganh?.maNganh) {
                this.nganhService.getNganhById(chuyenNganh.maNganh).pipe(
                  catchError(() => of(null))
                ).subscribe(nganh => {
                  this.nganhChiTiet = nganh;
                  if (nganh?.maBoMon) {
                    this.boMonService.getBoMonById(nganh.maBoMon).pipe(
                      catchError(() => of(null))
                    ).subscribe(boMon => {
                      this.boMonChiTiet = boMon;
                      if (boMon?.maKhoa) {
                        this.khoaService.getKhoaById(boMon.maKhoa).pipe(
                          catchError(() => of(null))
                        ).subscribe(khoa => {
                          this.khoaChiTiet = khoa;
                          this.isLoading = false;
                        });
                      } else { this.isLoading = false; }
                    });
                  } else { this.isLoading = false; }
                });
              } else { this.isLoading = false; }
            });
          } else { this.isLoading = false; }
        });
      } else {
        this.isLoading = false;
      }
    });
  }
}
