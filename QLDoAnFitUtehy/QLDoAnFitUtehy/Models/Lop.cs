using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLDoAnFITUTEHY.Models
{
    [Table("Lop")]
    public class Lop
    {
        [Key]
        [Column("MaLop")]
        [MaxLength(10)]
        public string MaLop { get; set; }

        [Required]
        [Column("TenLop")]
        [MaxLength(100)]
        public string TenLop { get; set; }

        [Column("MaChuyenNganh")]
        [MaxLength(10)]
        [ForeignKey("ChuyenNganh")]
        public string MaChuyenNganh { get; set; }
        public ChuyenNganh ChuyenNganh { get; set; }
        public ICollection<SinhVien> SinhViens { get; set; }
        public ICollection<DotDoAn> DotDoAns { get; set; }
    }
}