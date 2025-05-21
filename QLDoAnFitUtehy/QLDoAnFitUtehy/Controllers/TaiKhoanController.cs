using Microsoft.AspNetCore.Mvc;
using QLDoAnFITUTEHY.DTOs.TaiKhoan;
using QLDoAnFITUTEHY.Interfaces;
using QLDoAnFITUTEHY.Models;

namespace QLDoAnFITUTEHY.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaiKhoanController : ControllerBase
    {
        private readonly ITaiKhoanRepository _taiKhoanRepository;

        public TaiKhoanController(ITaiKhoanRepository taiKhoanRepository)
        {
            _taiKhoanRepository = taiKhoanRepository;
        }

        // GET: api/TaiKhoan
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaiKhoanDto>>> GetTaiKhoans()
        {
            var taiKhoans = await _taiKhoanRepository.GetAllAsync();
            var taiKhoanDtos = new List<TaiKhoanDto>();

            // Ánh xạ thủ công từ Model sang DTO
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

        // GET: api/TaiKhoan/{username}
        [HttpGet("{username}")]
        public async Task<ActionResult<TaiKhoanDto>> GetTaiKhoan(string username)
        {
            var taiKhoan = await _taiKhoanRepository.GetTaiKhoanByUsernameAsync(username);

            if (taiKhoan == null)
            {
                return NotFound($"Không tìm thấy tài khoản với tên đăng nhập: {username}");
            }

            // Ánh xạ thủ công từ Model sang DTO
            var taiKhoanDto = new TaiKhoanDto
            {
                TenDangNhap = taiKhoan.TenDangNhap,
                VaiTro = taiKhoan.VaiTro,
                MaGV = taiKhoan.MaGV,
                MaSV = taiKhoan.MaSV
            };
            return Ok(taiKhoanDto);
        }

        // POST: api/TaiKhoan
        [HttpPost]
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

            // Ánh xạ thủ công từ Create DTO sang Model
            var taiKhoan = new TaiKhoan
            {
                TenDangNhap = taiKhoanCreateDto.TenDangNhap,
                MatKhau = taiKhoanCreateDto.MatKhau, // **Lưu ý quan trọng: Trong thực tế, bạn PHẢI mã hóa mật khẩu ở đây.**
                VaiTro = taiKhoanCreateDto.VaiTro,
                MaGV = taiKhoanCreateDto.MaGV,
                MaSV = taiKhoanCreateDto.MaSV
            };

            await _taiKhoanRepository.AddAsync(taiKhoan);
            if (!await _taiKhoanRepository.SaveChangesAsync())
            {
                return StatusCode(500, "Lỗi khi tạo tài khoản mới.");
            }

            // Ánh xạ thủ công từ Model đã tạo sang DTO để trả về
            var taiKhoanDto = new TaiKhoanDto
            {
                TenDangNhap = taiKhoan.TenDangNhap,
                VaiTro = taiKhoan.VaiTro,
                MaGV = taiKhoan.MaGV,
                MaSV = taiKhoan.MaSV
            };
            return CreatedAtAction(nameof(GetTaiKhoan), new { username = taiKhoanDto.TenDangNhap }, taiKhoanDto);
        }

        // PUT: api/TaiKhoan/{username}
        [HttpPut("{username}")]
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

            // Ánh xạ thủ công từ Update DTO vào Model hiện có
            if (!string.IsNullOrEmpty(taiKhoanUpdateDto.MatKhau))
            {
                taiKhoan.MatKhau = taiKhoanUpdateDto.MatKhau; // **Lưu ý: Trong thực tế, bạn PHẢI mã hóa mật khẩu ở đây.**
            }
            taiKhoan.VaiTro = taiKhoanUpdateDto.VaiTro;
            taiKhoan.MaGV = taiKhoanUpdateDto.MaGV;
            taiKhoan.MaSV = taiKhoanUpdateDto.MaSV;

            _taiKhoanRepository.Update(taiKhoan);
            if (!await _taiKhoanRepository.SaveChangesAsync())
            {
                return StatusCode(500, "Lỗi khi cập nhật tài khoản.");
            }

            return NoContent(); // 204 No Content
        }

        // DELETE: api/TaiKhoan/{username}
        [HttpDelete("{username}")]
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

            return NoContent(); // 204 No Content
        }

        // --- Endpoint Đăng nhập ---
        [HttpPost("login")] // Đường dẫn API sẽ là /api/TaiKhoan/login
        public async Task<ActionResult<TaiKhoanDto>> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var taiKhoan = await _taiKhoanRepository.LoginAsync(loginDto.TenDangNhap, loginDto.MatKhau);

            if (taiKhoan == null)
            {
                return Unauthorized("Tên đăng nhập hoặc mật khẩu không chính xác."); // 401 Unauthorized
            }

            // Đăng nhập thành công, trả về thông tin tài khoản (trừ mật khẩu)
            // và quan trọng là trả về VaiTro để client biết quyền hạn
            var taiKhoanDto = new TaiKhoanDto
            {
                TenDangNhap = taiKhoan.TenDangNhap,
                VaiTro = taiKhoan.VaiTro, // Lấy vai trò để phân quyền
                MaGV = taiKhoan.MaGV,
                MaSV = taiKhoan.MaSV
            };

            // Trong ứng dụng thực tế, tại đây bạn sẽ tạo và trả về một JWT
            // Ví dụ: return Ok(new { Token = "your_jwt_token", User = taiKhoanDto });

            return Ok(taiKhoanDto); // Trả về DTO thông tin tài khoản bao gồm vai trò
        }
    }
}
