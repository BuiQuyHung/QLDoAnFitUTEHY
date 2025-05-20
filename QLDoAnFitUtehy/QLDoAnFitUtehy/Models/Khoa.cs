using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLDoAnFITUTEHY.Models
{
    [Table("Khoa")] 
    public class Khoa
    {
        [Key]
        [Column("MaKhoa")] 
        [MaxLength(10)]
        public string MaKhoa { get; set; }

        [Required]
        [Column("TenKhoa")]
        [MaxLength(100)]
        public string TenKhoa { get; set; }

        public ICollection<BoMon> BoMons { get; set; }
    }
}