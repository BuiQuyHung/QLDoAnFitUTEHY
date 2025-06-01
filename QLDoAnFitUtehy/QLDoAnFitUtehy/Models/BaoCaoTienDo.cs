// Models/BaoCaoTienDo.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLDoAnFITUTEHY.Models
{
    [Table("BaoCaoTienDo")]
    public class BaoCaoTienDo
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MaBaoCao { get; set; }

        [Required]
        [StringLength(10)]
        public string MaDeTai { get; set; }
        [ForeignKey("MaDeTai")]
        public DeTai DeTai { get; set; } // Navigation property

        [Required]
        [StringLength(10)]
        public string MaSV { get; set; }
        [ForeignKey("MaSV")]
        public SinhVien SinhVien { get; set; } // Navigation property

        public DateTime NgayNop { get; set; } = DateTime.Now; // Mặc định là thời gian hiện tại

        [Required]
        public int TuanBaoCao { get; set; }

        [Required]
        [StringLength(50)]
        public string LoaiBaoCao { get; set; } // Ví dụ: "Giữa kỳ", "Hàng tuần"

        [StringLength(255)]
        public string? TepDinhKem { get; set; } // URL hoặc đường dẫn file

        [StringLength(500)]
        public string? GhiChuCuaSV { get; set; }

        [StringLength(10)]
        public string? MaGV { get; set; }
        [ForeignKey("MaGV")]
        public GiangVien GiangVien { get; set; } // Navigation property

        public DateTime? NgayNhanXet { get; set; } // Có thể null
        public string? NhanXetCuaGV { get; set; } // Có thể null
        public double? DiemSo { get; set; } // Có thể null

        [StringLength(50)]
        public string TrangThai { get; set; } = "Chờ chấm"; // Mặc định
    }
}