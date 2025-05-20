using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QLDoAnFITUTEHY.Interfaces;
using QLDoAnFITUTEHY.Models;
using QLDoAnFITUTEHY.DTOs.Khoa;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KhoaController : ControllerBase
    {
        private readonly IKhoaRepository _khoaRepository;

        public KhoaController(IKhoaRepository khoaRepository)
        {
            _khoaRepository = khoaRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<KhoaDTO>>> GetKhoas()
        {
            var khoas = await _khoaRepository.GetAllKhoaAsync();
            return Ok(khoas.Select(k => new KhoaDTO { MaKhoa = k.MaKhoa, TenKhoa = k.TenKhoa }).ToList());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<KhoaDTO>> GetKhoa(string id)
        {
            var khoa = await _khoaRepository.GetKhoaByIdAsync(id);

            if (khoa == null)
            {
                return NotFound();
            }

            return Ok(new KhoaDTO { MaKhoa = khoa.MaKhoa, TenKhoa = khoa.TenKhoa });
        }

        [HttpPost]
        public async Task<ActionResult<KhoaDTO>> CreateKhoa(KhoaForCreationDTO khoaForCreation)
        {
            if (await _khoaRepository.KhoaExistsAsync(khoaForCreation.MaKhoa))
            {
                return Conflict("Mã khoa đã tồn tại.");
            }

            var khoa = new Khoa
            {
                MaKhoa = khoaForCreation.MaKhoa,
                TenKhoa = khoaForCreation.TenKhoa
            };

            _khoaRepository.CreateKhoa(khoa);
            await _khoaRepository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetKhoa), new { id = khoa.MaKhoa }, new KhoaDTO { MaKhoa = khoa.MaKhoa, TenKhoa = khoa.TenKhoa });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateKhoa(string id, KhoaForUpdateDTO khoaForUpdate)
        {
            var khoaFromRepo = await _khoaRepository.GetKhoaByIdAsync(id);
            if (khoaFromRepo == null)
            {
                return NotFound();
            }

            khoaFromRepo.TenKhoa = khoaForUpdate.TenKhoa;

            _khoaRepository.UpdateKhoa(khoaFromRepo);
            await _khoaRepository.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteKhoa(string id)
        {
            var khoa = await _khoaRepository.GetKhoaByIdAsync(id);
            if (khoa == null)
            {
                return NotFound();
            }

            _khoaRepository.DeleteKhoa(khoa);
            await _khoaRepository.SaveChangesAsync();

            return NoContent();
        }
    }
}