using System.ComponentModel.DataAnnotations;

namespace QLDoAnFITUTEHY.DTOs.DeTai
{
    public class DeTaiDTO
    {
        public string MaDeTai { get; set; }
        public string TenDeTai { get; set; }
        public string MoTa { get; set; }
        public string MaGV { get; set; }
        public string HoTenGV { get; set; } 
        public string MaDotDoAn { get; set; }
        public string TenDotDoAn { get; set; }
        public string MaSV { get; set; }
        public string HoTenSV { get; set; } 
        public string TrangThaiDangKy { get; set; }
    }

    public class DeTaiForCreationDTO
    {
        [Required(ErrorMessage = "Mã đề tài là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã đề tài không được vượt quá 10 ký tự.")]
        public string MaDeTai { get; set; }

        [Required(ErrorMessage = "Tên đề tài là bắt buộc.")]
        [MaxLength(200, ErrorMessage = "Tên đề tài không được vượt quá 200 ký tự.")]
        public string TenDeTai { get; set; }

        public string MoTa { get; set; }

        [Required(ErrorMessage = "Mã giảng viên là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã giảng viên không được vượt quá 10 ký tự.")]
        public string MaGV { get; set; }

        [Required(ErrorMessage = "Mã đợt đồ án là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã đợt đồ án không được vượt quá 10 ký tự.")]
        public string MaDotDoAn { get; set; }

        [MaxLength(10, ErrorMessage = "Mã sinh viên không được vượt quá 10 ký tự.")]
        public string MaSV { get; set; }

        [MaxLength(50, ErrorMessage = "Trạng thái đăng ký không được vượt quá 50 ký tự.")]
        public string TrangThaiDangKy { get; set; } = "Chờ duyệt";
    }

    public class DeTaiForUpdateDTO
    {
        [Required(ErrorMessage = "Tên đề tài là bắt buộc.")]
        [MaxLength(200, ErrorMessage = "Tên đề tài không được vượt quá 200 ký tự.")]
        public string TenDeTai { get; set; }

        public string MoTa { get; set; }

        [Required(ErrorMessage = "Mã giảng viên là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã giảng viên không được vượt quá 10 ký tự.")]
        public string MaGV { get; set; }

        [Required(ErrorMessage = "Mã đợt đồ án là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã đợt đồ án không được vượt quá 10 ký tự.")]
        public string MaDotDoAn { get; set; }

        [MaxLength(10, ErrorMessage = "Mã sinh viên không được vượt quá 10 ký tự.")]
        public string MaSV { get; set; }

        [MaxLength(50, ErrorMessage = "Trạng thái đăng ký không được vượt quá 50 ký tự.")]
        public string TrangThaiDangKy { get; set; }
    }
}