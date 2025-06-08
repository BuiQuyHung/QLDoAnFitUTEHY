import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private baseUrl = 'https://localhost:7237/api/';

  constructor(private http: HttpClient) {}

  private formatError(error: HttpErrorResponse): Error {
    let errorMessage = 'Lỗi không xác định đã xảy ra!';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Lỗi kết nối: ${error.error.message}`;
    } else if (error.status === 0) {
      errorMessage =
        'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc trạng thái API.';
    } else {
      switch (error.status) {
        case 400:
          errorMessage =
            'Yêu cầu không hợp lệ. Vui lòng kiểm tra dữ liệu đầu vào.';
          break;
        case 401:
          errorMessage = 'Bạn không có quyền truy cập. Vui lòng đăng nhập lại.';
          break;
        case 403:
          errorMessage = 'Bạn không được phép thực hiện hành động này.';
          break;
        case 404:
          errorMessage = 'Không tìm thấy tài nguyên bạn yêu cầu.';
          break;
        case 409:
          errorMessage =
            'Dữ liệu bạn muốn thêm đã tồn tại hoặc có xung đột. Vui lòng kiểm tra lại.';
          break;
        case 500:
          errorMessage = 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
          break;
        default:
          errorMessage = `Lỗi HTTP ${error.status}: ${
            error.statusText || 'Lỗi không xác định.'
          }`;
          break;
      }

      if (error.error) {
        if (typeof error.error === 'string') {
          errorMessage = `${errorMessage} Chi tiết: ${error.error}`;
        } else if (error.error.message) {
          errorMessage = `${errorMessage} Chi tiết: ${error.error.message}`;
        } else if (error.error.errors) {
          const validationErrors = Object.values(error.error.errors).flat();
          errorMessage = `${errorMessage} Lỗi xác thực: ${validationErrors.join(
            ', '
          )}`;
        }
      }
    }
    return new Error(errorMessage);
  }

  private handleError = (error: HttpErrorResponse) => {
    console.error('Lỗi API chi tiết:', error);
    return throwError(() => this.formatError(error));
  };

  get<T>(path: string): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}${path}`)
      .pipe(catchError(this.handleError));
  }

  post<T>(path: string, body: any): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}${path}`, body)
      .pipe(catchError(this.handleError));
  }

  put<T>(path: string, body: any): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}${path}`, body)
      .pipe(catchError(this.handleError));
  }

  delete<T>(path: string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}${path}`)
      .pipe(catchError(this.handleError));
  }
}
