import { Routes } from '@angular/router';
import { LoginPageComponent } from './auth/login/login.component';
import { authGuard } from './auth.guard';

import { DashboardComponent as AdminDashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { DashboardComponent as StudentDashboardComponent } from './pages/student/dashboard/dashboard.component';
import { DashboardComponent as LecturerDashboardComponent } from './pages/lecturer/dashboard/dashboard.component';
import { QuanLyKhoaComponent } from './pages/admin/quan-ly-khoa/quan-ly-khoa.component';
import { QuanLyBoMonComponent } from './pages/admin/quan-ly-bo-mon/quan-ly-bo-mon.component';
import { QuanLyNganhComponent } from './pages/admin/quan-ly-nganh/quan-ly-nganh.component';
import { QuanLyChuyenNganhComponent } from './pages/admin/quan-ly-chuyen-nganh/quan-ly-chuyen-nganh.component';
import { QuanLyLopComponent } from './pages/admin/quan-ly-lop/quan-ly-lop.component';
import { QuanLySinhVienComponent } from './pages/admin/quan-ly-sinh-vien/quan-ly-sinh-vien.component';
import { QuanLyGiangVienComponent } from './pages/admin/quan-ly-giang-vien/quan-ly-giang-vien.component';
import { QuanLyDotDoAnComponent } from './pages/admin/quan-ly-dot-do-an/quan-ly-dot-do-an.component';

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

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' } 
    ]
  },


  {
    path: 'student/dashboard',
    component: StudentDashboardComponent,
    canActivate: [authGuard],
    data: { role: 'SV' }
  },

  {
    path: 'lecturer/dashboard',
    component: LecturerDashboardComponent,
    canActivate: [authGuard],
    data: { role: 'GV' }
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];