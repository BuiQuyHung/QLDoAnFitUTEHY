using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using QLDoAnFITUTEHY.DTOs.TaiKhoan; 
using QLDoAnFITUTEHY.Interfaces;  
using QLDoAnFITUTEHY.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Authorization;
using QLDoAnFITUTEHY.Repository; 

namespace QLDoAnFITUTEHY.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaiKhoanController : ControllerBase
    {
        private readonly ITaiKhoanRepository _taiKhoanRepository;
        private readonly ILogRepository _logRepository;         
        private readonly IConfiguration _configuration;          

        public TaiKhoanController(ITaiKhoanRepository taiKhoanRepository, ILogRepository logRepository, IConfiguration configuration)
        {
            _taiKhoanRepository = taiKhoanRepository;
            _logRepository = logRepository;            
            _configuration = configuration;            
        }

        [AllowAnonymous]
        // GET: api/TaiKhoan
        [HttpGet]
        //[Authorize(Roles = "Admin")] 
        public async Task<ActionResult<IEnumerable<TaiKhoanDto>>> GetTaiKhoans()
        {
            var taiKhoans = await _taiKhoanRepository.GetAllAsync();
            var taiKhoanDtos = new List<TaiKhoanDto>();

            foreach (var tk in taiKhoans)
            {
                taiKhoanDtos.Add(new TaiKhoanDto
                {
                    TenDangNhap = tk.TenDangNhap,
                    VaiTro = tk.VaiTro,
                    MaGV = tk.MaGV,
                    MaSV = tk.MaSV
                });
            }
            return Ok(taiKhoanDtos);
        }

        [AllowAnonymous]
        [HttpGet("{username}")]
        //[Authorize] 
        public async Task<ActionResult<TaiKhoanDto>> GetTaiKhoan(string username)
        {
            if (User.Identity?.Name != username && !User.IsInRole("Admin"))
            {
                return Forbid(); 
            }

            var taiKhoan = await _taiKhoanRepository.GetTaiKhoanByUsernameAsync(username);

            if (taiKhoan == null)
            {
                return NotFound($"Không tìm thấy tài khoản với tên đăng nhập: {username}");
            }

            var taiKhoanDto = new TaiKhoanDto
            {
                TenDangNhap = taiKhoan.TenDangNhap,
                VaiTro = taiKhoan.VaiTro,
                MaGV = taiKhoan.MaGV,
                MaSV = taiKhoan.MaSV
            };
            return Ok(taiKhoanDto);
        }

        [AllowAnonymous]
        [HttpPost]
        //[Authorize(Roles = "Admin")] 
        public async Task<ActionResult<TaiKhoanDto>> CreateTaiKhoan([FromBody] TaiKhoanCreateDto taiKhoanCreateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (await _taiKhoanRepository.IsUsernameExistAsync(taiKhoanCreateDto.TenDangNhap))
            {
                return Conflict($"Tên đăng nhập '{taiKhoanCreateDto.TenDangNhap}' đã tồn tại.");
            }

            var taiKhoan = new TaiKhoan
            {
                TenDangNhap = taiKhoanCreateDto.TenDangNhap,
                MatKhau = taiKhoanCreateDto.MatKhau,
                VaiTro = taiKhoanCreateDto.VaiTro,
                MaGV = taiKhoanCreateDto.MaGV,
                MaSV = taiKhoanCreateDto.MaSV
            };

            await _taiKhoanRepository.AddAsync(taiKhoan);
            if (!await _taiKhoanRepository.SaveChangesAsync())
            {
                return StatusCode(500, "Lỗi khi tạo tài khoản mới.");
            }

            var tenDangNhapHienTai = User.Identity?.Name ?? "Hệ thống/Ẩn danh"; 
            var logEntry = new Log
            {
                TenDangNhap = tenDangNhapHienTai,
                HanhDong = "Tạo tài khoản",
                BangBiThayDoi = "TaiKhoan",
                MoTaChiTiet = $"Đã tạo tài khoản mới: {taiKhoan.TenDangNhap} với vai trò: {taiKhoan.VaiTro}"
            };
            await _logRepository.AddAsync(logEntry);
            await _logRepository.SaveChangesAsync();

            var taiKhoanDto = new TaiKhoanDto
            {
                TenDangNhap = taiKhoan.TenDangNhap,
                VaiTro = taiKhoan.VaiTro,
                MaGV = taiKhoan.MaGV,
                MaSV = taiKhoan.MaSV
            };
            return CreatedAtAction(nameof(GetTaiKhoan), new { username = taiKhoanDto.TenDangNhap }, taiKhoanDto);
        }

        [AllowAnonymous]
        [HttpPut("{username}")]
        //[Authorize] 
        public async Task<IActionResult> UpdateTaiKhoan(string username, [FromBody] TaiKhoanUpdateDto taiKhoanUpdateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var taiKhoan = await _taiKhoanRepository.GetTaiKhoanByUsernameAsync(username);

            if (taiKhoan == null)
            {
                return NotFound($"Không tìm thấy tài khoản với tên đăng nhập: {username}");
            }

            //if (User.Identity?.Name != username && !User.IsInRole("Admin"))
            //{
            //    return Forbid();
            //}

            var oldVaiTro = taiKhoan.VaiTro; 

            if (!string.IsNullOrEmpty(taiKhoanUpdateDto.MatKhau))
            {
                taiKhoan.MatKhau = taiKhoanUpdateDto.MatKhau;
            }
            taiKhoan.VaiTro = taiKhoanUpdateDto.VaiTro;
            taiKhoan.MaGV = taiKhoanUpdateDto.MaGV;
            taiKhoan.MaSV = taiKhoanUpdateDto.MaSV;

            _taiKhoanRepository.Update(taiKhoan);
            if (!await _taiKhoanRepository.SaveChangesAsync())
            {
                return StatusCode(500, "Lỗi khi cập nhật tài khoản.");
            }

            var tenDangNhapHienTai = User.Identity?.Name ?? "Hệ thống/Ẩn danh";
            var chiTietThayDoi = new List<string>();
            if (oldVaiTro != taiKhoan.VaiTro)
                chiTietThayDoi.Add($"Vai trò từ '{oldVaiTro}' thành '{taiKhoan.VaiTro}'");

            if (chiTietThayDoi.Any())
            {
                var logEntry = new Log
                {
                    TenDangNhap = tenDangNhapHienTai,
                    HanhDong = "Cập nhật tài khoản",
                    BangBiThayDoi = "TaiKhoan",
                    MoTaChiTiet = $"Đã cập nhật tài khoản '{username}': {string.Join(", ", chiTietThayDoi)}"
                };
                await _logRepository.AddAsync(logEntry);
                await _logRepository.SaveChangesAsync();
            }

            return NoContent(); 
        }

        [AllowAnonymous]
        [HttpDelete("{username}")]
        //[Authorize(Roles = "Admin")] 
        public async Task<IActionResult> DeleteTaiKhoan(string username)
        {
            var taiKhoan = await _taiKhoanRepository.GetTaiKhoanByUsernameAsync(username);
            if (taiKhoan == null)
            {
                return NotFound($"Không tìm thấy tài khoản với tên đăng nhập: {username}");
            }

            _taiKhoanRepository.Delete(taiKhoan);
            if (!await _taiKhoanRepository.SaveChangesAsync())
            {
                return StatusCode(500, "Lỗi khi xóa tài khoản.");
            }

            var tenDangNhapHienTai = User.Identity?.Name ?? "Hệ thống/Ẩn danh";
            var logEntry = new Log
            {
                TenDangNhap = tenDangNhapHienTai,
                HanhDong = "Xóa tài khoản",
                BangBiThayDoi = "TaiKhoan",
                MoTaChiTiet = $"Đã xóa tài khoản: {username}"
            };
            await _logRepository.AddAsync(logEntry);
            await _logRepository.SaveChangesAsync();

            return NoContent(); 
        }

        [AllowAnonymous] 
        [HttpPost("login")]
        public async Task<ActionResult<LoginResponseDto>> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var taiKhoan = await _taiKhoanRepository.LoginAsync(loginDto.TenDangNhap, loginDto.MatKhau);

            if (taiKhoan == null)
            {
                return Unauthorized("Tên đăng nhập hoặc mật khẩu không chính xác.");
            }

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, taiKhoan.TenDangNhap),
                new Claim(ClaimTypes.Role, taiKhoan.VaiTro),
            };

            if (!string.IsNullOrEmpty(taiKhoan.MaGV))
            {
                claims.Add(new Claim("MaGV", taiKhoan.MaGV)); 
            }
            if (!string.IsNullOrEmpty(taiKhoan.MaSV))
            {
                claims.Add(new Claim("MaSV", taiKhoan.MaSV)); 
            }

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],         
                audience: _configuration["Jwt:Audience"],     
                claims: claims,                              
                expires: DateTime.Now.AddMinutes(double.Parse(_configuration["Jwt:DurationInMinutes"])), 
                signingCredentials: credentials);            

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            var logEntry = new Log
            {
                TenDangNhap = taiKhoan.TenDangNhap,
                HanhDong = "Đăng nhập",
                BangBiThayDoi = "TaiKhoan",
                MoTaChiTiet = $"Người dùng '{taiKhoan.TenDangNhap}' đã đăng nhập thành công với vai trò '{taiKhoan.VaiTro}'."
            };
            await _logRepository.AddAsync(logEntry);
            await _logRepository.SaveChangesAsync();

            var loginResponse = new LoginResponseDto
            {
                Token = tokenString,
                TenDangNhap = taiKhoan.TenDangNhap,
                VaiTro = taiKhoan.VaiTro,
                MaGV = taiKhoan.MaGV,
                MaSV = taiKhoan.MaSV
            };

            return Ok(loginResponse);
        }

    }
}