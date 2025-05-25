// src/app/pages/lecturer/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core'; // Đảm bảo import OnInit
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // Thêm RouterLink để nhất quán

@Component({
  selector: 'app-lecturer-dashboard', // Selector phù hợp cho dashboard giảng viên
  standalone: true,
  imports: [CommonModule, RouterLink], // Imports giống như student dashboard
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit { // Tên class là DashboardComponent và implements OnInit
  constructor() {
    // Constructor được sử dụng để tiêm các dependencies (services)
  }

  ngOnInit(): void {
    // Logic khởi tạo của component (nếu có)
  }
}