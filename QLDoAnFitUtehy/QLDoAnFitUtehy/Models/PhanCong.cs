using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLDoAnFITUTEHY.Models
{
    [Table("PhanCong")]
    public class PhanCong
    {
        [Column("MaDeTai", Order = 0)]
        [MaxLength(10)]
        [ForeignKey("DeTai")]
        public string MaDeTai { get; set; }

        [Column("MaSV", Order = 1)]
        [MaxLength(10)]
        [ForeignKey("SinhVien")]
        public string MaSV { get; set; }

        [Column("NgayPhanCong")]
        public DateTime? NgayPhanCong { get; set; }

        [Column("MaDotDoAn")]
        [MaxLength(10)]
        [ForeignKey("DotDoAn")]
        public string MaDotDoAn { get; set; }

        public DeTai DeTai { get; set; }
        public SinhVien SinhVien { get; set; }
        public DotDoAn DotDoAn { get; set; }
    }
}