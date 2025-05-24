using System.ComponentModel.DataAnnotations;

namespace QLDoAnFITUTEHY.DTOs.BaoCaoTienDo
{
    public class BaoCaoTienDoDto
    {
        public int MaBaoCao { get; set; }
        public string MaDeTai { get; set; }
        public string MaSV { get; set; }
        public DateTime NgayNop { get; set; }
        public int TuanBaoCao { get; set; }
        public string LoaiBaoCao { get; set; }
        public string? TepDinhKem { get; set; }
        public string? GhiChuCuaSV { get; set; }
        public string? MaGV { get; set; }
        public DateTime? NgayNhanXet { get; set; }
        public string? NhanXetCuaGV { get; set; }
        public double? DiemSo { get; set; }
        public string? TrangThai { get; set; }
    }

    // DTO để tạo mới báo cáo (dành cho Sinh viên)
    public class BaoCaoTienDoCreateDto
    {
        [Required(ErrorMessage = "Mã đề tài là bắt buộc.")]
        [StringLength(10)]
        public string MaDeTai { get; set; }

        // MaSV sẽ được lấy từ token của người dùng đang đăng nhập, không cần gửi từ client
        // [Required(ErrorMessage = "Mã sinh viên là bắt buộc.")]
        // [StringLength(10)]
        // public string MaSV { get; set; }

        [Required(ErrorMessage = "Tuần báo cáo là bắt buộc.")]
        public int TuanBaoCao { get; set; }

        [Required(ErrorMessage = "Loại báo cáo là bắt buộc.")]
        [StringLength(50)]
        public string LoaiBaoCao { get; set; }

        [StringLength(255)]
        public string? TepDinhKem { get; set; }

        [StringLength(500)]
        public string? GhiChuCuaSV { get; set; }
    }

    // DTO để cập nhật báo cáo (dành cho Sinh viên)
    public class BaoCaoTienDoUpdateDto
    {
        [Required(ErrorMessage = "Tuần báo cáo là bắt buộc.")]
        public int TuanBaoCao { get; set; }

        [Required(ErrorMessage = "Loại báo cáo là bắt buộc.")]
        [StringLength(50)]
        public string LoaiBaoCao { get; set; }

        [StringLength(255)]
        public string? TepDinhKem { get; set; }

        [StringLength(500)]
        public string? GhiChuCuaSV { get; set; }

        // Các trường này không được phép cập nhật bởi sinh viên, chỉ GV/Admin
        // public DateTime? NgayNhanXet { get; set; }
        // public string? NhanXetCuaGV { get; set; }
        // public double? DiemSo { get; set; }
        // public string? TrangThai { get; set; }
    }

    // DTO để Giảng viên nhận xét/chấm điểm báo cáo
    public class BaoCaoTienDoReviewDto
    {
        public DateTime? NgayNhanXet { get; set; } = DateTime.Now;

        [Required(ErrorMessage = "Nhận xét của giảng viên là bắt buộc.")]
        public string NhanXetCuaGV { get; set; } = string.Empty;

        [Required(ErrorMessage = "Điểm số là bắt buộc.")]
        [Range(0, 10, ErrorMessage = "Điểm số phải từ 0 đến 10.")]
        public double DiemSo { get; set; }

        [Required(ErrorMessage = "Trạng thái là bắt buộc.")]
        [StringLength(50)]
        public string TrangThai { get; set; } = string.Empty;
    }
}