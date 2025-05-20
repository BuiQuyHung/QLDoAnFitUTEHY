using System;
using System.ComponentModel.DataAnnotations;

namespace QLDoAnFITUTEHY.DTOs.DotDoAn
{
    public class DotDoAnDTO
    {
        public string MaDotDoAn { get; set; }
        public string TenDotDoAn { get; set; }
        public string KhoaHoc { get; set; }
        public DateTime? NgayBatDau { get; set; }
        public DateTime? NgayKetThuc { get; set; }
        public int? SoTuanThucHien { get; set; }
        public string MaLop { get; set; }
        public string TenLop { get; set; } 
        public string MaGV { get; set; }
        public string HoTenGV { get; set; } 
    }

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
        public DateTime? NgayKetThuc { get; set; }
        public int? SoTuanThucHien { get; set; }

        [MaxLength(10, ErrorMessage = "Mã lớp không được vượt quá 10 ký tự.")]
        public string MaLop { get; set; }

        [MaxLength(10, ErrorMessage = "Mã giảng viên không được vượt quá 10 ký tự.")]
        public string MaGV { get; set; }
    }

    public class DotDoAnForUpdateDTO
    {
        [Required(ErrorMessage = "Tên đợt đồ án là bắt buộc.")]
        [MaxLength(200, ErrorMessage = "Tên đợt đồ án không được vượt quá 200 ký tự.")]
        public string TenDotDoAn { get; set; }

        [Required(ErrorMessage = "Khóa học là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Khóa học không được vượt quá 10 ký tự.")]
        public string KhoaHoc { get; set; }

        public DateTime? NgayBatDau { get; set; }
        public DateTime? NgayKetThuc { get; set; }
        public int? SoTuanThucHien { get; set; }

        [MaxLength(10, ErrorMessage = "Mã lớp không được vượt quá 10 ký tự.")]
        public string MaLop { get; set; }

        [MaxLength(10, ErrorMessage = "Mã giảng viên không được vượt quá 10 ký tự.")]
        public string MaGV { get; set; }
    }
}