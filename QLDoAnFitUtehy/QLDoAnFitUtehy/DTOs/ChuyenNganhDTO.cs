using System.ComponentModel.DataAnnotations;

namespace QLDoAnFITUTEHY.DTOs.ChuyenNganh
{
    public class ChuyenNganhDTO
    {
        public string MaChuyenNganh { get; set; }
        public string TenChuyenNganh { get; set; }
        public string MaNganh { get; set; }
        public string TenNganh { get; set; } 
    }

    public class ChuyenNganhForCreationDTO
    {
        [Required(ErrorMessage = "Mã chuyên ngành là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã chuyên ngành không được vượt quá 10 ký tự.")]
        public string MaChuyenNganh { get; set; }

        [Required(ErrorMessage = "Tên chuyên ngành là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Tên chuyên ngành không được vượt quá 100 ký tự.")]
        public string TenChuyenNganh { get; set; }

        [Required(ErrorMessage = "Mã ngành là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã ngành không được vượt quá 10 ký tự.")]
        public string MaNganh { get; set; }
    }

    public class ChuyenNganhForUpdateDTO
    {
        [Required(ErrorMessage = "Tên chuyên ngành là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Tên chuyên ngành không được vượt quá 100 ký tự.")]
        public string TenChuyenNganh { get; set; }

        [Required(ErrorMessage = "Mã ngành là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã ngành không được vượt quá 10 ký tự.")]
        public string MaNganh { get; set; }
    }
}