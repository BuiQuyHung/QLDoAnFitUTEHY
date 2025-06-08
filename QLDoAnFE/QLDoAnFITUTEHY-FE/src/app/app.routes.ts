import { Routes } from '@angular/router';
import { LoginPageComponent } from './auth/login/login.component';
import { authGuard } from './auth.guard';
import { DashboardComponent as AdminDashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { QuanLyKhoaComponent } from './pages/admin/quan-ly-khoa/quan-ly-khoa.component';
import { QuanLyBoMonComponent } from './pages/admin/quan-ly-bo-mon/quan-ly-bo-mon.component';
import { QuanLyNganhComponent } from './pages/admin/quan-ly-nganh/quan-ly-nganh.component';
import { QuanLyChuyenNganhComponent } from './pages/admin/quan-ly-chuyen-nganh/quan-ly-chuyen-nganh.component';
import { QuanLyLopComponent } from './pages/admin/quan-ly-lop/quan-ly-lop.component';
import { QuanLySinhVienComponent } from './pages/admin/quan-ly-sinh-vien/quan-ly-sinh-vien.component';
import { QuanLyGiangVienComponent } from './pages/admin/quan-ly-giang-vien/quan-ly-giang-vien.component';
import { QuanLyDotDoAnComponent } from './pages/admin/quan-ly-dot-do-an/quan-ly-dot-do-an.component';
import { QuanLyDeTaiComponent } from './pages/admin/quan-ly-de-tai/quan-ly-de-tai.component';
import { QuanLyBaoCaoTienDoComponent } from './pages/admin/quan-ly-bao-cao-tien-do/quan-ly-bao-cao-tien-do.component';
import { QuanLyPhanCongComponent } from './pages/admin/quan-ly-phan-cong/quan-ly-phan-cong.component';
import { QuanLyHoiDongComponent } from './pages/admin/quan-ly-hoi-dong/quan-ly-hoi-dong.component';
import { QuanLyThanhVienHoiDongComponent } from './pages/admin/quan-ly-thanh-vien-hoi-dong/quan-ly-thanh-vien-hoi-dong.component';
import { QuanLyTaiKhoanComponent } from './pages/admin/quan-ly-tai-khoan/quan-ly-tai-khoan.component';
import { QuanLyLogComponent } from './pages/admin/quan-ly-log/quan-ly-log.component';

import { DashboardComponent as StudentDashboardComponent } from './pages/student/dashboard/dashboard.component';
import { NopBaoCaoComponent } from './pages/student/nop-bao-cao/nop-bao-cao.component'; 
import { XemDeTaiCuaToiComponent } from './pages/student/xem-de-tai-cua-toi/xem-de-tai-cua-toi.component';
import { XemThongTinCaNhanSinhVienComponent } from './pages/student/xem-thong-tin-ca-nhan-sinh-vien/xem-thong-tin-ca-nhan-sinh-vien.component';
import { ThongTinDeTaiSinhVienComponent } from './pages/student/thong-tin-de-tai-sinh-vien/thong-tin-de-tai-sinh-vien.component';

import { DashboardComponent as LecturerDashboardComponent } from './pages/lecturer/dashboard/dashboard.component'; 
import { XemDeTaiHuongDanGiangVienComponent } from './pages/lecturer/xem-de-tai-huong-dan/xem-de-tai-huong-dan.component'; 
import { XemThongTinCaNhanGiangVienComponent } from './pages/lecturer/xem-thong-tin-ca-nhan-giang-vien/xem-thong-tin-ca-nhan-giang-vien.component';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },

  {
    path: 'admin',
    canActivate: [authGuard],
    data: { role: 'QTV' },
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'quan-ly-khoa', component: QuanLyKhoaComponent },
      { path: 'quan-ly-bo-mon', component: QuanLyBoMonComponent },
      { path: 'quan-ly-nganh', component: QuanLyNganhComponent },
      { path: 'quan-ly-chuyen-nganh', component: QuanLyChuyenNganhComponent },
      { path: 'quan-ly-lop', component: QuanLyLopComponent },
      { path: 'quan-ly-sinh-vien', component: QuanLySinhVienComponent },
      { path: 'quan-ly-giang-vien', component: QuanLyGiangVienComponent },
      { path: 'quan-ly-dot-do-an', component: QuanLyDotDoAnComponent },
      { path: 'quan-ly-de-tai', component: QuanLyDeTaiComponent,  data: { role: ['QTV', 'GV'] }  },
      { path: 'quan-ly-bao-cao-tien-do', component: QuanLyBaoCaoTienDoComponent }, 
      { path: 'quan-ly-hoi-dong', component: QuanLyHoiDongComponent }, 
      { path: 'quan-ly-phan-cong', component: QuanLyPhanCongComponent }, 
      { path: 'quan-ly-thanh-vien-hoi-dong', component: QuanLyThanhVienHoiDongComponent },
      { path: 'quan-ly-tai-khoan', component: QuanLyTaiKhoanComponent },  
      { path: 'quan-ly-log', component: QuanLyLogComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  {
    path: 'student', 
    canActivate: [authGuard],
    data: { role: 'SV' },
    children: [
      { path: 'dashboard', component: StudentDashboardComponent },
      { path: 'nop-bao-cao', component: NopBaoCaoComponent }, 
      { path: 'xem-de-tai-cua-toi', component: XemDeTaiCuaToiComponent },
      { path: 'thong-tin-ca-nhan', component: XemThongTinCaNhanSinhVienComponent },
      { path: 'thong-tin-de-tai', component: ThongTinDeTaiSinhVienComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  {
    path: 'lecturer',
    canActivate: [authGuard],
    data: { role: 'GV' }, 
    children: [
      { path: 'dashboard', component: LecturerDashboardComponent },
      { path: 'xem-de-tai-huong-dan', component: XemDeTaiHuongDanGiangVienComponent },
      { path: 'thong-tin-ca-nhan', component: XemThongTinCaNhanGiangVienComponent },
      {
        path: 'quan-ly-bao-cao-tien-do',
        component: QuanLyBaoCaoTienDoComponent,
        data: { role: ['GV', 'QTV'] }
      },
      { 
        path: 'quan-ly-de-tai', 
        component: QuanLyDeTaiComponent, 
        data: { role: ['QTV', 'GV'] } 
      },
      { 
        path: 'quan-ly-phan-cong', 
        component: QuanLyPhanCongComponent, 
        data: { role: ['QTV', 'GV'] } 
      },
      {
        path: 'bao-cao-tien-do/sinh-vien/:maSV/de-tai/:maDeTai',
        component: NopBaoCaoComponent,
        data: { mode: 'lecturerView' }
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' }, 
];