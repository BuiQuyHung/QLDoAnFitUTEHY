import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router'; // Cần import CommonModule nếu dùng standalone

@Component({
  selector: 'app-admin-dashboard',
  standalone: true, // <-- PHẢI CÓ DÒNG NÀY
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent { // <-- TÊN CLASS PHẢI ĐƯỢC EXPORT
  constructor() { }
  ngOnInit(): void { }
  testClick(): void {
    console.log('Bạn đã nhấp vào card "Quản lý Khoa"!');
  }
}