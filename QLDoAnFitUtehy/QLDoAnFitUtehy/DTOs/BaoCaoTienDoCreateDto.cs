// DTOs/BaoCaoTienDoCreateDto.cs
using System.ComponentModel.DataAnnotations;

namespace QLDoAnFITUTEHY.DTOs
{
    public class BaoCaoTienDoCreateDto
    {
        [Required]
        [StringLength(10)]
        public string MaDeTai { get; set; }

        [Required]
        [StringLength(10)]
        public string MaSV { get; set; }

        [Required]
        public int TuanBaoCao { get; set; }

        [Required]
        [StringLength(50)]
        public string LoaiBaoCao { get; set; }

        [StringLength(255)]
        public string? TepDinhKem { get; set; }

        [StringLength(500)]
        public string GhiChuCuaSV { get; set; }
    }
}