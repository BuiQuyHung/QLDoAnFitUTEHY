using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLDoAnFITUTEHY.Models
{
    [Table("DotDoAn")]
    public class DotDoAn
    {
        [Key]
        [Column("MaDotDoAn")]
        [MaxLength(10)]
        public string MaDotDoAn { get; set; }

        [Required]
        [Column("TenDotDoAn")]
        [MaxLength(200)]
        public string TenDotDoAn { get; set; }

        [Required]
        [Column("KhoaHoc")]
        [MaxLength(10)]
        public string KhoaHoc { get; set; }

        [Column("NgayBatDau")]
        public DateTime? NgayBatDau { get; set; }

        [Column("NgayKetThuc")]
        public DateTime? NgayKetThuc { get; set; }

        [Column("SoTuanThucHien")]
        public int? SoTuanThucHien { get; set; }

        [Column("MaLop")]
        [MaxLength(10)]
        [ForeignKey("Lop")]
        public string MaLop { get; set; }

        [Column("MaGV")]
        [MaxLength(10)]
        [ForeignKey("GiangVien")]
        public string MaGV { get; set; } 
        public Lop Lop { get; set; }
        public GiangVien GiangVien { get; set; }
        public ICollection<DeTai> DeTais { get; set; }
        public ICollection<HoiDong> HoiDongs { get; set; }
        public ICollection<PhanCong> PhanCongs { get; set; }
    }
}