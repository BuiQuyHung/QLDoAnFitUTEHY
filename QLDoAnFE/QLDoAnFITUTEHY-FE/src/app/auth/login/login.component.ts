import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { LoginCredentials } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginPageComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    if (this.authService.isLoggedIn()) {
      const role = this.authService.getUserRole();
      (this.authService as any).redirectToDashboard(role);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.errorMessage = null;
      const credentials: LoginCredentials = {
        TenDangNhap: this.loginForm.value.username,
        MatKhau: this.loginForm.value.password
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Đăng nhập thành công!', response);
        },
        error: (err) => {
          this.errorMessage = 'Tên đăng nhập hoặc mật khẩu không đúng.';
          console.error('Lỗi đăng nhập:', err);
        }
      });
    } else {
      this.errorMessage = 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.';
    }
  }
}