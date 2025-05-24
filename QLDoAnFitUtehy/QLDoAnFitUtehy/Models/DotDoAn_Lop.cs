using System.ComponentModel.DataAnnotations.Schema;

namespace QLDoAnFITUTEHY.Models
{
    [Table("DotDoAn_Lop")] 
    public class DotDoAn_Lop
    {
        public string MaDotDoAn { get; set; }
        public string MaLop { get; set; }

        [ForeignKey("MaDotDoAn")]
        public DotDoAn DotDoAn { get; set; }

        [ForeignKey("MaLop")]
        public Lop Lop { get; set; } 
    }
}