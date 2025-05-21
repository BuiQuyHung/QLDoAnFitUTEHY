using QLDoAnFITUTEHY.Models;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLDoAnFITUTEHY.Models
{
    [Table("Log")]  
    public class Log
    {
        public int MaLog { get; set; } 
        public string? TenDangNhap { get; set; } 
        public DateTime ThoiGian { get; set; } = DateTime.Now; 
        public string HanhDong { get; set; } = string.Empty; 
        public string BangBiThayDoi { get; set; } = string.Empty; 
        public string? MoTaChiTiet { get; set; } 

        [ForeignKey("TenDangNhap")]
        public TaiKhoan? TaiKhoan { get; set; }
    }
}