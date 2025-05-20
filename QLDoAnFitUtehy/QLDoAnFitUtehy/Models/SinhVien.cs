using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace QLDoAnFITUTEHY.Models
{
    [Table("SinhVien")]
    public class SinhVien
    {
        [Key]
        [Column("MaSV")]
        [MaxLength(10)]
        public string MaSV { get; set; }

        [Required]
        [Column("HoTen")]
        [MaxLength(100)]
        public string HoTen { get; set; }

        [Required]
        [Column("Email")]
        [MaxLength(100)]
        public string Email { get; set; }

        [Column("SoDienThoai")]
        [MaxLength(20)]
        public string SoDienThoai { get; set; }

        [Column("NgaySinh")]
        public DateTime? NgaySinh { get; set; }

        [Column("MaLop")]
        [MaxLength(10)]
        [ForeignKey("Lop")]
        public string MaLop { get; set; }
        public Lop Lop { get; set; }
        public ICollection<PhanCong> PhanCongs { get; set; }
        //public ICollection<BaoCaoTienDo> BaoCaoTienDos { get; set; }
        public DeTai DeTai { get; set; } 
        //public TaiKhoan TaiKhoan { get; set; }
    }
}