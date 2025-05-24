using System;
using System.Collections.Generic; // Thêm namespace này
using System.ComponentModel.DataAnnotations;

namespace QLDoAnFITUTEHY.DTOs.DotDoAn
{
    // DTO dùng để trả về thông tin chi tiết của một Đợt đồ án (cho GET by ID hoặc GET All)
    public class DotDoAnDTO
    {
        public string MaDotDoAn { get; set; }
        public string TenDotDoAn { get; set; }
        public string KhoaHoc { get; set; }
        public DateTime? NgayBatDau { get; set; }
        public DateTime? NgayKetThuc { get; set; } // NgayKetThuc sẽ được tính toán và trả về
        public int? SoTuanThucHien { get; set; }

        // --- THAY THẾ MaLop, TenLop, MaGV, HoTenGV bằng danh sách các đối tượng DTO ---
        // Public string MaLop { get; set; }
        // Public string TenLop { get; set; }
        // Public string MaGV { get; set; }
        // Public string HoTenGV { get; set; }

        // Danh sách các đối tượng LopDto đầy đủ (chứa MaLop và TenLop)
        public List<LopDto> DsLop { get; set; }
        // Danh sách các đối tượng GiangVienDto đầy đủ (chứa MaGV và HoTen)
        public List<GiangVienDto> DsGiangVien { get; set; }
    }

    // DTO dùng để tạo mới một Đợt đồ án (cho API POST)
    public class DotDoAnForCreationDTO
    {
        [Required(ErrorMessage = "Mã đợt đồ án là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã đợt đồ án không được vượt quá 10 ký tự.")]
        public string MaDotDoAn { get; set; }

        [Required(ErrorMessage = "Tên đợt đồ án là bắt buộc.")]
        [MaxLength(200, ErrorMessage = "Tên đợt đồ án không được vượt quá 200 ký tự.")]
        public string TenDotDoAn { get; set; }

        [Required(ErrorMessage = "Khóa học là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Khóa học không được vượt quá 10 ký tự.")]
        public string KhoaHoc { get; set; }

        public DateTime? NgayBatDau { get; set; }
        // NgayKetThuc sẽ được tính toán ở Backend hoặc Frontend, không cần gửi lên
        // Public DateTime? NgayKetThuc { get; set; }
        public int? SoTuanThucHien { get; set; }

        // --- THAY THẾ MaLop, MaGV bằng danh sách các ID ---
        // [MaxLength(10, ErrorMessage = "Mã lớp không được vượt quá 10 ký tự.")]
        // public string MaLop { get; set; }

        // [MaxLength(10, ErrorMessage = "Mã giảng viên không được vượt quá 10 ký tự.")]
        // public string MaGV { get; set; }

        [Required(ErrorMessage = "Phải có ít nhất một lớp cho đợt đồ án.")]
        public List<string> LopIds { get; set; } // Danh sách Mã lớp
        public List<string> GiangVienIds { get; set; } // Danh sách Mã giảng viên (có thể null nếu GV được thêm sau)
    }

    // DTO dùng để cập nhật một Đợt đồ án (cho API PUT)
    public class DotDoAnForUpdateDTO
    {
        // MaDotDoAn cần được gửi lên để xác định bản ghi cần cập nhật
        [Required(ErrorMessage = "Mã đợt đồ án là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã đợt đồ án không được vượt quá 10 ký tự.")]
        public string MaDotDoAn { get; set; } // Thêm trường này

        [Required(ErrorMessage = "Tên đợt đồ án là bắt buộc.")]
        [MaxLength(200, ErrorMessage = "Tên đợt đồ án không được vượt quá 200 ký tự.")]
        public string TenDotDoAn { get; set; }

        [Required(ErrorMessage = "Khóa học là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Khóa học không được vượt quá 10 ký tự.")]
        public string KhoaHoc { get; set; }

        public DateTime? NgayBatDau { get; set; }
        // Public DateTime? NgayKetThuc { get; set; }
        public int? SoTuanThucHien { get; set; }

        // --- THAY THẾ MaLop, MaGV bằng danh sách các ID ---
        // [MaxLength(10, ErrorMessage = "Mã lớp không được vượt quá 10 ký tự.")]
        // public string MaLop { get; set; }

        // [MaxLength(10, ErrorMessage = "Mã giảng viên không được vượt quá 10 ký tự.")]
        // public string MaGV { get; set; }

        [Required(ErrorMessage = "Phải có ít nhất một lớp cho đợt đồ án.")]
        public List<string> LopIds { get; set; }
        public List<string> GiangVienIds { get; set; }
    }

    // DTO cho Lop (dùng để nhúng vào DotDoAnDTO khi trả về danh sách lớp)
    public class LopDto
    {
        public string MaLop { get; set; }
        public string TenLop { get; set; }
        // Thêm các thuộc tính khác của Lop nếu cần hiển thị
    }

    // DTO cho GiangVien (dùng để nhúng vào DotDoAnDTO khi trả về danh sách giảng viên)
    public class GiangVienDto
    {
        public string MaGV { get; set; }
        public string HoTen { get; set; } // Đổi tên để rõ ràng hơn nếu có TenGV
        // Thêm các thuộc tính khác của GiangVien nếu cần hiển thị
    }
}