using Microsoft.AspNetCore.Mvc;
using QLDoAnFITUTEHY.DTOs.HoiDong;
using QLDoAnFITUTEHY.Interfaces;
using QLDoAnFITUTEHY.Models;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace QLDoAnFITUTEHY.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HoiDongController : ControllerBase
    {
        private readonly IHoiDongRepository _hoiDongRepository;

        public HoiDongController(IHoiDongRepository hoiDongRepository)
        {
            _hoiDongRepository = hoiDongRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<HoiDongDTO>>> GetAllHoiDong()
        {
            var hoiDongs = await _hoiDongRepository.GetAllHoiDongAsync();
            return Ok(hoiDongs.Select(hd => new HoiDongDTO
            {
                MaHoiDong = hd.MaHoiDong,
                TenHoiDong = hd.TenHoiDong,
                NgayBaoVe = hd.NgayBaoVe,
                MaDotDoAn = hd.MaDotDoAn,
                TenDotDoAn = hd.DotDoAn?.TenDotDoAn
            }).ToList());
        }

        [HttpGet("{maHoiDong}")]
        public async Task<ActionResult<HoiDongDTO>> GetHoiDong(string maHoiDong)
        {
            var hoiDong = await _hoiDongRepository.GetHoiDongByIdAsync(maHoiDong);

            if (hoiDong == null)
            {
                return NotFound();
            }

            return Ok(new HoiDongDTO
            {
                MaHoiDong = hoiDong.MaHoiDong,
                TenHoiDong = hoiDong.TenHoiDong,
                NgayBaoVe = hoiDong.NgayBaoVe,
                MaDotDoAn = hoiDong.MaDotDoAn,
                TenDotDoAn = hoiDong.DotDoAn?.TenDotDoAn
            });
        }

        [HttpGet("dotdoan/{maDotDoAn}")]
        public async Task<ActionResult<IEnumerable<HoiDongDTO>>> GetHoiDongByDotDoAn(string maDotDoAn)
        {
            var hoiDongs = await _hoiDongRepository.GetHoiDongByDotDoAnIdAsync(maDotDoAn);
            return Ok(hoiDongs.Select(hd => new HoiDongDTO
            {
                MaHoiDong = hd.MaHoiDong,
                TenHoiDong = hd.TenHoiDong,
                NgayBaoVe = hd.NgayBaoVe,
                MaDotDoAn = hd.MaDotDoAn,
                TenDotDoAn = hd.DotDoAn?.TenDotDoAn
            }).ToList());
        }

        [HttpPost]
        public async Task<ActionResult<HoiDongDTO>> CreateHoiDong(HoiDongForCreateDTO hoiDongForCreate)
        {
            if (await _hoiDongRepository.HoiDongExistsAsync(hoiDongForCreate.MaHoiDong))
            {
                return Conflict($"Hội đồng có mã '{hoiDongForCreate.MaHoiDong}' đã tồn tại.");
            }

            var hoiDong = new HoiDong
            {
                MaHoiDong = hoiDongForCreate.MaHoiDong,
                TenHoiDong = hoiDongForCreate.TenHoiDong,
                NgayBaoVe = hoiDongForCreate.NgayBaoVe,
                MaDotDoAn = hoiDongForCreate.MaDotDoAn
            };

            _hoiDongRepository.CreateHoiDong(hoiDong);
            await _hoiDongRepository.SaveChangesAsync();

            var hoiDongDTO = await _hoiDongRepository.GetHoiDongByIdAsync(hoiDong.MaHoiDong);
            return CreatedAtAction(nameof(GetHoiDong), new { maHoiDong = hoiDong.MaHoiDong }, hoiDongDTO);
        }

        [HttpPut("{maHoiDong}")]
        public async Task<IActionResult> UpdateHoiDong(string maHoiDong, HoiDongForUpdateDTO hoiDongForUpdate)
        {
            var hoiDongFromRepo = await _hoiDongRepository.GetHoiDongByIdAsync(maHoiDong);
            if (hoiDongFromRepo == null)
            {
                return NotFound();
            }

            hoiDongFromRepo.TenHoiDong = hoiDongForUpdate.TenHoiDong;
            hoiDongFromRepo.NgayBaoVe = hoiDongForUpdate.NgayBaoVe;
            hoiDongFromRepo.MaDotDoAn = hoiDongForUpdate.MaDotDoAn;

            _hoiDongRepository.UpdateHoiDong(hoiDongFromRepo);
            await _hoiDongRepository.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{maHoiDong}")]
        public async Task<IActionResult> DeleteHoiDong(string maHoiDong)
        {
            var hoiDongFromRepo = await _hoiDongRepository.GetHoiDongByIdAsync(maHoiDong);
            if (hoiDongFromRepo == null)
            {
                return NotFound();
            }

            _hoiDongRepository.DeleteHoiDong(hoiDongFromRepo);
            await _hoiDongRepository.SaveChangesAsync();

            return NoContent();
        }
    }
}