using System.ComponentModel.DataAnnotations;

namespace QLDoAnFITUTEHY.DTOs.Nganh
{
    public class NganhDTO
    {
        public string MaNganh { get; set; }
        public string TenNganh { get; set; }
        public string MaBoMon { get; set; }
        public string TenBoMon { get; set; } 
    }

    public class NganhForCreationDTO
    {
        [Required(ErrorMessage = "Mã ngành là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã ngành không được vượt quá 10 ký tự.")]
        public string MaNganh { get; set; }

        [Required(ErrorMessage = "Tên ngành là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Tên ngành không được vượt quá 100 ký tự.")]
        public string TenNganh { get; set; }

        [Required(ErrorMessage = "Mã bộ môn là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã bộ môn không được vượt quá 10 ký tự.")]
        public string MaBoMon { get; set; }
    }

    public class NganhForUpdateDTO
    {
        [Required(ErrorMessage = "Tên ngành là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Tên ngành không được vượt quá 100 ký tự.")]
        public string TenNganh { get; set; }

        [Required(ErrorMessage = "Mã bộ môn là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã bộ môn không được vượt quá 10 ký tự.")]
        public string MaBoMon { get; set; }
    }
}