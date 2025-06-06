using QLDoAnFITUTEHY.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLDoAnFITUTEHY.Models
{
    [Table("TaiKhoan")]
    public class TaiKhoan
    {
        [Key]
        [Column("TenDangNhap")]
        [StringLength(50)]
        public string TenDangNhap { get; set; }

        [Required]
        [Column("MatKhau")]
        [StringLength(100)]
        public string MatKhau { get; set; }

        [Required]
        [Column("VaiTro")]
        [StringLength(20)]
        public string VaiTro { get; set; } = string.Empty;

        [Column("MaGV")]
        [StringLength(10)]
        public string? MaGV { get; set; }

        [Column("MaSV")]
        [StringLength(10)]
        public string? MaSV { get; set; }

        [ForeignKey("MaGV")]
        public GiangVien? GiangVien { get; set; }

        [ForeignKey("MaSV")]
        public SinhVien? SinhVien { get; set; }
    }

}