using Microsoft.AspNetCore.Mvc;
using QLDoAnFITUTEHY.DTOs.ThanhVienHoiDong;
using QLDoAnFITUTEHY.Interfaces;
using QLDoAnFITUTEHY.Models;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace QLDoAnFITUTEHY.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ThanhVienHoiDongController : ControllerBase
    {
        private readonly IThanhVienHoiDongRepository _thanhVienHoiDongRepository;

        public ThanhVienHoiDongController(IThanhVienHoiDongRepository thanhVienHoiDongRepository)
        {
            _thanhVienHoiDongRepository = thanhVienHoiDongRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ThanhVienHoiDongDTO>>> GetAllThanhVienHoiDong()
        {
            var thanhVienHoiDongs = await _thanhVienHoiDongRepository.GetAllThanhVienHoiDongAsync();
            return Ok(thanhVienHoiDongs.Select(tv => new ThanhVienHoiDongDTO
            {
                MaHoiDong = tv.MaHoiDong,
                TenHoiDong = tv.HoiDong.TenHoiDong, 
                MaGV = tv.MaGV,
                TenGV = tv.GiangVien.HoTen,      
                VaiTro = tv.VaiTro
            }).ToList());
        }

        [HttpGet("{maHoiDong}/{maGV}")]
        public async Task<ActionResult<ThanhVienHoiDongDTO>> GetThanhVienHoiDong(string maHoiDong, string maGV)
        {
            var thanhVienHoiDong = await _thanhVienHoiDongRepository.GetThanhVienHoiDongByIdAsync(maHoiDong, maGV);

            if (thanhVienHoiDong == null)
            {
                return NotFound();
            }

            return Ok(new ThanhVienHoiDongDTO
            {
                MaHoiDong = thanhVienHoiDong.MaHoiDong,
                TenHoiDong = thanhVienHoiDong.HoiDong.TenHoiDong,
                MaGV = thanhVienHoiDong.MaGV,
                TenGV = thanhVienHoiDong.GiangVien.HoTen,
                VaiTro = thanhVienHoiDong.VaiTro
            });
        }

        [HttpGet("hoidong/{maHoiDong}")]
        public async Task<ActionResult<IEnumerable<ThanhVienHoiDongDTO>>> GetThanhVienHoiDongByHoiDongId(string maHoiDong)
        {
            var thanhVienHoiDongs = await _thanhVienHoiDongRepository.GetThanhVienHoiDongByHoiDongIdAsync(maHoiDong);
            return Ok(thanhVienHoiDongs.Select(tv => new ThanhVienHoiDongDTO
            {
                MaHoiDong = tv.MaHoiDong,
                TenHoiDong = tv.HoiDong.TenHoiDong,
                MaGV = tv.MaGV,
                TenGV = tv.GiangVien.HoTen,
                VaiTro = tv.VaiTro
            }).ToList());
        }

        [HttpGet("giangvien/{maGV}")]
        public async Task<ActionResult<IEnumerable<ThanhVienHoiDongDTO>>> GetThanhVienHoiDongByGiangVienId(string maGV)
        {
            var thanhVienHoiDongs = await _thanhVienHoiDongRepository.GetThanhVienHoiDongByGiangVienIdAsync(maGV);
            return Ok(thanhVienHoiDongs.Select(tv => new ThanhVienHoiDongDTO
            {
                MaHoiDong = tv.MaHoiDong,
                TenHoiDong = tv.HoiDong.TenHoiDong,
                MaGV = tv.MaGV,
                TenGV = tv.GiangVien.HoTen,
                VaiTro = tv.VaiTro
            }).ToList());
        }

        [HttpPost]
        public async Task<ActionResult<ThanhVienHoiDongDTO>> CreateThanhVienHoiDong(ThanhVienHoiDongForCreateDTO thanhVienHoiDongForCreate)
        {
            if (await _thanhVienHoiDongRepository.ThanhVienHoiDongExistsAsync(thanhVienHoiDongForCreate.MaHoiDong, thanhVienHoiDongForCreate.MaGV))
            {
                return Conflict($"Thành viên hội đồng với mã hội đồng '{thanhVienHoiDongForCreate.MaHoiDong}' và mã giảng viên '{thanhVienHoiDongForCreate.MaGV}' đã tồn tại.");
            }

            var thanhVienHoiDong = new ThanhVienHoiDong
            {
                MaHoiDong = thanhVienHoiDongForCreate.MaHoiDong,
                MaGV = thanhVienHoiDongForCreate.MaGV,
                VaiTro = thanhVienHoiDongForCreate.VaiTro
            };

            _thanhVienHoiDongRepository.CreateThanhVienHoiDong(thanhVienHoiDong);
            await _thanhVienHoiDongRepository.SaveChangesAsync();

            var thanhVienHoiDongDTO = await _thanhVienHoiDongRepository.GetThanhVienHoiDongByIdAsync(thanhVienHoiDong.MaHoiDong, thanhVienHoiDong.MaGV);
            return CreatedAtAction(nameof(GetThanhVienHoiDong), new { maHoiDong = thanhVienHoiDong.MaHoiDong, maGV = thanhVienHoiDong.MaGV }, thanhVienHoiDongDTO);
        }

        [HttpPut("{maHoiDong}/{maGV}")]
        public async Task<IActionResult> UpdateThanhVienHoiDong(string maHoiDong, string maGV, ThanhVienHoiDongForUpdateDTO thanhVienHoiDongForUpdate)
        {
            var thanhVienHoiDongFromRepo = await _thanhVienHoiDongRepository.GetThanhVienHoiDongByIdAsync(maHoiDong, maGV);
            if (thanhVienHoiDongFromRepo == null)
            {
                return NotFound();
            }

            thanhVienHoiDongFromRepo.VaiTro = thanhVienHoiDongForUpdate.VaiTro;

            _thanhVienHoiDongRepository.UpdateThanhVienHoiDong(thanhVienHoiDongFromRepo);
            await _thanhVienHoiDongRepository.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{maHoiDong}/{maGV}")]
        public async Task<IActionResult> DeleteThanhVienHoiDong(string maHoiDong, string maGV)
        {
            var thanhVienHoiDongFromRepo = await _thanhVienHoiDongRepository.GetThanhVienHoiDongByIdAsync(maHoiDong, maGV);
            if (thanhVienHoiDongFromRepo == null)
            {
                return NotFound();
            }

            _thanhVienHoiDongRepository.DeleteThanhVienHoiDong(thanhVienHoiDongFromRepo);
            await _thanhVienHoiDongRepository.SaveChangesAsync();

            return NoContent();
        }
    }
}