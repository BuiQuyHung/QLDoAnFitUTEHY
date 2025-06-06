using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore; 
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

        private BaoCaoTienDoDto MapToBaoCaoTienDoDto(BaoCaoTienDo baoCao)
        {
            if (baoCao == null) return null;

            return new BaoCaoTienDoDto
            {
                MaBaoCao = baoCao.MaBaoCao,
                MaDeTai = baoCao.MaDeTai,
                TenDeTai = baoCao.DeTai?.TenDeTai,
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
                NgayNop = DateTime.Now, 
                TrangThai = "Chờ chấm" 
            };
        }

        private void UpdateBaoCaoTienDoFromDto(BaoCaoTienDo model, BaoCaoTienDoUpdateDto updateDto)
        {
            if (model == null || updateDto == null) return;

            model.MaGV = updateDto.MaGV ?? model.MaGV; 
            model.NhanXetCuaGV = updateDto.NhanXetCuaGV ?? model.NhanXetCuaGV;
            model.DiemSo = updateDto.DiemSo ?? model.DiemSo;
            model.TrangThai = updateDto.TrangThai ?? model.TrangThai;
            model.NgayNhanXet = DateTime.Now;
        }

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

        [HttpPost]
        public async Task<ActionResult<BaoCaoTienDoDto>> PostBaoCaoTienDo(BaoCaoTienDoCreateDto baoCaoCreateDto)
        {
            var baoCao = MapToBaoCaoTienDo(baoCaoCreateDto);
            await _repository.AddBaoCaoTienDoAsync(baoCao);
            var createdBaoCao = await _repository.GetBaoCaoTienDoByIdAsync(baoCao.MaBaoCao);
            return CreatedAtAction(nameof(GetBaoCaoTienDo), new { id = createdBaoCao.MaBaoCao }, MapToBaoCaoTienDoDto(createdBaoCao));
        }

        [HttpPost("UploadFile")]
        public async Task<IActionResult> UploadFile(IFormFile file) 
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("Không có tệp nào được tải lên.");
            }

            var fileName = Path.GetFileNameWithoutExtension(file.FileName);
            var extension = Path.GetExtension(file.FileName);
            var uniqueFileName = $"{fileName}_{Guid.NewGuid().ToString().Substring(0, 8)}{extension}";
            var uploadsFolder = Path.Combine(_hostingEnvironment.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }
            var fileUrl = $"{Request.Scheme}://{Request.Host}/uploads/{uniqueFileName}";
            return Ok(fileUrl); 
        }

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