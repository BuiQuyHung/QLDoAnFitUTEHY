import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Cần import CommonModule nếu dùng standalone

@Component({
  selector: 'app-student-dashboard',
  standalone: true, // <-- PHẢI CÓ DÒNG NÀY
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent { // <-- TÊN CLASS PHẢI ĐƯỢC EXPORT
  // constructor() { }
  // ngOnInit(): void { }
}