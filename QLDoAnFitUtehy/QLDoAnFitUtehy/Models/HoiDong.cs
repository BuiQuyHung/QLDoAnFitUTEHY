using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLDoAnFITUTEHY.Models
{
    [Table("HoiDong")]
    public class HoiDong
    {
        [Key]
        [MaxLength(10)]
        public string MaHoiDong { get; set; }

        [Required]
        [MaxLength(100)]
        public string TenHoiDong { get; set; }

        public DateTime? NgayBaoVe { get; set; }

        [MaxLength(10)]
        [ForeignKey("DotDoAn")]
        public string MaDotDoAn { get; set; }
        public DotDoAn DotDoAn { get; set; }
    }
}