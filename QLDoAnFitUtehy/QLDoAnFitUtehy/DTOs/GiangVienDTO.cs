using System.ComponentModel.DataAnnotations;

namespace QLDoAnFITUTEHY.DTOs.GiangVien
{
    public class GiangVienDTO
    {
        public string MaGV { get; set; }
        public string HoTen { get; set; }
        public string ChuyenNganh { get; set; }
        public string HocVi { get; set; }
        public string Email { get; set; }
        public string SoDienThoai { get; set; }
    }

    public class GiangVienForCreationDTO
    {
        [Required(ErrorMessage = "Mã giảng viên là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã giảng viên không được vượt quá 10 ký tự.")]
        public string MaGV { get; set; }

        [Required(ErrorMessage = "Họ tên giảng viên là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Họ tên không được vượt quá 100 ký tự.")]
        public string HoTen { get; set; }

        [MaxLength(100, ErrorMessage = "Chuyên ngành không được vượt quá 100 ký tự.")]
        public string ChuyenNganh { get; set; }

        [MaxLength(100, ErrorMessage = "Học vị không được vượt quá 100 ký tự.")]
        public string HocVi { get; set; }

        [Required(ErrorMessage = "Email là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Email không được vượt quá 100 ký tự.")]
        [EmailAddress(ErrorMessage = "Định dạng email không hợp lệ.")]
        public string Email { get; set; }

        [MaxLength(20, ErrorMessage = "Số điện thoại không được vượt quá 20 ký tự.")]
        public string SoDienThoai { get; set; }
    }

    public class GiangVienForUpdateDTO
    {
        [Required(ErrorMessage = "Họ tên giảng viên là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Họ tên không được vượt quá 100 ký tự.")]
        public string HoTen { get; set; }

        [MaxLength(100, ErrorMessage = "Chuyên ngành không được vượt quá 100 ký tự.")]
        public string ChuyenNganh { get; set; }

        [MaxLength(100, ErrorMessage = "Học vị không được vượt quá 100 ký tự.")]
        public string HocVi { get; set; }

        [Required(ErrorMessage = "Email là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Email không được vượt quá 100 ký tự.")]
        [EmailAddress(ErrorMessage = "Định dạng email không hợp lệ.")]
        public string Email { get; set; }

        [MaxLength(20, ErrorMessage = "Số điện thoại không được vượt quá 20 ký tự.")]
        public string SoDienThoai { get; set; }
    }
}