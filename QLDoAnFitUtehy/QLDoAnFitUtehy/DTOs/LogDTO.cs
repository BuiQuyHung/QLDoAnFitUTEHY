using System.ComponentModel.DataAnnotations;

namespace QLDoAnFITUTEHY.DTOs.Log
{
    public class LogDto
    {
        public int MaLog { get; set; }
        public string? TenDangNhap { get; set; }
        public DateTime ThoiGian { get; set; }
        public string HanhDong { get; set; }
        public string BangBiThayDoi { get; set; }
        public string? MoTaChiTiet { get; set; }
    }

    public class LogCreateDto
    {
        [StringLength(50)]
        public string? TenDangNhap { get; set; }

        [Required(ErrorMessage = "Hành động là bắt buộc.")]
        [StringLength(200)]
        public string HanhDong { get; set; }

        [Required(ErrorMessage = "Bảng bị thay đổi là bắt buộc.")]
        [StringLength(100)]
        public string BangBiThayDoi { get; set; }

        [StringLength(500)]
        public string? MoTaChiTiet { get; set; }
    }
}