using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.DTOs.Lop;
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
    public class LopController : ControllerBase
    {
        private readonly ILopRepository _lopRepository;
        private readonly IChuyenNganhRepository _chuyenNganhRepository;

        public LopController(ILopRepository lopRepository, IChuyenNganhRepository chuyenNganhRepository)
        {
            _lopRepository = lopRepository;
            _chuyenNganhRepository = chuyenNganhRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LopDTO>>> GetAllLop()
        {
            var lops = await _lopRepository.GetAllLopAsync();
            return Ok(lops.Select(l => new LopDTO
            {
                MaLop = l.MaLop,
                TenLop = l.TenLop,
                MaChuyenNganh = l.MaChuyenNganh,
                TenChuyenNganh = l.ChuyenNganh?.TenChuyenNganh,
            }).ToList());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LopDTO>> GetLop(string id)
        {
            var lop = await _lopRepository.GetLopByIdAsync(id);

            if (lop == null)
            {
                return NotFound();
            }

            return Ok(new LopDTO
            {
                MaLop = lop.MaLop,
                TenLop = lop.TenLop,
                MaChuyenNganh = lop.MaChuyenNganh,
                TenChuyenNganh = lop.ChuyenNganh?.TenChuyenNganh,
            });
        }

        [HttpGet("chuyennganh/{chuyenNganhId}")]
        public async Task<ActionResult<IEnumerable<LopDTO>>> GetLopsByChuyenNganh(string chuyenNganhId)
        {
            if (!await _chuyenNganhRepository.ChuyenNganhExistsAsync(chuyenNganhId))
            {
                return NotFound($"Không tìm thấy chuyên ngành có mã: {chuyenNganhId}");
            }

            var lops = await _lopRepository.GetLopByChuyenNganhIdAsync(chuyenNganhId);
            return Ok(lops.Select(l => new LopDTO
            {
                MaLop = l.MaLop,
                TenLop = l.TenLop,
                MaChuyenNganh = l.MaChuyenNganh,
                TenChuyenNganh = l.ChuyenNganh?.TenChuyenNganh,
            }).ToList());
        }

        [HttpPost]
        public async Task<ActionResult<LopDTO>> CreateLop(LopForCreationDTO lopForCreation)
        {
            if (await _lopRepository.LopExistsAsync(lopForCreation.MaLop))
            {
                return Conflict("Mã lớp đã tồn tại.");
            }

            if (!await _chuyenNganhRepository.ChuyenNganhExistsAsync(lopForCreation.MaChuyenNganh))
            {
                return BadRequest($"Mã chuyên ngành '{lopForCreation.MaChuyenNganh}' không tồn tại.");
            }

            var lop = new Lop
            {
                MaLop = lopForCreation.MaLop,
                TenLop = lopForCreation.TenLop,
                MaChuyenNganh = lopForCreation.MaChuyenNganh,
            };

            _lopRepository.CreateLop(lop);
            await _lopRepository.SaveChangesAsync();

            var lopDTO = await _lopRepository.GetLopByIdAsync(lop.MaLop);
            return CreatedAtAction(nameof(GetLop), new { id = lop.MaLop }, new LopDTO
            {
                MaLop = lopDTO.MaLop,
                TenLop = lopDTO.TenLop,
                MaChuyenNganh = lopDTO.MaChuyenNganh,
                TenChuyenNganh = lopDTO.ChuyenNganh?.TenChuyenNganh,
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLop(string id, LopForUpdateDTO lopForUpdate)
        {
            if (!await _lopRepository.LopExistsAsync(id))
            {
                return NotFound($"Không tìm thấy lớp có mã: {id}");
            }

            if (!await _chuyenNganhRepository.ChuyenNganhExistsAsync(lopForUpdate.MaChuyenNganh))
            {
                return BadRequest($"Mã chuyên ngành '{lopForUpdate.MaChuyenNganh}' không tồn tại.");
            }

            var lopFromRepo = await _lopRepository.GetLopByIdAsync(id);
            if (lopFromRepo == null)
            {
                return NotFound();
            }

            lopFromRepo.TenLop = lopForUpdate.TenLop;
            lopFromRepo.MaChuyenNganh = lopForUpdate.MaChuyenNganh;

            _lopRepository.UpdateLop(lopFromRepo);
            await _lopRepository.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLop(string id)
        {
            if (!await _lopRepository.LopExistsAsync(id))
            {
                return NotFound($"Không tìm thấy lớp có mã: {id}");
            }

            var lop = await _lopRepository.GetLopByIdAsync(id);
            if (lop == null)
            {
                return NotFound();
            }

            _lopRepository.DeleteLop(lop);
            await _lopRepository.SaveChangesAsync();

            return NoContent();
        }
    }
}