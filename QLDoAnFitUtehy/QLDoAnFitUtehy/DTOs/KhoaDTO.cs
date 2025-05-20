using System.ComponentModel.DataAnnotations;

namespace QLDoAnFITUTEHY.DTOs.Khoa
{
    public class KhoaDTO
    {
        public string MaKhoa { get; set; }
        public string TenKhoa { get; set; }
    }

    public class KhoaForCreationDTO
    {
        [Required(ErrorMessage = "Mã khoa là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã khoa không được vượt quá 10 ký tự.")]
        public string MaKhoa { get; set; }

        [Required(ErrorMessage = "Tên khoa là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Tên khoa không được vượt quá 100 ký tự.")]
        public string TenKhoa { get; set; }
    }

    public class KhoaForUpdateDTO
    {
        [Required(ErrorMessage = "Tên khoa là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Tên khoa không được vượt quá 100 ký tự.")]
        public string TenKhoa { get; set; }
    }
}