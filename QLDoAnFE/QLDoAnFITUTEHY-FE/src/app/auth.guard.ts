import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    console.warn('AuthGuard: Người dùng chưa đăng nhập. Chuyển hướng đến trang đăng nhập.');
    router.navigate(['/login']);
    return false;
  }

  const requiredRole = route.data['role'] as string;

  if (!requiredRole) {
    console.log('AuthGuard: Không yêu cầu vai trò cụ thể cho route này. Cho phép truy cập.');
    return true;
  }

  if (authService.hasRole(requiredRole)) {
    console.log(`AuthGuard: Người dùng có vai trò yêu cầu (${requiredRole}). Cho phép truy cập.`);
    return true;
  } else {
    console.warn(`AuthGuard: Người dùng không có vai trò yêu cầu (${requiredRole}). Vai trò hiện tại: ${authService.getUserRole()}.`);
    const currentUserRole = authService.getUserRole();
    switch (currentUserRole) {
      case 'QTV': router.navigate(['/admin/dashboard']); break;
      case 'SV': router.navigate(['/student/dashboard']); break;
      case 'GV': router.navigate(['/lecturer/dashboard']); break;
      default: router.navigate(['/']);
    }
    return false;
  }
};