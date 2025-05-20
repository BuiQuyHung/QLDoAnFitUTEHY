using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.DTOs.BoMon;
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
    public class BoMonController : ControllerBase
    {
        private readonly IBoMonRepository _boMonRepository;
        private readonly IKhoaRepository _khoaRepository; 

        public BoMonController(IBoMonRepository boMonRepository, IKhoaRepository khoaRepository)
        {
            _boMonRepository = boMonRepository;
            _khoaRepository = khoaRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BoMonDTO>>> GetBoMons()
        {
            var boMons = await _boMonRepository.GetAllBoMonAsync();
            return Ok(boMons.Select(bm => new BoMonDTO
            {
                MaBoMon = bm.MaBoMon,
                TenBoMon = bm.TenBoMon,
                MaKhoa = bm.MaKhoa,
                TenKhoa = bm.Khoa?.TenKhoa
            }).ToList());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<BoMonDTO>> GetBoMon(string id)
        {
            var boMon = await _boMonRepository.GetBoMonByIdAsync(id);

            if (boMon == null)
            {
                return NotFound();
            }

            return Ok(new BoMonDTO
            {
                MaBoMon = boMon.MaBoMon,
                TenBoMon = boMon.TenBoMon,
                MaKhoa = boMon.MaKhoa,
                TenKhoa = boMon.Khoa?.TenKhoa
            });
        }

        [HttpGet("khoa/{khoaId}")]
        public async Task<ActionResult<IEnumerable<BoMonDTO>>> GetBoMonsByKhoa(string khoaId)
        {
            if (!await _khoaRepository.KhoaExistsAsync(khoaId))
            {
                return NotFound($"Không tìm thấy khoa có mã: {khoaId}");
            }

            var boMons = await _boMonRepository.GetBoMonByKhoaIdAsync(khoaId);
            return Ok(boMons.Select(bm => new BoMonDTO
            {
                MaBoMon = bm.MaBoMon,
                TenBoMon = bm.TenBoMon,
                MaKhoa = bm.MaKhoa,
                TenKhoa = bm.Khoa?.TenKhoa
            }).ToList());
        }

        [HttpPost]
        public async Task<ActionResult<BoMonDTO>> CreateBoMon(BoMonForCreationDTO boMonForCreation)
        {
            if (await _boMonRepository.BoMonExistsAsync(boMonForCreation.MaBoMon))
            {
                return Conflict("Mã bộ môn đã tồn tại.");
            }

            if (!await _khoaRepository.KhoaExistsAsync(boMonForCreation.MaKhoa))
            {
                return BadRequest($"Mã khoa '{boMonForCreation.MaKhoa}' không tồn tại.");
            }

            var boMon = new BoMon
            {
                MaBoMon = boMonForCreation.MaBoMon,
                TenBoMon = boMonForCreation.TenBoMon,
                MaKhoa = boMonForCreation.MaKhoa
            };

            _boMonRepository.CreateBoMon(boMon);
            await _boMonRepository.SaveChangesAsync();

            var boMonDTO = await _boMonRepository.GetBoMonByIdAsync(boMon.MaBoMon);
            return CreatedAtAction(nameof(GetBoMon), new { id = boMon.MaBoMon }, new BoMonDTO
            {
                MaBoMon = boMonDTO.MaBoMon,
                TenBoMon = boMonDTO.TenBoMon,
                MaKhoa = boMonDTO.MaKhoa,
                TenKhoa = boMonDTO.Khoa?.TenKhoa
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBoMon(string id, BoMonForUpdateDTO boMonForUpdate)
        {
            if (!await _boMonRepository.BoMonExistsAsync(id))
            {
                return NotFound($"Không tìm thấy bộ môn có mã: {id}");
            }

            if (!await _khoaRepository.KhoaExistsAsync(boMonForUpdate.MaKhoa))
            {
                return BadRequest($"Mã khoa '{boMonForUpdate.MaKhoa}' không tồn tại.");
            }

            var boMonFromRepo = await _boMonRepository.GetBoMonByIdAsync(id);
            if (boMonFromRepo == null)
            {
                return NotFound();
            }

            boMonFromRepo.TenBoMon = boMonForUpdate.TenBoMon;
            boMonFromRepo.MaKhoa = boMonForUpdate.MaKhoa;

            _boMonRepository.UpdateBoMon(boMonFromRepo);
            await _boMonRepository.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBoMon(string id)
        {
            if (!await _boMonRepository.BoMonExistsAsync(id))
            {
                return NotFound($"Không tìm thấy bộ môn có mã: {id}");
            }

            var boMon = await _boMonRepository.GetBoMonByIdAsync(id);
            if (boMon == null)
            {
                return NotFound();
            }

            _boMonRepository.DeleteBoMon(boMon);
            await _boMonRepository.SaveChangesAsync();

            return NoContent();
        }
    }
}