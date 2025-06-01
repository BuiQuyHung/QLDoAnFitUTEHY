// src/app/pages/admin/quan-ly-log/quan-ly-log.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // Giữ lại nếu sau này muốn thêm form chỉnh sửa log
import { LogService } from '../../../services/log.service';
import { Log } from '../../../models/Log';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError, startWith, map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms'; // Thêm FormsModule cho two-way binding của search/filter input

@Component({
  selector: 'app-quan-ly-log',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule // Thêm FormsModule
  ],
  templateUrl: './quan-ly-log.component.html',
  styleUrls: ['./quan-ly-log.component.css']
})
export class QuanLyLogComponent implements OnInit {
  originalLogList: Log[] = []; // Danh sách log gốc từ API
  filteredLogList: Log[] = []; // Danh sách log đã lọc
  paginatedLogList: Log[] = []; // Danh sách log đã phân trang để hiển thị

  errorMessage: string = '';
  successMessage: string = ''; // Có thể không cần cho module log, nhưng giữ lại cho đồng bộ

  // --- Biến cho tìm kiếm và lọc ---
  searchTerm: string = '';
  filterUsername: string = '';
  filterTableName: string = '';
  uniqueUsernames: string[] = []; // Danh sách username duy nhất cho dropdown lọc
  uniqueTableNames: string[] = []; // Danh sách tên bảng duy nhất cho dropdown lọc

  private searchFilterTrigger = new Subject<void>(); // Trigger để kích hoạt tìm kiếm/lọc

  // --- Biến cho phân trang ---
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  totalItems: number = 0;
  pages: number[] = [];

  constructor(
    private logService: LogService,
    private fb: FormBuilder // Giữ lại nếu cần FormBuilder cho form xem chi tiết
  ) {}

  ngOnInit(): void {
    // Kết hợp trigger tìm kiếm/lọc và làm mới
    this.searchFilterTrigger.pipe(
      startWith(undefined as void), // Bắt đầu bằng cách tải dữ liệu lần đầu
      debounceTime(300), // Debounce cho tìm kiếm để tránh gọi API quá nhiều
      switchMap(() => {
        this.clearMessages();
        // Gọi API để lấy tất cả log.
        // Cần đảm bảo API của bạn đủ nhanh để trả về toàn bộ dữ liệu.
        return this.logService.getAllLogs().pipe(
          catchError((error: HttpErrorResponse) => {
            console.error('Lỗi khi tải danh sách log:', error);
            this.errorMessage = 'Không thể tải danh sách log. Vui lòng thử lại sau.';
            return of([]); // Trả về mảng rỗng nếu có lỗi
          })
        );
      })
    ).subscribe(data => {
      this.originalLogList = data;
      this.extractUniqueFilters(); // Trích xuất danh sách duy nhất cho bộ lọc dropdown
      this.applyFiltersAndPaginate(); // Áp dụng lọc và phân trang
    });
  }

  // Trích xuất danh sách tên đăng nhập và tên bảng duy nhất từ dữ liệu log
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

  // Áp dụng các bộ lọc và sau đó phân trang
  applyFiltersAndPaginate(): void {
    let tempFilteredList = [...this.originalLogList];

    // Lọc theo từ khóa tìm kiếm (HanhDong hoặc MoTaChiTiet hoặc MaLog)
    if (this.searchTerm) {
      const lowerCaseSearchTerm = this.searchTerm.toLowerCase();
      tempFilteredList = tempFilteredList.filter(log =>
        log.hanhDong.toLowerCase().includes(lowerCaseSearchTerm) ||
        (log.moTaChiTiet && log.moTaChiTiet.toLowerCase().includes(lowerCaseSearchTerm)) ||
        log.maLog.toString().includes(lowerCaseSearchTerm)
      );
    }

    // Lọc theo Username
    if (this.filterUsername) {
      tempFilteredList = tempFilteredList.filter(log =>
        log.tenDangNhap === this.filterUsername
      );
    }

    // Lọc theo Table Name
    if (this.filterTableName) {
      tempFilteredList = tempFilteredList.filter(log =>
        log.bangBiThayDoi === this.filterTableName
      );
    }

    this.filteredLogList = tempFilteredList;
    this.totalItems = this.filteredLogList.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

    // Đảm bảo currentPage không vượt quá totalPages sau khi lọc
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1;
    }
    this.updatePagination();
  }

  // Cập nhật danh sách log hiển thị cho trang hiện tại
  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedLogList = this.filteredLogList.slice(startIndex, endIndex);
    this.generatePageNumbers();
  }

  // Tạo mảng số trang để hiển thị trên UI
  generatePageNumbers(): void {
    this.pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pages.push(i);
    }
  }

  // Xử lý khi thay đổi trang
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  // Xử lý khi thay đổi số mục trên mỗi trang
  onItemsPerPageChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.itemsPerPage = +value; // Chuyển đổi sang số
    this.currentPage = 1; // Reset về trang đầu tiên
    this.applyFiltersAndPaginate();
  }

  // Xử lý khi input tìm kiếm thay đổi
  onSearchTermChange(): void {
    this.searchFilterTrigger.next();
  }

  // Xử lý khi dropdown lọc username thay đổi
  onFilterUsernameChange(): void {
    this.searchFilterTrigger.next();
  }

  // Xử lý khi dropdown lọc table name thay đổi
  onFilterTableNameChange(): void {
    this.searchFilterTrigger.next();
  }

  // Reset tất cả bộ lọc và quay về trang đầu tiên
  resetFilters(): void {
    this.searchTerm = '';
    this.filterUsername = '';
    this.filterTableName = '';
    this.currentPage = 1;
    this.searchFilterTrigger.next(); // Kích hoạt lại quá trình lọc và phân trang
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }
}