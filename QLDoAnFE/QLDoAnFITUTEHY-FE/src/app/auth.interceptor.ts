import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const authToken = authService.getAuthToken();

  if (authToken) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authToken}`)
    });
    return next(cloned);
  }
  return next(req);
};