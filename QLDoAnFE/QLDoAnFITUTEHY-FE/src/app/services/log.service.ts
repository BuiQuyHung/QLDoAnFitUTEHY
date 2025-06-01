// src/app/services/log.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Log } from '../models/Log';
import { ApiService } from './api.service'; // Đảm bảo bạn có ApiService để gọi HTTP

@Injectable({
  providedIn: 'root'
})
export class LogService {

  constructor(private apiService: ApiService) { }

  // Lấy tất cả các log.
  // Do API không hỗ trợ phân trang/lọc phía server trực tiếp trên endpoint này,
  // chúng ta sẽ lấy toàn bộ và xử lý ở client.
  // Endpoint: GET /api/Log
  getAllLogs(): Observable<Log[]> {
    return this.apiService.get<Log[]>(`Log`);
  }

  // Lấy Log theo ID
  // Endpoint: GET /api/Log/{id}
  getLogById(id: number): Observable<Log> {
    return this.apiService.get<Log>(`Log/${id}`);
  }

  // Lấy log theo Username (Nếu bạn muốn dùng riêng, nhưng tốt nhất nên lọc trên getAllLogs)
  // Endpoint: GET /api/Log/byUsername/{username}
  getLogsByUsername(username: string): Observable<Log[]> {
    return this.apiService.get<Log[]>(`Log/byUsername/${username}`);
  }

  // Lấy log theo Table Name (Nếu bạn muốn dùng riêng, nhưng tốt nhất nên lọc trên getAllLogs)
  // Endpoint: GET /api/Log/byTableName/{tableName}
  getLogsByTableName(tableName: string): Observable<Log[]> {
    return this.apiService.get<Log[]>(`Log/byTableName/${tableName}`);
  }

  // POST /api/Log - Nếu cần thêm chức năng thêm log từ FE (ít dùng cho module log)
  addLog(log: Log): Observable<Log> {
    return this.apiService.post<Log>(`Log`, log);
  }
}