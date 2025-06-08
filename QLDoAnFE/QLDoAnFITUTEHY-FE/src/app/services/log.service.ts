import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Log } from '../models/Log';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  constructor(private apiService: ApiService) {}

  getAllLogs(): Observable<Log[]> {
    return this.apiService.get<Log[]>(`Log`);
  }

  getLogById(id: number): Observable<Log> {
    return this.apiService.get<Log>(`Log/${id}`);
  }

  getLogsByUsername(username: string): Observable<Log[]> {
    return this.apiService.get<Log[]>(`Log/byUsername/${username}`);
  }

  getLogsByTableName(tableName: string): Observable<Log[]> {
    return this.apiService.get<Log[]>(`Log/byTableName/${tableName}`);
  }

  addLog(log: Log): Observable<Log> {
    return this.apiService.post<Log>(`Log`, log);
  }
}
