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
        public DeTai DeTai { get; set; } 

        [Required]
        [StringLength(10)]
        public string MaSV { get; set; }
        [ForeignKey("MaSV")]
        public SinhVien SinhVien { get; set; } 

        public DateTime NgayNop { get; set; } = DateTime.Now; 

        [Required]
        public int TuanBaoCao { get; set; }

        [Required]
        [StringLength(50)]
        public string LoaiBaoCao { get; set; } 

        [StringLength(255)]
        public string? TepDinhKem { get; set; } 

        [StringLength(500)]
        public string? GhiChuCuaSV { get; set; }

        [StringLength(10)]
        public string? MaGV { get; set; }
        [ForeignKey("MaGV")]
        public GiangVien GiangVien { get; set; } 

        public DateTime? NgayNhanXet { get; set; } 
        public string? NhanXetCuaGV { get; set; } 
        public double? DiemSo { get; set; } 

        [StringLength(50)]
        public string TrangThai { get; set; } = "Chờ chấm"; 
    }
}