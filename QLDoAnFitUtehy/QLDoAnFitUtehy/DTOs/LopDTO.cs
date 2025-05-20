using System.ComponentModel.DataAnnotations;

namespace QLDoAnFITUTEHY.DTOs.Lop
{
    public class LopDTO
    {
        public string MaLop { get; set; }
        public string TenLop { get; set; }
        public string MaChuyenNganh { get; set; }
        public string TenChuyenNganh { get; set; } 
    }

    public class LopForCreationDTO
    {
        [Required(ErrorMessage = "Mã lớp là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã lớp không được vượt quá 10 ký tự.")]
        public string MaLop { get; set; }

        [Required(ErrorMessage = "Tên lớp là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Tên lớp không được vượt quá 100 ký tự.")]
        public string TenLop { get; set; }

        [Required(ErrorMessage = "Mã chuyên ngành là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã chuyên ngành không được vượt quá 10 ký tự.")]
        public string MaChuyenNganh { get; set; }
    }

    public class LopForUpdateDTO
    {
        [Required(ErrorMessage = "Tên lớp là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Tên lớp không được vượt quá 100 ký tự.")]
        public string TenLop { get; set; }

        [Required(ErrorMessage = "Mã chuyên ngành là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã chuyên ngành không được vượt quá 10 ký tự.")]
        public string MaChuyenNganh { get; set; }
    }
}