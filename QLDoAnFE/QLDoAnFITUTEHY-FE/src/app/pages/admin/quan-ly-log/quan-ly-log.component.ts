import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; 
import { LogService } from '../../../services/log.service';
import { Log } from '../../../models/Log';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, startWith, map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms'; 
@Component({
  selector: 'app-quan-ly-log',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule 
  ],
  templateUrl: './quan-ly-log.component.html',
  styleUrls: ['./quan-ly-log.component.css']
})
export class QuanLyLogComponent implements OnInit {
  originalLogList: Log[] = []; 
  filteredLogList: Log[] = []; 
  paginatedLogList: Log[] = []; 

  errorMessage: string = '';
  successMessage: string = ''; 

  searchTerm: string = '';
  filterUsername: string = '';
  filterTableName: string = '';
  uniqueUsernames: string[] = []; 
  uniqueTableNames: string[] = []; 

  private searchFilterTrigger = new Subject<void>(); 

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  totalItems: number = 0;
  pages: number[] = [];

  constructor(
    private logService: LogService,
    private fb: FormBuilder 
  ) {}

  ngOnInit(): void {
    this.searchFilterTrigger.pipe(
      startWith(undefined as void), 
      debounceTime(300), 
      switchMap(() => {
        this.clearMessages();
        return this.logService.getAllLogs().pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Lỗi khi tải danh sách log:', error);
            this.errorMessage = 'Không thể tải danh sách log. Vui lòng thử lại sau.';
            return of([]); 
          })
        );
      })
    ).subscribe(data => {
      this.originalLogList = data;
      this.extractUniqueFilters(); 
      this.applyFiltersAndPaginate(); 
    });
  }

  extractUniqueFilters(): void {
    const usernames = new Set<string>();
    const tableNames = new Set<string>();
    this.originalLogList.forEach(log => {
      if (log.tenDangNhap) {
        usernames.add(log.tenDangNhap);
      }
      if (log.bangBiThayDoi) {
        tableNames.add(log.bangBiThayDoi);
      }
    });
    this.uniqueUsernames = Array.from(usernames).sort();
    this.uniqueTableNames = Array.from(tableNames).sort();
  }

  applyFiltersAndPaginate(): void {
    let tempFilteredList = [...this.originalLogList];

    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      tempFilteredList = tempFilteredList.filter(log =>
        log.hanhDong.toLowerCase().includes(lowerCaseSearchTerm) ||
        (log.moTaChiTiet && log.moTaChiTiet.toLowerCase().includes(lowerCaseSearchTerm)) ||
        log.maLog.toString().includes(lowerCaseSearchTerm)
      );
    }

    if (this.filterUsername) {
      tempFilteredList = tempFilteredList.filter(log =>
        log.tenDangNhap === this.filterUsername
      );
    }

    if (this.filterTableName) {
      tempFilteredList = tempFilteredList.filter(log =>
        log.bangBiThayDoi === this.filterTableName
      );
    }

    this.filteredLogList = tempFilteredList;
    this.totalItems = this.filteredLogList.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1;
    }
    this.updatePagination();
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedLogList = this.filteredLogList.slice(startIndex, endIndex);
    this.generatePageNumbers();
  }

  generatePageNumbers(): void {
    this.pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pages.push(i);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  onItemsPerPageChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.itemsPerPage = +value; 
    this.currentPage = 1; 
    this.applyFiltersAndPaginate();
  }

  onSearchTermChange(): void {
    this.searchFilterTrigger.next();
  }

  onFilterUsernameChange(): void {
    this.searchFilterTrigger.next();
  }

  onFilterTableNameChange(): void {
    this.searchFilterTrigger.next();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterUsername = '';
    this.filterTableName = '';
    this.currentPage = 1;
    this.searchFilterTrigger.next(); 
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}