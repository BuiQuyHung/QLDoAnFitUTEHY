using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.DTOs.Nganh;
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
    public class NganhController : ControllerBase
    {
        private readonly INganhRepository _nganhRepository;
        private readonly IBoMonRepository _boMonRepository; 

        public NganhController(INganhRepository nganhRepository, IBoMonRepository boMonRepository)
        {
            _nganhRepository = nganhRepository;
            _boMonRepository = boMonRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<NganhDTO>>> GetNganhs()
        {
            var nganhs = await _nganhRepository.GetAllNganhAsync();
            return Ok(nganhs.Select(n => new NganhDTO
            {
                MaNganh = n.MaNganh,
                TenNganh = n.TenNganh,
                MaBoMon = n.MaBoMon,
                TenBoMon = n.BoMon?.TenBoMon
            }).ToList());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<NganhDTO>> GetNganh(string id)
        {
            var nganh = await _nganhRepository.GetNganhByIdAsync(id);

            if (nganh == null)
            {
                return NotFound();
            }

            return Ok(new NganhDTO
            {
                MaNganh = nganh.MaNganh,
                TenNganh = nganh.TenNganh,
                MaBoMon = nganh.MaBoMon,
                TenBoMon = nganh.BoMon?.TenBoMon
            });
        }

        [HttpGet("bomon/{boMonId}")]
        public async Task<ActionResult<IEnumerable<NganhDTO>>> GetNganhsByBoMon(string boMonId)
        {
            if (!await _boMonRepository.BoMonExistsAsync(boMonId))
            {
                return NotFound($"Không tìm thấy bộ môn có mã: {boMonId}");
            }

            var nganhs = await _nganhRepository.GetNganhByBoMonIdAsync(boMonId);
            return Ok(nganhs.Select(n => new NganhDTO
            {
                MaNganh = n.MaNganh,
                TenNganh = n.TenNganh,
                MaBoMon = n.MaBoMon,
                TenBoMon = n.BoMon?.TenBoMon
            }).ToList());
        }

        [HttpPost]
        public async Task<ActionResult<NganhDTO>> CreateNganh(NganhForCreationDTO nganhForCreation)
        {
            if (await _nganhRepository.NganhExistsAsync(nganhForCreation.MaNganh))
            {
                return Conflict("Mã ngành đã tồn tại.");
            }

            if (!await _boMonRepository.BoMonExistsAsync(nganhForCreation.MaBoMon))
            {
                return BadRequest($"Mã bộ môn '{nganhForCreation.MaBoMon}' không tồn tại.");
            }

            var nganh = new Nganh
            {
                MaNganh = nganhForCreation.MaNganh,
                TenNganh = nganhForCreation.TenNganh,
                MaBoMon = nganhForCreation.MaBoMon
            };

            _nganhRepository.CreateNganh(nganh);
            await _nganhRepository.SaveChangesAsync();

            var nganhDTO = await _nganhRepository.GetNganhByIdAsync(nganh.MaNganh);
            return CreatedAtAction(nameof(GetNganh), new { id = nganh.MaNganh }, new NganhDTO
            {
                MaNganh = nganhDTO.MaNganh,
                TenNganh = nganhDTO.TenNganh,
                MaBoMon = nganhDTO.MaBoMon,
                TenBoMon = nganhDTO.BoMon?.TenBoMon
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateNganh(string id, NganhForUpdateDTO nganhForUpdate)
        {
            if (!await _nganhRepository.NganhExistsAsync(id))
            {
                return NotFound($"Không tìm thấy ngành có mã: {id}");
            }

            if (!await _boMonRepository.BoMonExistsAsync(nganhForUpdate.MaBoMon))
            {
                return BadRequest($"Mã bộ môn '{nganhForUpdate.MaBoMon}' không tồn tại.");
            }

            var nganhFromRepo = await _nganhRepository.GetNganhByIdAsync(id);
            if (nganhFromRepo == null)
            {
                return NotFound();
            }

            nganhFromRepo.TenNganh = nganhForUpdate.TenNganh;
            nganhFromRepo.MaBoMon = nganhForUpdate.MaBoMon;

            _nganhRepository.UpdateNganh(nganhFromRepo);
            await _nganhRepository.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNganh(string id)
        {
            if (!await _nganhRepository.NganhExistsAsync(id))
            {
                return NotFound($"Không tìm thấy ngành có mã: {id}");
            }

            var nganh = await _nganhRepository.GetNganhByIdAsync(id);
            if (nganh == null)
            {
                return NotFound();
            }

            _nganhRepository.DeleteNganh(nganh);
            await _nganhRepository.SaveChangesAsync();

            return NoContent();
        }
    }
}