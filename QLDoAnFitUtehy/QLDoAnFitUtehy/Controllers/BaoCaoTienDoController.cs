// Controllers/BaoCaoTienDoController.cs
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore; // Để sử dụng DbUpdateConcurrencyException
using QLDoAnFITUTEHY.Models;
using QLDoAnFITUTEHY.DTOs;
using QLDoAnFITUTEHY.Interfaces;
using Microsoft.Extensions.Hosting.Internal;

namespace QLDoAnFITUTEHY.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaoCaoTienDoController : ControllerBase
    {
        private readonly IBaoCaoTienDoRepository _repository;
        private readonly IWebHostEnvironment _hostingEnvironment;

        public BaoCaoTienDoController(IBaoCaoTienDoRepository repository, IWebHostEnvironment hostingEnvironment)
        {
            _repository = repository;
            _hostingEnvironment = hostingEnvironment;
        }

        // Helper method to map from BaoCaoTienDo Model to BaoCaoTienDoDto
        private BaoCaoTienDoDto MapToBaoCaoTienDoDto(BaoCaoTienDo baoCao)
        {
            if (baoCao == null) return null;

            return new BaoCaoTienDoDto
            {
                MaBaoCao = baoCao.MaBaoCao,
                MaDeTai = baoCao.MaDeTai,
                TenDeTai = baoCao.DeTai?.TenDeTai, // Sử dụng ?. để tránh lỗi null nếu DeTai không được include
                MaSV = baoCao.MaSV,
                TenSV = baoCao.SinhVien?.HoTen,
                NgayNop = baoCao.NgayNop,
                TuanBaoCao = baoCao.TuanBaoCao,
                LoaiBaoCao = baoCao.LoaiBaoCao,
                TepDinhKem = baoCao.TepDinhKem,
                GhiChuCuaSV = baoCao.GhiChuCuaSV,
                MaGV = baoCao.MaGV,
                TenGV = baoCao.GiangVien?.HoTen,
                NgayNhanXet = baoCao.NgayNhanXet,
                NhanXetCuaGV = baoCao.NhanXetCuaGV,
                DiemSo = baoCao.DiemSo,
                TrangThai = baoCao.TrangThai
            };
        }

        // Helper method to map from BaoCaoTienDoCreateDto to BaoCaoTienDo Model
        private BaoCaoTienDo MapToBaoCaoTienDo(BaoCaoTienDoCreateDto createDto)
        {
            if (createDto == null) return null;

            return new BaoCaoTienDo
            {
                MaDeTai = createDto.MaDeTai,
                MaSV = createDto.MaSV,
                TuanBaoCao = createDto.TuanBaoCao,
                LoaiBaoCao = createDto.LoaiBaoCao,
                TepDinhKem = createDto.TepDinhKem,
                GhiChuCuaSV = createDto.GhiChuCuaSV,
                NgayNop = DateTime.Now, // Set default value
                TrangThai = "Chờ chấm" // Set default value
            };
        }

        // Helper method to update BaoCaoTienDo Model from BaoCaoTienDoUpdateDto
        private void UpdateBaoCaoTienDoFromDto(BaoCaoTienDo model, BaoCaoTienDoUpdateDto updateDto)
        {
            if (model == null || updateDto == null) return;

            model.MaGV = updateDto.MaGV ?? model.MaGV; // Chỉ cập nhật nếu DTO có giá trị
            model.NhanXetCuaGV = updateDto.NhanXetCuaGV ?? model.NhanXetCuaGV;
            model.DiemSo = updateDto.DiemSo ?? model.DiemSo;
            model.TrangThai = updateDto.TrangThai ?? model.TrangThai;
            model.NgayNhanXet = DateTime.Now; // Cập nhật thời gian nhận xét
        }

        // GET: api/BaoCaoTienDo
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BaoCaoTienDoDto>>> GetAllBaoCaoTienDos()
        {
            var baoCaos = await _repository.GetAllBaoCaoTienDosAsync();
            var baoCaoDtos = new List<BaoCaoTienDoDto>();
            foreach (var baoCao in baoCaos)
            {
                baoCaoDtos.Add(MapToBaoCaoTienDoDto(baoCao));
            }
            return Ok(baoCaoDtos);
        }

        // GET: api/BaoCaoTienDo/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<BaoCaoTienDoDto>> GetBaoCaoTienDo(int id)
        {
            var baoCao = await _repository.GetBaoCaoTienDoByIdAsync(id);

            if (baoCao == null)
            {
                return NotFound();
            }

            return Ok(MapToBaoCaoTienDoDto(baoCao));
        }

        // GET: api/BaoCaoTienDo/sinhvien/{maSV}/detai/{maDeTai}
        [HttpGet("sinhvien/{maSV}/detai/{maDeTai}")]
        public async Task<ActionResult<IEnumerable<BaoCaoTienDoDto>>> GetBaoCaoBySinhVienAndDeTai(string maSV, string maDeTai)
        {
            var baoCaos = await _repository.GetBaoCaoBySinhVienAndDeTaiAsync(maSV, maDeTai);
            var baoCaoDtos = new List<BaoCaoTienDoDto>();
            foreach (var baoCao in baoCaos)
            {
                baoCaoDtos.Add(MapToBaoCaoTienDoDto(baoCao));
            }
            return Ok(baoCaoDtos);
        }

        // GET: api/BaoCaoTienDo/giangvien/{maGV}
        [HttpGet("giangvien/{maGV}")]
        public async Task<ActionResult<IEnumerable<BaoCaoTienDoDto>>> GetBaoCaoByGiangVien(string maGV)
        {
            var baoCaos = await _repository.GetBaoCaoByGiangVienAsync(maGV);
            var baoCaoDtos = new List<BaoCaoTienDoDto>();
            foreach (var baoCao in baoCaos)
            {
                baoCaoDtos.Add(MapToBaoCaoTienDoDto(baoCao));
            }
            return Ok(baoCaoDtos);
        }

        // POST: api/BaoCaoTienDo
        [HttpPost]
        public async Task<ActionResult<BaoCaoTienDoDto>> PostBaoCaoTienDo(BaoCaoTienDoCreateDto baoCaoCreateDto)
        {
            var baoCao = MapToBaoCaoTienDo(baoCaoCreateDto);

            await _repository.AddBaoCaoTienDoAsync(baoCao);

            // Fetch the newly created item to ensure navigation properties are loaded
            // This is important for MapToBaoCaoTienDoDto to populate TenDeTai, TenSV etc.
            var createdBaoCao = await _repository.GetBaoCaoTienDoByIdAsync(baoCao.MaBaoCao);

            return CreatedAtAction(nameof(GetBaoCaoTienDo), new { id = createdBaoCao.MaBaoCao }, MapToBaoCaoTienDoDto(createdBaoCao));
        }

        // POST: api/BaoCaoTienDo/UploadFile
        [HttpPost("UploadFile")]
        public async Task<IActionResult> UploadFile(IFormFile file) // Tham số 'file' phải khớp với formData.append('file', file) ở frontend
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("Không có tệp nào được tải lên.");
            }

            // Tạo một tên tệp duy nhất để tránh trùng lặp
            var fileName = Path.GetFileNameWithoutExtension(file.FileName);
            var extension = Path.GetExtension(file.FileName);
            var uniqueFileName = $"{fileName}_{Guid.NewGuid().ToString().Substring(0, 8)}{extension}";

            // Định nghĩa thư mục lưu trữ tệp (ví dụ: wwwroot/uploads)
            var uploadsFolder = Path.Combine(_hostingEnvironment.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // Lưu tệp vào thư mục
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Trả về URL của tệp đã lưu trữ
            // Giả định ứng dụng của bạn chạy trên localhost:7237
            var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{uniqueFileName}";
            return Ok(fileUrl); // Trả về URL của tệp
        }
    
    // PUT: api/BaoCaoTienDo/{id}/danhgia
    [HttpPut("{id}/danhgia")]
        public async Task<IActionResult> PutBaoCaoTienDoDanhGia(int id, BaoCaoTienDoUpdateDto baoCaoUpdateDto)
        {
            var baoCaoToUpdate = await _repository.GetBaoCaoTienDoByIdAsync(id);

            if (baoCaoToUpdate == null)
            {
                return NotFound();
            }

            UpdateBaoCaoTienDoFromDto(baoCaoToUpdate, baoCaoUpdateDto);

            try
            {
                await _repository.UpdateBaoCaoTienDoAsync(baoCaoToUpdate);
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _repository.BaoCaoTienDoExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/BaoCaoTienDo/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBaoCaoTienDo(int id)
        {
            var baoCao = await _repository.GetBaoCaoTienDoByIdAsync(id);
            if (baoCao == null)
            {
                return NotFound();
            }

            await _repository.DeleteBaoCaoTienDoAsync(id);
            return NoContent();
        }
    }
}