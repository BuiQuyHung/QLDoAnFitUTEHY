using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.DTOs.GiangVien;
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
    public class GiangVienController : ControllerBase
    {
        private readonly IGiangVienRepository _giangVienRepository;

        public GiangVienController(IGiangVienRepository giangVienRepository)
        {
            _giangVienRepository = giangVienRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GiangVienDTO>>> GetAllGiangVien()
        {
            var giangViens = await _giangVienRepository.GetAllGiangVienAsync();
            return Ok(giangViens.Select(gv => new GiangVienDTO
            {
                MaGV = gv.MaGV,
                HoTen = gv.HoTen,
                ChuyenNganh = gv.ChuyenNganh,
                HocVi = gv.HocVi,
                Email = gv.Email,
                SoDienThoai = gv.SoDienThoai
            }).ToList());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<GiangVienDTO>> GetGiangVien(string id)
        {
            var giangVien = await _giangVienRepository.GetGiangVienByIdAsync(id);

            if (giangVien == null)
            {
                return NotFound();
            }

            return Ok(new GiangVienDTO
            {
                MaGV = giangVien.MaGV,
                HoTen = giangVien.HoTen,
                ChuyenNganh = giangVien.ChuyenNganh,
                HocVi = giangVien.HocVi,
                Email = giangVien.Email,
                SoDienThoai = giangVien.SoDienThoai
            });
        }

        [HttpPost]
        public async Task<ActionResult<GiangVienDTO>> CreateGiangVien(GiangVienForCreationDTO giangVienForCreation)
        {
            if (await _giangVienRepository.GiangVienExistsAsync(giangVienForCreation.MaGV))
            {
                return Conflict("Mã giảng viên đã tồn tại.");
            }

            var giangVien = new GiangVien
            {
                MaGV = giangVienForCreation.MaGV,
                HoTen = giangVienForCreation.HoTen,
                ChuyenNganh = giangVienForCreation.ChuyenNganh,
                HocVi = giangVienForCreation.HocVi,
                Email = giangVienForCreation.Email,
                SoDienThoai = giangVienForCreation.SoDienThoai
            };

            _giangVienRepository.CreateGiangVien(giangVien);
            await _giangVienRepository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGiangVien), new { id = giangVien.MaGV }, new GiangVienDTO
            {
                MaGV = giangVien.MaGV,
                HoTen = giangVien.HoTen,
                ChuyenNganh = giangVien.ChuyenNganh,
                HocVi = giangVien.HocVi,
                Email = giangVien.Email,
                SoDienThoai = giangVien.SoDienThoai
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGiangVien(string id, GiangVienForUpdateDTO giangVienForUpdate)
        {
            if (!await _giangVienRepository.GiangVienExistsAsync(id))
            {
                return NotFound($"Không tìm thấy giảng viên có mã: {id}");
            }

            var giangVienFromRepo = await _giangVienRepository.GetGiangVienByIdAsync(id);
            if (giangVienFromRepo == null)
            {
                return NotFound();
            }

            giangVienFromRepo.HoTen = giangVienForUpdate.HoTen;
            giangVienFromRepo.ChuyenNganh = giangVienForUpdate.ChuyenNganh;
            giangVienFromRepo.HocVi = giangVienForUpdate.HocVi;
            giangVienFromRepo.Email = giangVienForUpdate.Email;
            giangVienFromRepo.SoDienThoai = giangVienForUpdate.SoDienThoai;

            _giangVienRepository.UpdateGiangVien(giangVienFromRepo);
            await _giangVienRepository.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGiangVien(string id)
        {
            if (!await _giangVienRepository.GiangVienExistsAsync(id))
            {
                return NotFound($"Không tìm thấy giảng viên có mã: {id}");
            }

            var giangVien = await _giangVienRepository.GetGiangVienByIdAsync(id);
            if (giangVien == null)
            {
                return NotFound();
            }

            _giangVienRepository.DeleteGiangVien(giangVien);
            await _giangVienRepository.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("chuyennganh/{chuyenNganh}")]
        public async Task<ActionResult<IEnumerable<GiangVienDTO>>> GetGiangViensByChuyenNganh(string chuyenNganh)
        {
            var giangViens = await _giangVienRepository.GetGiangVienByChuyenNganhAsync(chuyenNganh);

            return Ok(giangViens.Select(gv => new GiangVienDTO
            {
                MaGV = gv.MaGV,
                HoTen = gv.HoTen,
                ChuyenNganh = gv.ChuyenNganh,
                HocVi = gv.HocVi,
                Email = gv.Email,
                SoDienThoai = gv.SoDienThoai
            }).ToList());
        }
    }
}