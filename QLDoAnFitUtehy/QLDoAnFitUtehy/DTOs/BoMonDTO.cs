using System.ComponentModel.DataAnnotations;

namespace QLDoAnFITUTEHY.DTOs.BoMon
{
    public class BoMonDTO
    {
        public string MaBoMon { get; set; }
        public string TenBoMon { get; set; }
        public string MaKhoa { get; set; }
        public string TenKhoa { get; set; } 
    }

    public class BoMonForCreationDTO
    {
        [Required(ErrorMessage = "Mã bộ môn là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã bộ môn không được vượt quá 10 ký tự.")]
        public string MaBoMon { get; set; }

        [Required(ErrorMessage = "Tên bộ môn là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Tên bộ môn không được vượt quá 100 ký tự.")]
        public string TenBoMon { get; set; }

        [Required(ErrorMessage = "Mã khoa là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã khoa không được vượt quá 10 ký tự.")]
        public string MaKhoa { get; set; }
    }

    public class BoMonForUpdateDTO
    {
        [Required(ErrorMessage = "Tên bộ môn là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Tên bộ môn không được vượt quá 100 ký tự.")]
        public string TenBoMon { get; set; }

        [Required(ErrorMessage = "Mã khoa là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã khoa không được vượt quá 10 ký tự.")]
        public string MaKhoa { get; set; }
    }
}