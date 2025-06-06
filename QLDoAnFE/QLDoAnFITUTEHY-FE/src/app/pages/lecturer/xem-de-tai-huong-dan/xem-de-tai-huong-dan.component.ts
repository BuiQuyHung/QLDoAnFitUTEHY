import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, forkJoin, of, throwError } from 'rxjs';
import { catchError, map, switchMap, filter } from 'rxjs/operators';
import { Router } from '@angular/router';

import { DeTai } from '../../../models/DeTai';
import { PhanCong } from '../../../models/PhanCong';
import { SinhVien } from '../../../models/SinhVien';
import { Lop } from '../../../models/Lop';
import { DotDoAn } from '../../../models/DotDoAn';
import { GiangVien } from '../../../models/GiangVien';

import { DeTaiService } from '../../../services/de-tai.service';
import { PhanCongService } from '../../../services/phan-cong.service';
import { SinhVienService } from '../../../services/sinh-vien.service';
import { LopService } from '../../../services/lop.service';
import { GiangVienService } from '../../../services/giang-vien.service';

interface TempGroupedByDotDoAn {
  dotDoAn: DotDoAn;
  lopGroups: { [maLop: string]: LopGroup };
}

interface DisplayGroupedByDotDoAn {
  dotDoAn: DotDoAn;
  lopGroups: LopGroup[];
}

interface LopGroup {
  lop: Lop;
  deTaiSinhVien: Array<{
    deTai: DeTai;
    sinhVien: SinhVien;
    ngayPhanCong?: Date;
  }>;
}

@Component({
  selector: 'app-xem-de-tai-huong-dan-giang-vien',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './xem-de-tai-huong-dan.component.html',
  styleUrls: ['./xem-de-tai-huong-dan.component.css']
})
export class XemDeTaiHuongDanGiangVienComponent implements OnInit {
  currentMaGV: string = 'GV001';
  lecturerName: string = '';

  groupedThesisData: DisplayGroupedByDotDoAn[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';

  selectedDotDoAnId: string | null = null;
  selectedLopId: string | null = null;

  constructor(
    private deTaiService: DeTaiService,
    private phanCongService: PhanCongService,
    private lopService: LopService,
    private sinhVienService: SinhVienService,
    private giangVienService: GiangVienService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getLecturerName();
    this.loadGuidedThesisData();
  }

  getLecturerName(): void {
    this.giangVienService.getGiangVienById(this.currentMaGV).pipe(
      map(giangVien => giangVien.hoTen),
      catchError(err => {
        console.error('Lỗi khi lấy tên giảng viên:', err);
        this.lecturerName = 'Không xác định';
        return of('Không xác định');
      })
    ).subscribe(name => {
      this.lecturerName = name;
    });
  }

  loadGuidedThesisData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.groupedThesisData = [];

    this.deTaiService.getDeTaisByGiangVienId(this.currentMaGV).pipe(
      filter(deTais => {
        if (!deTais || deTais.length === 0) {
          this.errorMessage = 'Không có đề tài nào được phân công cho giảng viên này.';
          this.isLoading = false;
          return false;
        }
        return true;
      }),
      switchMap((deTais: DeTai[]) => {
        const uniqueSvIds = new Set<string>();
        const deTaiPhanCongRequests: { [key: string]: Observable<PhanCong[]> } = {};

        deTais.forEach(deTai => {
          if (deTai.maSV) {
            uniqueSvIds.add(deTai.maSV);
          }
          if (deTai.maDeTai) {
            deTaiPhanCongRequests[deTai.maDeTai] = this.phanCongService.getPhanCongByDeTaiId(deTai.maDeTai).pipe(
              catchError(err => {
                console.error(`Lỗi tải phân công cho đề tài ${deTai.maDeTai}:`, err);
                return of([]);
              })
            );
          }
        });

        const sinhVienRequests: { [key: string]: Observable<SinhVien> } = {};
        uniqueSvIds.forEach(maSV => {
          sinhVienRequests[maSV] = this.sinhVienService.getSinhVienById(maSV).pipe(
            catchError(err => {
              console.error(`Lỗi tải sinh viên ${maSV}:`, err);
              return of(null as any);
            })
          );
        });

        return forkJoin({
          sinhViensMap: Object.keys(sinhVienRequests).length > 0 ? forkJoin(sinhVienRequests) : of({}),
          phanCongsMap: Object.keys(deTaiPhanCongRequests).length > 0 ? forkJoin(deTaiPhanCongRequests) : of({})
        }).pipe(
          switchMap(({ sinhViensMap, phanCongsMap }) => {
            const uniqueLopIds = new Set<string>();
            Object.values(sinhViensMap).forEach((sv: any) => {
              if (sv && sv.maLop) {
                uniqueLopIds.add(sv.maLop);
              }
            });

            const lopRequests: { [key: string]: Observable<Lop> } = {};
            uniqueLopIds.forEach(maLop => {
              lopRequests[maLop] = this.lopService.getLopById(maLop).pipe(
                catchError(err => {
                  console.error(`Lỗi tải lớp ${maLop}:`, err);
                  return of(null as any);
                })
              );
            });

            return forkJoin({
              lopsMap: Object.keys(lopRequests).length > 0 ? forkJoin(lopRequests) : of({}),
              sinhViensMap: of(sinhViensMap),
              phanCongsMap: of(phanCongsMap),
              deTais: of(deTais)
            });
          })
        );
      }),
      map(({ lopsMap, sinhViensMap, phanCongsMap, deTais }) => {
        const finalGroupedData: { [maDotDoAn: string]: TempGroupedByDotDoAn } = {};

        deTais.forEach(deTai => {
          const dotDoAn: DotDoAn | null = (deTai.maDotDoAn && deTai.tenDotDoAn)
            ? { maDotDoAn: deTai.maDotDoAn, tenDotDoAn: deTai.tenDotDoAn } as DotDoAn
            : null;

          const fullSinhVien: SinhVien | null = deTai.maSV
            ? (sinhViensMap as { [key: string]: SinhVien | null })[deTai.maSV]
            : null;

          if (!dotDoAn || !fullSinhVien || !fullSinhVien.maLop) {
            return;
          }

          const lop: Lop | null = (lopsMap as { [key: string]: Lop | null })[fullSinhVien.maLop];
          if (!lop) {
            return;
          }

          const phanCongsForDeTai = (phanCongsMap as { [key: string]: PhanCong[] })[deTai.maDeTai] || [];
          const specificPhanCong = phanCongsForDeTai.find(pc => pc.maSV === fullSinhVien.maSV);
          const ngayPhanCong = specificPhanCong ? specificPhanCong.ngayPhanCong : undefined;

          if (!finalGroupedData[dotDoAn.maDotDoAn]) {
            finalGroupedData[dotDoAn.maDotDoAn] = { dotDoAn: dotDoAn, lopGroups: {} };
          }

          if (!finalGroupedData[dotDoAn.maDotDoAn].lopGroups[lop.maLop]) {
            finalGroupedData[dotDoAn.maDotDoAn].lopGroups[lop.maLop] = { lop: lop, deTaiSinhVien: [] };
          }

          finalGroupedData[dotDoAn.maDotDoAn].lopGroups[lop.maLop].deTaiSinhVien.push({
            deTai: deTai,
            sinhVien: fullSinhVien,
            ngayPhanCong: ngayPhanCong
          });
        });

        return Object.values(finalGroupedData).map(dotGroup => ({
          dotDoAn: dotGroup.dotDoAn,
          lopGroups: Object.values(dotGroup.lopGroups)
        })) as DisplayGroupedByDotDoAn[];
      }),
      catchError(error => {
        this.isLoading = false;
        this.errorMessage = 'Lỗi khi tải dữ liệu hướng dẫn: ' + (error.message || 'Lỗi không xác định.');
        console.error('Lỗi tổng quan khi tải dữ liệu hướng dẫn:', error);
        return of([]);
      })
    ).subscribe({
      next: (data: DisplayGroupedByDotDoAn[]) => {
        this.groupedThesisData = data;
        this.isLoading = false;
        if (data.length === 0 && !this.errorMessage) {
          this.errorMessage = 'Không có thông tin hướng dẫn đề tài nào được tìm thấy cho giảng viên này.';
        }
      },
      error: (err) => {
        this.isLoading = false;
      }
    });
  }

  toggleDotDoAn(dotDoAnId: string): void {
    this.selectedDotDoAnId = this.selectedDotDoAnId === dotDoAnId ? null : dotDoAnId;
    this.selectedLopId = null;
  }

  toggleLop(lopId: string): void {
    this.selectedLopId = this.selectedLopId === lopId ? null : lopId;
  }
  goToProgressReports(maSV: string, maDeTai: string): void {
    this.router.navigate(['/lecturer/bao-cao-tien-do/sinh-vien', maSV, 'de-tai', maDeTai]);
  }
}