using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLDoAnFITUTEHY.Models
{
    [Table("ChuyenNganh")]
    public class ChuyenNganh
    {
        [Key]
        [Column("MaChuyenNganh")]
        [MaxLength(10)]
        public string MaChuyenNganh { get; set; }

        [Required]
        [Column("TenChuyenNganh")]
        [MaxLength(100)]
        public string TenChuyenNganh { get; set; }

        [Column("MaNganh")]
        [MaxLength(10)]
        [ForeignKey("Nganh")]
        public string MaNganh { get; set; }

        public Nganh Nganh { get; set; }

        public ICollection<Lop> Lops { get; set; }
    }
}