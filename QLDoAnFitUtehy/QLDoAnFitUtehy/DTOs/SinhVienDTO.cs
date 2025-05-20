using System;
using System.ComponentModel.DataAnnotations;

namespace QLDoAnFITUTEHY.DTOs.SinhVien
{
    public class SinhVienDTO
    {
        public string MaSV { get; set; }
        public string HoTen { get; set; }
        public string Email { get; set; }
        public string SoDienThoai { get; set; }
        public DateTime? NgaySinh { get; set; }
        public string MaLop { get; set; }
        public string TenLop { get; set; } 
    }

    public class SinhVienForCreationDTO
    {
        [Required(ErrorMessage = "Mã sinh viên là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã sinh viên không được vượt quá 10 ký tự.")]
        public string MaSV { get; set; }

        [Required(ErrorMessage = "Họ tên sinh viên là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Họ tên không được vượt quá 100 ký tự.")]
        public string HoTen { get; set; }

        [Required(ErrorMessage = "Email là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Email không được vượt quá 100 ký tự.")]
        [EmailAddress(ErrorMessage = "Định dạng email không hợp lệ.")]
        public string Email { get; set; }

        [MaxLength(20, ErrorMessage = "Số điện thoại không được vượt quá 20 ký tự.")]
        public string SoDienThoai { get; set; }

        public DateTime? NgaySinh { get; set; }

        [Required(ErrorMessage = "Mã lớp là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã lớp không được vượt quá 10 ký tự.")]
        public string MaLop { get; set; }
    }

    public class SinhVienForUpdateDTO
    {
        [Required(ErrorMessage = "Họ tên sinh viên là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Họ tên không được vượt quá 100 ký tự.")]
        public string HoTen { get; set; }

        [Required(ErrorMessage = "Email là bắt buộc.")]
        [MaxLength(100, ErrorMessage = "Email không được vượt quá 100 ký tự.")]
        [EmailAddress(ErrorMessage = "Định dạng email không hợp lệ.")]
        public string Email { get; set; }

        [MaxLength(20, ErrorMessage = "Số điện thoại không được vượt quá 20 ký tự.")]
        public string SoDienThoai { get; set; }

        public DateTime? NgaySinh { get; set; }

        [Required(ErrorMessage = "Mã lớp là bắt buộc.")]
        [MaxLength(10, ErrorMessage = "Mã lớp không được vượt quá 10 ký tự.")]
        public string MaLop { get; set; }
    }
}