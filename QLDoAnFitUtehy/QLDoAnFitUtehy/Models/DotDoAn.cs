using System;
using System.Collections.Generic; 
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

        public ICollection<DotDoAn_Lop> DotDoAn_Lops { get; set; } = new List<DotDoAn_Lop>();
        public ICollection<DotDoAn_GiangVien> DotDoAn_GiangViens { get; set; } = new List<DotDoAn_GiangVien>();
        public ICollection<DeTai> DeTais { get; set; }
        public ICollection<HoiDong> HoiDongs { get; set; }
        public ICollection<PhanCong> PhanCongs { get; set; }
    }
}