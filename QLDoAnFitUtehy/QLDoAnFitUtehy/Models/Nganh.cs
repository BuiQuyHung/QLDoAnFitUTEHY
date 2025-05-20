using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLDoAnFITUTEHY.Models
{
    [Table("Nganh")]
    public class Nganh
    {
        [Key]
        [Column("MaNganh")]
        [MaxLength(10)]
        public string MaNganh { get; set; }

        [Required]
        [Column("TenNganh")]
        [MaxLength(100)]
        public string TenNganh { get; set; }

        [Column("MaBoMon")]
        [MaxLength(10)]
        [ForeignKey("BoMon")]
        public string MaBoMon { get; set; }

        public BoMon BoMon { get; set; }

        public ICollection<ChuyenNganh> ChuyenNganhs { get; set; }
    }
}