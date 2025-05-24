using System.ComponentModel.DataAnnotations.Schema;

namespace QLDoAnFITUTEHY.Models
{
    [Table("DotDoAn_GiangVien")]
    public class DotDoAn_GiangVien
    {
        public string MaDotDoAn { get; set; }
        public string MaGV { get; set; }

        [ForeignKey("MaDotDoAn")]
        public DotDoAn DotDoAn { get; set; }

        [ForeignKey("MaGV")]
        public GiangVien GiangVien { get; set; } 
    }
}