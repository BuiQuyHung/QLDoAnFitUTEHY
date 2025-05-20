using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLDoAnFITUTEHY.Models
{
    [Table("DeTai")]
    public class DeTai
    {
        [Key]
        [Column("MaDeTai")]
        [MaxLength(10)]
        public string MaDeTai { get; set; }

        [Required]
        [Column("TenDeTai")]
        [MaxLength(200)]
        public string TenDeTai { get; set; }

        [Column("MoTa")]
        public string MoTa { get; set; }

        [Column("MaGV")]
        [MaxLength(10)]
        [ForeignKey("GiangVien")]
        public string MaGV { get; set; }

        [Column("MaDotDoAn")]
        [MaxLength(10)]
        [ForeignKey("DotDoAn")]
        public string MaDotDoAn { get; set; }

        [Column("MaSV")]
        [MaxLength(10)]
        [ForeignKey("SinhVien")]
        public string MaSV { get; set; }

        [Column("TrangThaiDangKy")]
        [MaxLength(50)]
        public string TrangThaiDangKy { get; set; }
        public GiangVien GiangVien { get; set; }
        public DotDoAn DotDoAn { get; set; }
        public SinhVien SinhVien { get; set; }
        public ICollection<PhanCong> PhanCongs { get; set; }
        //public ICollection<BaoCaoTienDo> BaoCaoTienDos { get; set; }
    }
}