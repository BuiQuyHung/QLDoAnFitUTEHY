// src/app/services/api.service.ts
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // baseUrl nên được cấu hình trong môi trường sản phẩm/phát triển
  // (ví dụ: src/environments/environment.ts) để dễ quản lý.
  // Nhưng hiện tại, chúng ta sẽ giữ nó ở đây như đã định nghĩa.
  // Đảm bảo baseUrl của bạn kết thúc bằng '/'
  private baseUrl = 'https://localhost:7237/api/'; 

  constructor(private http: HttpClient) { }

  /**
   * Phương thức riêng để định dạng lỗi HTTP thành đối tượng Error nhất quán,
   * giúp hiển thị thông báo thân thiện hơn cho người dùng.
   * @param error Đối tượng HttpErrorResponse nhận được từ HttpClient.
   */
  private formatError(error: HttpErrorResponse): Error {
    let errorMessage = 'Lỗi không xác định đã xảy ra!';

    if (error.error instanceof ErrorEvent) {
      // Lỗi phía client-side (ví dụ: lỗi mạng, lỗi CORS)
      errorMessage = `Lỗi kết nối: ${error.error.message}`;
    } else if (error.status === 0) {
      // Không có phản hồi từ server (server không hoạt động hoặc không thể truy cập)
      errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc trạng thái API.';
    } else {
      // Lỗi phía server (có phản hồi HTTP status code)
      switch (error.status) {
        case 400:
          errorMessage = 'Yêu cầu không hợp lệ. Vui lòng kiểm tra dữ liệu đầu vào.';
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
          errorMessage = 'Dữ liệu bạn muốn thêm đã tồn tại hoặc có xung đột. Vui lòng kiểm tra lại.';
          break;
        case 500:
          errorMessage = 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';
          break;
        default:
          errorMessage = `Lỗi HTTP ${error.status}: ${error.statusText || 'Lỗi không xác định.'}`;
          break;
      }

      // Cố gắng lấy thông báo lỗi cụ thể hơn từ body phản hồi nếu có
      if (error.error) {
        if (typeof error.error === 'string') {
          // Backend trả về lỗi dạng chuỗi đơn giản
          errorMessage = `${errorMessage} Chi tiết: ${error.error}`;
        } else if (error.error.message) {
          // Backend trả về lỗi dạng object có thuộc tính 'message'
          errorMessage = `${errorMessage} Chi tiết: ${error.error.message}`;
        } else if (error.error.errors) {
            // Trường hợp lỗi validation từ ASP.NET Core (ModelState validation errors)
            const validationErrors = Object.values(error.error.errors).flat();
            errorMessage = `${errorMessage} Lỗi xác thực: ${validationErrors.join(', ')}`;
        }
      }
    }
    return new Error(errorMessage);
  }

  /**
   * Phương thức xử lý lỗi chung cho tất cả các cuộc gọi HTTP.
   * Nó sẽ bắt lỗi từ pipe và chuyển đến formatError để định dạng.
   * @param error Đối tượng HttpErrorResponse.
   */
  private handleError = (error: HttpErrorResponse) => {
    console.error('Lỗi API chi tiết:', error); // Giữ lại console.error chi tiết cho debug
    return throwError(() => this.formatError(error)); // Ném ra đối tượng Error đã được định dạng
  };

  /**
   * Thực hiện yêu cầu GET chung.
   * @param path Đường dẫn API tương đối (ví dụ: 'Khoa', 'BoMon/khoa/ID').
   * @returns Observable của kiểu dữ liệu T.
   */
  get<T>(path: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Thực hiện yêu cầu POST chung.
   * @param path Đường dẫn API tương đối (ví dụ: 'Khoa', 'BoMon').
   * @param body Dữ liệu sẽ gửi đi trong request body.
   * @returns Observable của kiểu dữ liệu T.
   */
  post<T>(path: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Thực hiện yêu cầu PUT chung.
   * @param path Đường dẫn API tương đối (ví dụ: 'Khoa/ID', 'BoMon/ID').
   * @param body Dữ liệu sẽ gửi đi trong request body.
   * @returns Observable của kiểu dữ liệu T.
   */
  put<T>(path: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Thực hiện yêu cầu DELETE chung.
   * @param path Đường dẫn API tương đối (ví dụ: 'Khoa/ID', 'BoMon/ID').
   * @returns Observable của kiểu dữ liệu T.
   */
  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`).pipe(
      catchError(this.handleError)
    );
  }
}