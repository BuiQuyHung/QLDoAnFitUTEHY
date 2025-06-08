import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DotDoAn, DotDoAnForManipulation } from '../models/DotDoAn';
import { Lop } from '../models/Lop';
import { GiangVien } from '../models/GiangVien';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class DotDoAnService {
  constructor(private apiService: ApiService) {}

  getAllDotDoAn(): Observable<DotDoAn[]> {
    return this.apiService.get<DotDoAn[]>(`DotDoAn`);
  }

  getDotDoAnById(id: string): Observable<DotDoAn> {
    return this.apiService.get<DotDoAn>(`DotDoAn/${id}`);
  }

  addDotDoAn(dotDoAn: DotDoAnForManipulation): Observable<DotDoAn> {
    return this.apiService.post<DotDoAn>(`DotDoAn`, dotDoAn);
  }

  updateDotDoAn(
    maDotDoAn: string,
    dotDoAn: DotDoAnForManipulation
  ): Observable<DotDoAn> {
    return this.apiService.put<DotDoAn>(`DotDoAn/${maDotDoAn}`, dotDoAn);
  }

  deleteDotDoAn(maDotDoAn: string): Observable<any> {
    return this.apiService.delete<any>(`DotDoAn/${maDotDoAn}`);
  }

  getAllLops(): Observable<Lop[]> {
    return this.apiService.get<Lop[]>(`Lop`);
  }

  getAllGiangViens(): Observable<GiangVien[]> {
    return this.apiService.get<GiangVien[]>(`GiangVien`);
  }
}
