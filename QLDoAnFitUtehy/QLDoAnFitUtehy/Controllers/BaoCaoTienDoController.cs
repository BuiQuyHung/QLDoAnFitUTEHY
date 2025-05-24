using Microsoft.AspNetCore.Mvc;
using QLDoAnFITUTEHY.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims; 
using QLDoAnFITUTEHY.DTOs.BaoCaoTienDo;
using QLDoAnFITUTEHY.Interfaces;
using QLDoAnFITUTEHY.Models;

namespace QLDoAnFITUTEHY.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize] 
    public class BaoCaoTienDoController : ControllerBase
    {
        private readonly IBaoCaoTienDoRepository _baoCaoRepo;
        private readonly ITaiKhoanRepository _taiKhoanRepo;
        private readonly ILogRepository _logRepo; 

        public BaoCaoTienDoController(
            IBaoCaoTienDoRepository baoCaoRepo,
            ITaiKhoanRepository taiKhoanRepo,
            ILogRepository logRepo)
        {
            _baoCaoRepo = baoCaoRepo;
            _taiKhoanRepo = taiKhoanRepo;
            _logRepo = logRepo;
        }

        // Helper để lấy MaSV hoặc MaGV từ Claims
        private string? GetMaSVFromClaims() => User.Claims.FirstOrDefault(c => c.Type == "MaSV")?.Value;
        private string? GetMaGVFromClaims() => User.Claims.FirstOrDefault(c => c.Type == "MaGV")?.Value;
        private bool IsAdmin() => User.IsInRole("Admin");

        // GET: api/BaoCaoTienDo
        // Admin: Xem tất cả
        // Giảng viên: Xem báo cáo của sinh viên mình hướng dẫn (hoặc có MaGV trong báo cáo)
        // Sinh viên: Xem báo cáo của chính mình
        [HttpGet]
        [Authorize(Roles = "Admin,GiangVien,SinhVien")] // Cả 3 vai trò đều có thể truy cập
        public async Task<ActionResult<IEnumerable<BaoCaoTienDoDto>>> GetAllBaoCaoTienDo()
        {
            var currentMaSV = GetMaSVFromClaims();
            var currentMaGV = GetMaGVFromClaims();

            IEnumerable<BaoCaoTienDo> baoCaos;

            if (IsAdmin())
            {
                baoCaos = await _baoCaoRepo.GetAllAsync();
            }
            else if (!string.IsNullOrEmpty(currentMaGV)) // Là Giảng viên
            {
                // Lấy các báo cáo mà GV này hướng dẫn hoặc có MaGV trong báo cáo
                baoCaos = await _baoCaoRepo.FindAsync(bc => bc.MaGV == currentMaGV);
                // Có thể cần join với DeTai để kiểm tra MaGV của DeTai nếu MaGV trong BaoCaoTienDo là MaGV nhận xét
            }
            else if (!string.IsNullOrEmpty(currentMaSV)) // Là Sinh viên
            {
                baoCaos = await _baoCaoRepo.GetReportsByStudentIdAsync(currentMaSV);
            }
            else
            {
                return Forbid("Bạn không có quyền xem báo cáo.");
            }

            var baoCaoDtos = new List<BaoCaoTienDoDto>();
            foreach (var bc in baoCaos)
            {
                baoCaoDtos.Add(new BaoCaoTienDoDto
                {
                    MaBaoCao = bc.MaBaoCao,
                    MaDeTai = bc.MaDeTai,
                    MaSV = bc.MaSV,
                    NgayNop = bc.NgayNop,
                    TuanBaoCao = bc.TuanBaoCao,
                    LoaiBaoCao = bc.LoaiBaoCao,
                    TepDinhKem = bc.TepDinhKem,
                    GhiChuCuaSV = bc.GhiChuCuaSV,
                    MaGV = bc.MaGV,
                    NgayNhanXet = bc.NgayNhanXet,
                    NhanXetCuaGV = bc.NhanXetCuaGV,
                    DiemSo = bc.DiemSo,
                    TrangThai = bc.TrangThai
                });
            }
            return Ok(baoCaoDtos);
        }

        // GET: api/BaoCaoTienDo/{id}
        // Admin: Xem bất kỳ
        // Giảng viên: Xem báo cáo của sinh viên mình hướng dẫn
        // Sinh viên: Xem báo cáo của chính mình
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,GiangVien,SinhVien")]
        public async Task<ActionResult<BaoCaoTienDoDto>> GetBaoCaoTienDoById(int id)
        {
            var baoCao = await _baoCaoRepo.GetByIdAsync(id);
            if (baoCao == null)
            {
                return NotFound($"Không tìm thấy báo cáo với mã: {id}");
            }

            var currentMaSV = GetMaSVFromClaims();
            var currentMaGV = GetMaGVFromClaims();

            // Kiểm tra quyền truy cập
            if (!IsAdmin())
            {
                if (!string.IsNullOrEmpty(currentMaSV) && baoCao.MaSV != currentMaSV)
                {
                    return Forbid("Bạn không có quyền xem báo cáo này.");
                }
                if (!string.IsNullOrEmpty(currentMaGV) && baoCao.MaGV != currentMaGV)
                {
                    // Giảng viên chỉ được xem báo cáo mà họ trực tiếp chấm hoặc hướng dẫn đề tài đó
                    // Logic phức tạp hơn có thể cần kiểm tra DeTai.MaGV
                    return Forbid("Bạn không có quyền xem báo cáo này.");
                }
            }

            var baoCaoDto = new BaoCaoTienDoDto
            {
                MaBaoCao = baoCao.MaBaoCao,
                MaDeTai = baoCao.MaDeTai,
                MaSV = baoCao.MaSV,
                NgayNop = baoCao.NgayNop,
                TuanBaoCao = baoCao.TuanBaoCao,
                LoaiBaoCao = baoCao.LoaiBaoCao,
                TepDinhKem = baoCao.TepDinhKem,
                GhiChuCuaSV = baoCao.GhiChuCuaSV,
                MaGV = baoCao.MaGV,
                NgayNhanXet = baoCao.NgayNhanXet,
                NhanXetCuaGV = baoCao.NhanXetCuaGV,
                DiemSo = baoCao.DiemSo,
                TrangThai = baoCao.TrangThai
            };
            return Ok(baoCaoDto);
        }

        // POST: api/BaoCaoTienDo
        // Chỉ Sinh viên mới được tạo báo cáo cho đề tài của chính mình
        [HttpPost]
        [Authorize(Roles = "SinhVien,Admin")] // Admin cũng có thể tạo hộ
        public async Task<ActionResult<BaoCaoTienDoDto>> CreateBaoCaoTienDo([FromBody] BaoCaoTienDoCreateDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var currentMaSV = GetMaSVFromClaims();
            if (string.IsNullOrEmpty(currentMaSV) && !IsAdmin())
            {
                return Forbid("Bạn không có quyền tạo báo cáo.");
            }

            // Lấy MaSV từ token nếu không phải Admin
            var maSVToUse = IsAdmin() ? createDto.MaDeTai : currentMaSV; // Giả định MaDeTai trong createDto có thể dùng để xác định SV nếu Admin tạo hộ
            // Cần kiểm tra MaDeTai có thuộc về MaSV này không (qua bảng PhanCong hoặc DeTai)
            // Để đơn giản, ở đây chỉ kiểm tra MaSV của người gửi request
            // Logic chặt chẽ hơn:
            // 1. Lấy đề tài theo createDto.MaDeTai
            // 2. Kiểm tra xem đề tài đó có MaSV trùng với currentMaSV không
            // 3. Nếu không, báo lỗi.

            // Tạo đối tượng BaoCaoTienDo
            var baoCao = new BaoCaoTienDo
            {
                MaDeTai = createDto.MaDeTai,
                MaSV = maSVToUse, // Gán MaSV từ token hoặc từ DTO (nếu Admin tạo hộ)
                NgayNop = DateTime.Now,
                TuanBaoCao = createDto.TuanBaoCao,
                LoaiBaoCao = createDto.LoaiBaoCao,
                TepDinhKem = createDto.TepDinhKem,
                GhiChuCuaSV = createDto.GhiChuCuaSV,
                TrangThai = "Mới tạo" // Trạng thái mặc định
            };

            await _baoCaoRepo.AddAsync(baoCao);
            if (!await _baoCaoRepo.SaveChangesAsync())
            {
                return StatusCode(500, "Lỗi khi tạo báo cáo tiến độ.");
            }

            // Ghi Log
            var tenDangNhap = User.Identity?.Name ?? "Hệ thống/Ẩn danh";
            await _logRepo.AddAsync(new Log
            {
                TenDangNhap = tenDangNhap,
                HanhDong = "Tạo báo cáo tiến độ",
                BangBiThayDoi = "BaoCaoTienDo",
                MoTaChiTiet = $"Người dùng '{tenDangNhap}' đã tạo báo cáo cho đề tài '{baoCao.MaDeTai}', tuần {baoCao.TuanBaoCao}."
            });
            await _logRepo.SaveChangesAsync();

            var baoCaoDto = new BaoCaoTienDoDto
            {
                MaBaoCao = baoCao.MaBaoCao,
                MaDeTai = baoCao.MaDeTai,
                MaSV = baoCao.MaSV,
                NgayNop = baoCao.NgayNop,
                TuanBaoCao = baoCao.TuanBaoCao,
                LoaiBaoCao = baoCao.LoaiBaoCao,
                TepDinhKem = baoCao.TepDinhKem,
                GhiChuCuaSV = baoCao.GhiChuCuaSV,
                MaGV = baoCao.MaGV,
                NgayNhanXet = baoCao.NgayNhanXet,
                NhanXetCuaGV = baoCao.NhanXetCuaGV,
                DiemSo = baoCao.DiemSo,
                TrangThai = baoCao.TrangThai
            };
            return CreatedAtAction(nameof(GetBaoCaoTienDoById), new { id = baoCaoDto.MaBaoCao }, baoCaoDto);
        }

        // PUT: api/BaoCaoTienDo/{id} (Cập nhật thông tin báo cáo)
        // Sinh viên: Cập nhật báo cáo của chính mình (trừ trường nhận xét/điểm)
        // Giảng viên: Cập nhật nhận xét, điểm số, trạng thái cho báo cáo của SV mình hướng dẫn
        // Admin: Cập nhật tất cả
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,GiangVien,SinhVien")]
        public async Task<IActionResult> UpdateBaoCaoTienDo(int id, [FromBody] BaoCaoTienDoUpdateDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var baoCao = await _baoCaoRepo.GetByIdAsync(id);
            if (baoCao == null)
            {
                return NotFound($"Không tìm thấy báo cáo với mã: {id}");
            }

            var currentMaSV = GetMaSVFromClaims();
            var currentMaGV = GetMaGVFromClaims();
            var tenDangNhap = User.Identity?.Name ?? "Hệ thống/Ẩn danh";

            // Lưu trạng thái cũ để ghi log
            var oldTuanBaoCao = baoCao.TuanBaoCao;
            var oldLoaiBaoCao = baoCao.LoaiBaoCao;
            var oldTepDinhKem = baoCao.TepDinhKem;
            var oldGhiChuCuaSV = baoCao.GhiChuCuaSV;
            var oldNgayNhanXet = baoCao.NgayNhanXet;
            var oldNhanXetCuaGV = baoCao.NhanXetCuaGV;
            var oldDiemSo = baoCao.DiemSo;
            var oldTrangThai = baoCao.TrangThai;

            // Phân quyền cập nhật
            if (IsAdmin())
            {
                // Admin có quyền cập nhật tất cả các trường
                baoCao.TuanBaoCao = updateDto.TuanBaoCao;
                baoCao.LoaiBaoCao = updateDto.LoaiBaoCao;
                baoCao.TepDinhKem = updateDto.TepDinhKem;
                baoCao.GhiChuCuaSV = updateDto.GhiChuCuaSV;
                // Admin cũng có thể cập nhật các trường của GV nếu cần (sẽ cần DTO riêng hoặc logic phức tạp hơn)
            }
            else if (!string.IsNullOrEmpty(currentMaSV) && baoCao.MaSV == currentMaSV) // Là Sinh viên và là chủ báo cáo
            {
                // Sinh viên chỉ được cập nhật các trường của mình
                baoCao.TuanBaoCao = updateDto.TuanBaoCao;
                baoCao.LoaiBaoCao = updateDto.LoaiBaoCao;
                baoCao.TepDinhKem = updateDto.TepDinhKem;
                baoCao.GhiChuCuaSV = updateDto.GhiChuCuaSV;

                // Ngăn SV cập nhật các trường của GV
                if (updateDto is BaoCaoTienDoReviewDto) // Nếu cố tình gửi DTO của GV
                {
                    return Forbid("Sinh viên không được phép cập nhật các trường nhận xét/điểm.");
                }
            }
            else if (!string.IsNullOrEmpty(currentMaGV) && baoCao.MaGV == currentMaGV) // Là Giảng viên và là người nhận xét
            {
                // Giảng viên chỉ được cập nhật các trường nhận xét/điểm
                // Cần một DTO riêng cho việc nhận xét
                return Forbid("Giảng viên không thể cập nhật thông tin báo cáo của sinh viên bằng API này. Vui lòng sử dụng API nhận xét.");
            }
            else
            {
                return Forbid("Bạn không có quyền cập nhật báo cáo này.");
            }

            _baoCaoRepo.Update(baoCao);
            if (!await _baoCaoRepo.SaveChangesAsync())
            {
                return StatusCode(500, "Lỗi khi cập nhật báo cáo tiến độ.");
            }

            // Ghi Log chi tiết sự thay đổi
            var chiTietThayDoi = new List<string>();
            if (oldTuanBaoCao != baoCao.TuanBaoCao) chiTietThayDoi.Add($"Tuần báo cáo từ '{oldTuanBaoCao}' thành '{baoCao.TuanBaoCao}'");
            if (oldLoaiBaoCao != baoCao.LoaiBaoCao) chiTietThayDoi.Add($"Loại báo cáo từ '{oldLoaiBaoCao}' thành '{baoCao.LoaiBaoCao}'");
            if (oldTepDinhKem != baoCao.TepDinhKem) chiTietThayDoi.Add($"Tệp đính kèm từ '{oldTepDinhKem}' thành '{baoCao.TepDinhKem}'");
            if (oldGhiChuCuaSV != baoCao.GhiChuCuaSV) chiTietThayDoi.Add($"Ghi chú SV từ '{oldGhiChuCuaSV}' thành '{baoCao.GhiChuCuaSV}'");
            // Không log các trường của GV ở đây vì đây là API cập nhật của SV/Admin

            if (chiTietThayDoi.Any())
            {
                await _logRepo.AddAsync(new Log
                {
                    TenDangNhap = tenDangNhap,
                    HanhDong = "Cập nhật báo cáo tiến độ",
                    BangBiThayDoi = "BaoCaoTienDo",
                    MoTaChiTiet = $"Người dùng '{tenDangNhap}' đã cập nhật báo cáo '{id}': {string.Join(", ", chiTietThayDoi)}"
                });
                await _logRepo.SaveChangesAsync();
            }

            return NoContent();
        }

        // PUT: api/BaoCaoTienDo/review/{id} (Giảng viên nhận xét/chấm điểm)
        // Chỉ Giảng viên hoặc Admin mới được nhận xét/chấm điểm
        [HttpPut("review/{id}")]
        [Authorize(Roles = "GiangVien,Admin")]
        public async Task<IActionResult> ReviewBaoCaoTienDo(int id, [FromBody] BaoCaoTienDoReviewDto reviewDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var baoCao = await _baoCaoRepo.GetByIdAsync(id);
            if (baoCao == null)
            {
                return NotFound($"Không tìm thấy báo cáo với mã: {id}");
            }

            var currentMaGV = GetMaGVFromClaims();
            var tenDangNhap = User.Identity?.Name ?? "Hệ thống/Ẩn danh";

            // Kiểm tra quyền Giảng viên: chỉ được nhận xét báo cáo mà họ hướng dẫn đề tài hoặc đã được chỉ định MaGV
            if (!IsAdmin() && (string.IsNullOrEmpty(currentMaGV) || baoCao.MaGV != currentMaGV))
            {
                // Logic phức tạp hơn có thể cần kiểm tra mối quan hệ giữa GV và DeTai của báo cáo
                return Forbid("Bạn không có quyền nhận xét báo cáo này.");
            }

            // Lưu trạng thái cũ để ghi log
            var oldNgayNhanXet = baoCao.NgayNhanXet;
            var oldNhanXetCuaGV = baoCao.NhanXetCuaGV;
            var oldDiemSo = baoCao.DiemSo;
            var oldTrangThai = baoCao.TrangThai;

            // Cập nhật các trường nhận xét/điểm
            baoCao.NgayNhanXet = reviewDto.NgayNhanXet ?? DateTime.Now;
            baoCao.NhanXetCuaGV = reviewDto.NhanXetCuaGV;
            baoCao.DiemSo = reviewDto.DiemSo;
            baoCao.TrangThai = reviewDto.TrangThai;
            baoCao.MaGV = currentMaGV; // Gán MaGV của người chấm

            _baoCaoRepo.Update(baoCao);
            if (!await _baoCaoRepo.SaveChangesAsync())
            {
                return StatusCode(500, "Lỗi khi nhận xét báo cáo tiến độ.");
            }

            // Ghi Log chi tiết sự thay đổi
            var chiTietThayDoi = new List<string>();
            if (oldNgayNhanXet != baoCao.NgayNhanXet) chiTietThayDoi.Add($"Ngày nhận xét từ '{oldNgayNhanXet}' thành '{baoCao.NgayNhanXet}'");
            if (oldNhanXetCuaGV != baoCao.NhanXetCuaGV) chiTietThayDoi.Add($"Nhận xét GV từ '{oldNhanXetCuaGV}' thành '{baoCao.NhanXetCuaGV}'");
            if (oldDiemSo != baoCao.DiemSo) chiTietThayDoi.Add($"Điểm số từ '{oldDiemSo}' thành '{baoCao.DiemSo}'");
            if (oldTrangThai != baoCao.TrangThai) chiTietThayDoi.Add($"Trạng thái từ '{oldTrangThai}' thành '{baoCao.TrangThai}'");

            if (chiTietThayDoi.Any())
            {
                await _logRepo.AddAsync(new Log
                {
                    TenDangNhap = tenDangNhap,
                    HanhDong = "Nhận xét báo cáo tiến độ",
                    BangBiThayDoi = "BaoCaoTienDo",
                    MoTaChiTiet = $"Người dùng '{tenDangNhap}' đã nhận xét báo cáo '{id}': {string.Join(", ", chiTietThayDoi)}"
                });
                await _logRepo.SaveChangesAsync();
            }

            return NoContent();
        }


        // DELETE: api/BaoCaoTienDo/{id}
        // Sinh viên: Xóa báo cáo của chính mình (nếu chưa được duyệt/chấm)
        // Admin: Xóa bất kỳ báo cáo nào
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,SinhVien")]
        public async Task<IActionResult> DeleteBaoCaoTienDo(int id)
        {
            var baoCao = await _baoCaoRepo.GetByIdAsync(id);
            if (baoCao == null)
            {
                return NotFound($"Không tìm thấy báo cáo với mã: {id}");
            }

            var currentMaSV = GetMaSVFromClaims();
            var tenDangNhap = User.Identity?.Name ?? "Hệ thống/Ẩn danh";

            // Kiểm tra quyền xóa
            if (!IsAdmin())
            {
                // Chỉ sinh viên là chủ báo cáo mới có thể xóa
                if (string.IsNullOrEmpty(currentMaSV) || baoCao.MaSV != currentMaSV)
                {
                    return Forbid("Bạn không có quyền xóa báo cáo này.");
                }
                // Có thể thêm điều kiện: không cho xóa nếu trạng thái đã là "Đã duyệt" hoặc "Đã chấm điểm"
                if (baoCao.TrangThai == "Đã duyệt" || baoCao.TrangThai == "Đã chấm điểm")
                {
                    return BadRequest("Không thể xóa báo cáo đã được duyệt hoặc chấm điểm.");
                }
            }

            _baoCaoRepo.Delete(baoCao);
            if (!await _baoCaoRepo.SaveChangesAsync())
            {
                return StatusCode(500, "Lỗi khi xóa báo cáo tiến độ.");
            }

            // Ghi Log
            await _logRepo.AddAsync(new Log
            {
                TenDangNhap = tenDangNhap,
                HanhDong = "Xóa báo cáo tiến độ",
                BangBiThayDoi = "BaoCaoTienDo",
                MoTaChiTiet = $"Người dùng '{tenDangNhap}' đã xóa báo cáo '{id}' của đề tài '{baoCao.MaDeTai}'."
            });
            await _logRepo.SaveChangesAsync();

            return NoContent();
        }
    }
}