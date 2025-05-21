using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.DTOs.SinhVien;
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
    public class SinhVienController : ControllerBase
    {
        private readonly ISinhVienRepository _sinhVienRepository;
        private readonly ILopRepository _lopRepository; 

        public SinhVienController(ISinhVienRepository sinhVienRepository, ILopRepository lopRepository)
        {
            _sinhVienRepository = sinhVienRepository;
            _lopRepository = lopRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SinhVienDTO>>> GetAllSinhVien()
        {
            var sinhViens = await _sinhVienRepository.GetAllSinhVienAsync();
            return Ok(sinhViens.Select(sv => new SinhVienDTO
            {
                MaSV = sv.MaSV,
                HoTen = sv.HoTen,
                Email = sv.Email,
                SoDienThoai = sv.SoDienThoai,
                NgaySinh = sv.NgaySinh,
                MaLop = sv.MaLop,
                TenLop = sv.Lop?.TenLop
            }).ToList());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SinhVienDTO>> GetSinhVien(string id)
        {
            var sinhVien = await _sinhVienRepository.GetSinhVienByIdAsync(id);

            if (sinhVien == null)
            {
                return NotFound();
            }

            return Ok(new SinhVienDTO
            {
                MaSV = sinhVien.MaSV,
                HoTen = sinhVien.HoTen,
                Email = sinhVien.Email,
                SoDienThoai = sinhVien.SoDienThoai,
                NgaySinh = sinhVien.NgaySinh,
                MaLop = sinhVien.MaLop,
                TenLop = sinhVien.Lop?.TenLop
            });
        }

        [HttpGet("lop/{lopId}")]
        public async Task<ActionResult<IEnumerable<SinhVienDTO>>> GetSinhViensByLop(string lopId)
        {
            if (!await _lopRepository.LopExistsAsync(lopId))
            {
                return NotFound($"Không tìm thấy lớp có mã: {lopId}");
            }

            var sinhViens = await _sinhVienRepository.GetSinhVienByLopIdAsync(lopId);
            return Ok(sinhViens.Select(sv => new SinhVienDTO
            {
                MaSV = sv.MaSV,
                HoTen = sv.HoTen,
                Email = sv.Email,
                SoDienThoai = sv.SoDienThoai,
                NgaySinh = sv.NgaySinh,
                MaLop = sv.MaLop,
                TenLop = sv.Lop?.TenLop
            }).ToList());
        }

        [HttpPost]
        public async Task<ActionResult<SinhVienDTO>> CreateSinhVien(SinhVienForCreationDTO sinhVienForCreation)
        {
            if (await _sinhVienRepository.SinhVienExistsAsync(sinhVienForCreation.MaSV))
            {
                return Conflict("Mã sinh viên đã tồn tại.");
            }

            if (!await _lopRepository.LopExistsAsync(sinhVienForCreation.MaLop))
            {
                return BadRequest($"Mã lớp '{sinhVienForCreation.MaLop}' không tồn tại.");
            }

            var sinhVien = new SinhVien
            {
                MaSV = sinhVienForCreation.MaSV,
                HoTen = sinhVienForCreation.HoTen,
                Email = sinhVienForCreation.Email,
                SoDienThoai = sinhVienForCreation.SoDienThoai,
                NgaySinh = sinhVienForCreation.NgaySinh,
                MaLop = sinhVienForCreation.MaLop
            };

            _sinhVienRepository.CreateSinhVien(sinhVien);
            await _sinhVienRepository.SaveChangesAsync();

            var sinhVienDTO = await _sinhVienRepository.GetSinhVienByIdAsync(sinhVien.MaSV);
            return CreatedAtAction(nameof(GetSinhVien), new { id = sinhVien.MaSV }, new SinhVienDTO
            {
                MaSV = sinhVienDTO.MaSV,
                HoTen = sinhVienDTO.HoTen,
                Email = sinhVienDTO.Email,
                SoDienThoai = sinhVienDTO.SoDienThoai,
                NgaySinh = sinhVienDTO.NgaySinh,
                MaLop = sinhVienDTO.MaLop,
                TenLop = sinhVienDTO.Lop?.TenLop
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSinhVien(string id, SinhVienForUpdateDTO sinhVienForUpdate)
        {
            if (!await _sinhVienRepository.SinhVienExistsAsync(id))
            {
                return NotFound($"Không tìm thấy sinh viên có mã: {id}");
            }

            if (!await _lopRepository.LopExistsAsync(sinhVienForUpdate.MaLop))
            {
                return BadRequest($"Mã lớp '{sinhVienForUpdate.MaLop}' không tồn tại.");
            }

            var sinhVienFromRepo = await _sinhVienRepository.GetSinhVienByIdAsync(id);
            if (sinhVienFromRepo == null)
            {
                return NotFound();
            }

            sinhVienFromRepo.HoTen = sinhVienForUpdate.HoTen;
            sinhVienFromRepo.Email = sinhVienForUpdate.Email;
            sinhVienFromRepo.SoDienThoai = sinhVienForUpdate.SoDienThoai;
            sinhVienFromRepo.NgaySinh = sinhVienForUpdate.NgaySinh;
            sinhVienFromRepo.MaLop = sinhVienForUpdate.MaLop;

            _sinhVienRepository.UpdateSinhVien(sinhVienFromRepo);
            await _sinhVienRepository.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSinhVien(string id)
        {
            if (!await _sinhVienRepository.SinhVienExistsAsync(id))
            {
                return NotFound($"Không tìm thấy sinh viên có mã: {id}");
            }

            var sinhVien = await _sinhVienRepository.GetSinhVienByIdAsync(id);
            if (sinhVien == null)
            {
                return NotFound();
            }

            _sinhVienRepository.DeleteSinhVien(sinhVien);
            await _sinhVienRepository.SaveChangesAsync();

            return NoContent();
        }
    }
}