using System;
using System.ComponentModel.DataAnnotations;

namespace QLDoAnFITUTEHY.DTOs.PhanCong
{
    public class PhanCongDTO
    {
        public string MaDeTai { get; set; }
        public string TenDeTai { get; set; }
        public string MaSV { get; set; }
        public string HoTenSV { get; set; }
        public DateTime? NgayPhanCong { get; set; }
        public string MaDotDoAn { get; set; }
        public string TenDotDoAn { get; set; }
    }

    public class PhanCongForCreationDTO
    {
        [Required(ErrorMessage = "Mã đề tài là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã đề tài không được vượt quá 10 ký tự.")]
        public string MaDeTai { get; set; }

        [Required(ErrorMessage = "Mã sinh viên là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã sinh viên không được vượt quá 10 ký tự.")]
        public string MaSV { get; set; }

        public DateTime? NgayPhanCong { get; set; } = DateTime.Now;

        [Required(ErrorMessage = "Mã đợt đồ án là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã đợt đồ án không được vượt quá 10 ký tự.")]
        public string MaDotDoAn { get; set; }
    }

    public class PhanCongForUpdateDTO
    {
        [Required(ErrorMessage = "Mã đề tài là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã đề tài không được vượt quá 10 ký tự.")]
        public string MaDeTai { get; set; }

        [Required(ErrorMessage = "Mã sinh viên là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã sinh viên không được vượt quá 10 ký tự.")]
        public string MaSV { get; set; }

        public DateTime? NgayPhanCong { get; set; }

        [Required(ErrorMessage = "Mã đợt đồ án là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã đợt đồ án không được vượt quá 10 ký tự.")]
        public string MaDotDoAn { get; set; }
    }
}