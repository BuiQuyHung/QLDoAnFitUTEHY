using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLDoAnFITUTEHY.Models
{
    [Table("BoMon")]
    public class BoMon
    {
        [Key]
        [Column("MaBoMon")]
        [MaxLength(10)]
        public string MaBoMon { get; set; }

        [Required]
        [Column("TenBoMon")]
        [MaxLength(100)]
        public string TenBoMon { get; set; }

        [Column("MaKhoa")]
        [MaxLength(10)]
        [ForeignKey("Khoa")]
        public string MaKhoa { get; set; }
        public Khoa Khoa { get; set; }

        public ICollection<Nganh> Nganhs { get; set; }
    }
}