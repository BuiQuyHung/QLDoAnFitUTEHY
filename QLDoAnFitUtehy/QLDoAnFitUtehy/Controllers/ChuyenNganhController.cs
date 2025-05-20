using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.DTOs.ChuyenNganh;
using QLDoAnFITUTEHY.Interfaces;
using QLDoAnFITUTEHY.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChuyenNganhController : ControllerBase
    {
        private readonly IChuyenNganhRepository _chuyenNganhRepository;
        private readonly INganhRepository _nganhRepository; 

        public ChuyenNganhController(IChuyenNganhRepository chuyenNganhRepository, INganhRepository nganhRepository)
        {
            _chuyenNganhRepository = chuyenNganhRepository;
            _nganhRepository = nganhRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ChuyenNganhDTO>>> GetAllChuyenNganh()
        {
            var chuyenNganhs = await _chuyenNganhRepository.GetAllChuyenNganhAsync();
            return Ok(chuyenNganhs.Select(cn => new ChuyenNganhDTO
            {
                MaChuyenNganh = cn.MaChuyenNganh,
                TenChuyenNganh = cn.TenChuyenNganh,
                MaNganh = cn.MaNganh,
                TenNganh = cn.Nganh?.TenNganh
            }).ToList());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ChuyenNganhDTO>> GetChuyenNganh(string id)
        {
            var chuyenNganh = await _chuyenNganhRepository.GetChuyenNganhByIdAsync(id);

            if (chuyenNganh == null)
            {
                return NotFound();
            }

            return Ok(new ChuyenNganhDTO
            {
                MaChuyenNganh = chuyenNganh.MaChuyenNganh,
                TenChuyenNganh = chuyenNganh.TenChuyenNganh,
                MaNganh = chuyenNganh.MaNganh,
                TenNganh = chuyenNganh.Nganh?.TenNganh
            });
        }

        [HttpGet("nganh/{nganhId}")]
        public async Task<ActionResult<IEnumerable<ChuyenNganhDTO>>> GetChuyenNganhByNganh(string nganhId)
        {
            if (!await _nganhRepository.NganhExistsAsync(nganhId))
            {
                return NotFound($"Không tìm thấy ngành có mã: {nganhId}");
            }

            var chuyenNganhs = await _chuyenNganhRepository.GetChuyenNganhByNganhIdAsync(nganhId);
            return Ok(chuyenNganhs.Select(cn => new ChuyenNganhDTO
            {
                MaChuyenNganh = cn.MaChuyenNganh,
                TenChuyenNganh = cn.TenChuyenNganh,
                MaNganh = cn.MaNganh,
                TenNganh = cn.Nganh?.TenNganh
            }).ToList());
        }

        [HttpPost]
        public async Task<ActionResult<ChuyenNganhDTO>> CreateChuyenNganh(ChuyenNganhForCreationDTO chuyenNganhForCreation)
        {
            if (await _chuyenNganhRepository.ChuyenNganhExistsAsync(chuyenNganhForCreation.MaChuyenNganh))
            {
                return Conflict("Mã chuyên ngành đã tồn tại.");
            }

            if (!await _nganhRepository.NganhExistsAsync(chuyenNganhForCreation.MaNganh))
            {
                return BadRequest($"Mã ngành '{chuyenNganhForCreation.MaNganh}' không tồn tại.");
            }

            var chuyenNganh = new ChuyenNganh
            {
                MaChuyenNganh = chuyenNganhForCreation.MaChuyenNganh,
                TenChuyenNganh = chuyenNganhForCreation.TenChuyenNganh,
                MaNganh = chuyenNganhForCreation.MaNganh
            };

            _chuyenNganhRepository.CreateChuyenNganh(chuyenNganh);
            await _chuyenNganhRepository.SaveChangesAsync();

            var chuyenNganhDTO = await _chuyenNganhRepository.GetChuyenNganhByIdAsync(chuyenNganh.MaChuyenNganh);
            return CreatedAtAction(nameof(GetChuyenNganh), new { id = chuyenNganh.MaChuyenNganh }, new ChuyenNganhDTO
            {
                MaChuyenNganh = chuyenNganhDTO.MaChuyenNganh,
                TenChuyenNganh = chuyenNganhDTO.TenChuyenNganh,
                MaNganh = chuyenNganhDTO.MaNganh,
                TenNganh = chuyenNganhDTO.Nganh?.TenNganh
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateChuyenNganh(string id, ChuyenNganhForUpdateDTO chuyenNganhForUpdate)
        {
            if (!await _chuyenNganhRepository.ChuyenNganhExistsAsync(id))
            {
                return NotFound($"Không tìm thấy chuyên ngành có mã: {id}");
            }

            if (!await _nganhRepository.NganhExistsAsync(chuyenNganhForUpdate.MaNganh))
            {
                return BadRequest($"Mã ngành '{chuyenNganhForUpdate.MaNganh}' không tồn tại.");
            }

            var chuyenNganhFromRepo = await _chuyenNganhRepository.GetChuyenNganhByIdAsync(id);
            if (chuyenNganhFromRepo == null)
            {
                return NotFound();
            }

            chuyenNganhFromRepo.TenChuyenNganh = chuyenNganhForUpdate.TenChuyenNganh;
            chuyenNganhFromRepo.MaNganh = chuyenNganhForUpdate.MaNganh;

            _chuyenNganhRepository.UpdateChuyenNganh(chuyenNganhFromRepo);
            await _chuyenNganhRepository.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteChuyenNganh(string id)
        {
            if (!await _chuyenNganhRepository.ChuyenNganhExistsAsync(id))
            {
                return NotFound($"Không tìm thấy chuyên ngành có mã: {id}");
            }

            var chuyenNganh = await _chuyenNganhRepository.GetChuyenNganhByIdAsync(id);
            if (chuyenNganh == null)
            {
                return NotFound();
            }

            _chuyenNganhRepository.DeleteChuyenNganh(chuyenNganh);
            await _chuyenNganhRepository.SaveChangesAsync();

            return NoContent();
        }
    }
}