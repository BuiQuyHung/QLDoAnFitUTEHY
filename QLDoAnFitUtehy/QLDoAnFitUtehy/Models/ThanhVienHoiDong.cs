using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLDoAnFITUTEHY.Models
{
    [Table("ThanhVienHoiDong")]
    public class ThanhVienHoiDong
    {
        [Key]
        [Column(Order = 0)]
        [MaxLength(10)]
        public string MaHoiDong { get; set; }

        [Column(Order = 1)]
        [MaxLength(10)]
        public string MaGV { get; set; }

        [Required]
        [MaxLength(50)]
        public string VaiTro { get; set; }
        public HoiDong HoiDong { get; set; }
        public GiangVien GiangVien { get; set; }
    }
}