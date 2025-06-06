using System;
using System.Collections.Generic; 
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
        public List<LopDto> DsLop { get; set; }
        public List<GiangVienDto> DsGiangVien { get; set; }
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
        public int? SoTuanThucHien { get; set; }

        [Required(ErrorMessage = "Phải có ít nhất một lớp cho đợt đồ án.")]
        public List<string> LopIds { get; set; } 
        public List<string> GiangVienIds { get; set; } 
    }

    public class DotDoAnForUpdateDTO
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
        public int? SoTuanThucHien { get; set; }
        [Required(ErrorMessage = "Phải có ít nhất một lớp cho đợt đồ án.")]
        public List<string> LopIds { get; set; }
        public List<string> GiangVienIds { get; set; }
    }

    public class LopDto
    {
        public string MaLop { get; set; }
        public string TenLop { get; set; }
    }

    public class GiangVienDto
    {
        public string MaGV { get; set; }
        public string HoTen { get; set; } 
    }
}