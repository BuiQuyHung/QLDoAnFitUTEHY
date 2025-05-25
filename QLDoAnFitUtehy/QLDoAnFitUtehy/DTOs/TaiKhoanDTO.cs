using System.ComponentModel.DataAnnotations;

namespace QLDoAnFITUTEHY.DTOs.TaiKhoan
{

    public class TaiKhoanDto
    {
        public string TenDangNhap { get; set; }
        public string VaiTro { get; set; }
        public string? MaGV { get; set; }
        public string? MaSV { get; set; }
    }

    public class TaiKhoanCreateDto
    {
        [Required(ErrorMessage = "Tên đăng nhập là bắt buộc.")]
        [StringLength(50, ErrorMessage = "Tên đăng nhập không được vượt quá 50 ký tự.")]
        public string TenDangNhap { get; set; }

        [Required(ErrorMessage = "Mật khẩu là bắt buộc.")]
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự và không vượt quá 100 ký tự.")]
        public string MatKhau { get; set; }

        [Required(ErrorMessage = "Vai trò là bắt buộc.")]
        [StringLength(20, ErrorMessage = "Vai trò không được vượt quá 20 ký tự.")]
        public string VaiTro { get; set; }

        public string? MaGV { get; set; }
        public string? MaSV { get; set; }
    }

    public class TaiKhoanUpdateDto
    {
        [StringLength(100, MinimumLength = 6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự và không vượt quá 100 ký tự.")]
        public string? MatKhau { get; set; }

        [Required(ErrorMessage = "Vai trò là bắt buộc.")]
        [StringLength(20, ErrorMessage = "Vai trò không được vượt quá 20 ký tự.")]
        public string VaiTro { get; set; }

        public string? MaGV { get; set; }
        public string? MaSV { get; set; }
    }

    public class LoginDto
    {
        [Required(ErrorMessage = "Tên đăng nhập là bắt buộc.")]
        [StringLength(50, ErrorMessage = "Tên đăng nhập không được vượt quá 50 ký tự.")]
        public string TenDangNhap { get; set; }

        [Required(ErrorMessage = "Mật khẩu là bắt buộc.")]
        [StringLength(100, ErrorMessage = "Mật khẩu không được vượt quá 100 ký tự.")]
        public string MatKhau { get; set; }
    }

    public class LoginResponseDto
    {
        public string Token { get; set; } 
        public string TenDangNhap { get; set; }
        public string VaiTro { get; set; }
        public string? MaGV { get; set; }
        public string? MaSV { get; set; }
    }
}