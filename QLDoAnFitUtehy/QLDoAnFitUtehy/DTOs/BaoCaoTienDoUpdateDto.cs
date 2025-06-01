// DTOs/BaoCaoTienDoUpdateDto.cs
using System.ComponentModel.DataAnnotations;

namespace QLDoAnFITUTEHY.DTOs
{
    public class BaoCaoTienDoUpdateDto
    {
        [StringLength(10)]
        public string MaGV { get; set; }

        public string NhanXetCuaGV { get; set; }
        public double? DiemSo { get; set; }

        [StringLength(50)]
        public string TrangThai { get; set; }
    }
}