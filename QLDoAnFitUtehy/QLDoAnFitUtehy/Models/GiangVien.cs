using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLDoAnFITUTEHY.Models
{
    [Table("GiangVien")]
    public class GiangVien
    {
        [Key]
        [Column("MaGV")]
        [MaxLength(10)]
        public string MaGV { get; set; }

        [Required]
        [Column("HoTen")]
        [MaxLength(100)]
        public string HoTen { get; set; }

        [Column("ChuyenNganh")]
        [MaxLength(100)]
        public string ChuyenNganh { get; set; }

        [Column("HocVi")]
        [MaxLength(100)]
        public string HocVi { get; set; }

        [Required]
        [Column("Email")]
        [MaxLength(100)]
        public string Email { get; set; }

        [Column("SoDienThoai")]
        [MaxLength(20)]
        public string SoDienThoai { get; set; }

        public ICollection<DotDoAn> DotDoAns { get; set; }
        public ICollection<DeTai> DeTais { get; set; }
        //public ICollection<BaoCaoTienDo> BaoCaoTienDos { get; set; }
        public ICollection<ThanhVienHoiDong> ThanhVienHoiDongs { get; set; }
        //public TaiKhoan TaiKhoan { get; set; }
    }
}