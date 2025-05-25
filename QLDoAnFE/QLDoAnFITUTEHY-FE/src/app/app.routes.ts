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
import { QuanLyBaoCaoTienDoComponent } from './pages/admin/quan-ly-bao-cao-tien-do/quan-ly-bao-cao-tien-do.component'; // Giả định đây là component quản lý báo cáo của Admin
import { QuanLyPhanCongComponent } from './pages/admin/quan-ly-phan-cong/quan-ly-phan-cong.component';
import { QuanLyHoiDongComponent } from './pages/admin/quan-ly-hoi-dong/quan-ly-hoi-dong.component';
import { QuanLyThanhVienHoiDongComponent } from './pages/admin/quan-ly-thanh-vien-hoi-dong/quan-ly-thanh-vien-hoi-dong.component';
import { QuanLyTaiKhoanComponent } from './pages/admin/quan-ly-tai-khoan/quan-ly-tai-khoan.component';

import { DashboardComponent as StudentDashboardComponent } from './pages/student/dashboard/dashboard.component';
import { SinhVienBaoCaoTienDoComponent } from './pages/student/bao-cao-tien-do/sinh-vien-bao-cao-tien-do.component'; // Đảm bảo đúng tên component và đường dẫn

import { DashboardComponent as LecturerDashboardComponent } from './pages/lecturer/dashboard/dashboard.component';
import { GiangVienBaoCaoTienDoComponent } from './pages/lecturer/bao-cao-tien-do/giang-vien-bao-cao-tien-do.component';


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
      { path: 'quan-ly-de-tai', component: QuanLyDeTaiComponent },
      { path: 'quan-ly-bao-cao-tien-do', component: QuanLyBaoCaoTienDoComponent }, 
      { path: 'quan-ly-hoi-dong', component: QuanLyHoiDongComponent }, 
      { path: 'quan-ly-phan-cong', component: QuanLyPhanCongComponent }, 
      { path: 'quan-ly-thanh-vien-hoi-dong', component: QuanLyThanhVienHoiDongComponent },
      { path: 'quan-ly-tai-khoan', component: QuanLyTaiKhoanComponent },  

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  {
    path: 'student', 
    canActivate: [authGuard],
    data: { role: 'SV' },
    children: [
      { path: 'dashboard', component: StudentDashboardComponent }, 
      { path: 'bao-cao-tien-do', component: SinhVienBaoCaoTienDoComponent }, 
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  {
    path: 'lecturer', 
    canActivate: [authGuard],
    data: { role: 'GV' },
    children: [
      { path: 'dashboard', component: LecturerDashboardComponent },
      { path: 'quan-ly-bao-cao-tien-do', component: GiangVienBaoCaoTienDoComponent }, 
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' }, 
];