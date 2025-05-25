import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LoginCredentials, LoginResponse, UserInfo } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<UserInfo> = new BehaviorSubject<UserInfo>({ username: null, role: null });
  public currentUser$: Observable<UserInfo> = this.currentUserSubject.asObservable();

  constructor(private apiService: ApiService, private router: Router) {
    this.loadUserFromLocalStorage();
  }

  private loadUserFromLocalStorage(): void {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('userRole');
    const maGV = localStorage.getItem('maGV');
    const maSV = localStorage.getItem('maSV');
    if (username && role) {
      this.currentUserSubject.next({ username, role, maGV, maSV });
    }
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('TaiKhoan/login', credentials).pipe(
      tap(response => {
        localStorage.setItem('accessToken', response.token);
        localStorage.setItem('username', response.tenDangNhap);
        localStorage.setItem('userRole', response.vaiTro);
        if (response.maGV) localStorage.setItem('maGV', response.maGV);
        if (response.maSV) localStorage.setItem('maSV', response.maSV);

        this.currentUserSubject.next({
          username: response.tenDangNhap,
          role: response.vaiTro,
          maGV: response.maGV,
          maSV: response.maSV
        });

        this.redirectToDashboard(response.vaiTro);
      }),
      catchError(error => {
        console.error('Lỗi đăng nhập:', error);
         return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.clear();
    this.currentUserSubject.next({ username: null, role: null });
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getAuthToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  getUserMaGV(): string | null {
    return localStorage.getItem('maGV');
  }

  getUserMaSV(): string | null {
    return localStorage.getItem('maSV');
  }

  hasRole(requiredRole: string): boolean {
    const userRole = this.getUserRole();
    switch (requiredRole) {
      case 'QTV': return userRole === 'QTV';
      case 'SV': return userRole === 'SV';
      case 'GV': return userRole === 'GV';
      default: return false;
    }
  }

  private redirectToDashboard(role: string): void {
      console.log('redirectToDashboard called with role:', role);
    switch (role) {
      case 'QTV':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'SV':
        this.router.navigate(['/student/dashboard']);
        break;
      case 'GV':
        this.router.navigate(['/lecturer/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }
  get currentUserValue(): UserInfo {
    return this.currentUserSubject.value;
  }
}