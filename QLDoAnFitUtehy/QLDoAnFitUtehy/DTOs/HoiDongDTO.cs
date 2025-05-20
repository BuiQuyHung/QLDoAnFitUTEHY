using System;
using System.ComponentModel.DataAnnotations;

namespace QLDoAnFITUTEHY.DTOs.HoiDong
{
    public class HoiDongDTO
    {
        public string MaHoiDong { get; set; }
        public string TenHoiDong { get; set; }
        public DateTime? NgayBaoVe { get; set; }
        public string MaDotDoAn { get; set; }
        public string TenDotDoAn { get; set; } 
    }
    public class HoiDongForCreateDTO
    {
        [Required(ErrorMessage = "Mã hội đồng là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã hội đồng không được vượt quá 10 ký tự.")]
        public string MaHoiDong { get; set; }

        [Required(ErrorMessage = "Tên hội đồng là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Tên hội đồng không được vượt quá 100 ký tự.")]
        public string TenHoiDong { get; set; }

        public DateTime? NgayBaoVe { get; set; }

        [Required(ErrorMessage = "Mã đợt đồ án là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã đợt đồ án không được vượt quá 10 ký tự.")]
        public string MaDotDoAn { get; set; }
    }
    public class HoiDongForUpdateDTO
    {
        [Required(ErrorMessage = "Tên hội đồng là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Tên hội đồng không được vượt quá 100 ký tự.")]
        public string TenHoiDong { get; set; }

        public DateTime? NgayBaoVe { get; set; }

        [Required(ErrorMessage = "Mã đợt đồ án là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã đợt đồ án không được vượt quá 10 ký tự.")]
        public string MaDotDoAn { get; set; }
    }
}