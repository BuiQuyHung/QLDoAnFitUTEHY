using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.DTOs.DotDoAn;
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
    public class DotDoAnController : ControllerBase
    {
        private readonly IDotDoAnRepository _dotDoAnRepository;
        private readonly ILopRepository _lopRepository;
        private readonly IGiangVienRepository _giangVienRepository;

        public DotDoAnController(IDotDoAnRepository dotDoAnRepository, ILopRepository lopRepository, IGiangVienRepository giangVienRepository)
        {
            _dotDoAnRepository = dotDoAnRepository;
            _lopRepository = lopRepository;
            _giangVienRepository = giangVienRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DotDoAnDTO>>> GetAllDotDoAn()
        {
            var dotDoAns = await _dotDoAnRepository.GetAllDotDoAnAsync();
            return Ok(dotDoAns.Select(dda => new DotDoAnDTO
            {
                MaDotDoAn = dda.MaDotDoAn,
                TenDotDoAn = dda.TenDotDoAn,
                KhoaHoc = dda.KhoaHoc,
                NgayBatDau = dda.NgayBatDau,
                NgayKetThuc = dda.NgayKetThuc,
                SoTuanThucHien = dda.SoTuanThucHien,
                MaLop = dda.MaLop,
                TenLop = dda.Lop?.TenLop, 
                MaGV = dda.MaGV,
                HoTenGV = dda.GiangVien?.HoTen 
            }).ToList());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DotDoAnDTO>> GetDotDoAn(string id)
        {
            var dotDoAn = await _dotDoAnRepository.GetDotDoAnByIdAsync(id);

            if (dotDoAn == null)
            {
                return NotFound();
            }

            return Ok(new DotDoAnDTO
            {
                MaDotDoAn = dotDoAn.MaDotDoAn,
                TenDotDoAn = dotDoAn.TenDotDoAn,
                KhoaHoc = dotDoAn.KhoaHoc,
                NgayBatDau = dotDoAn.NgayBatDau,
                NgayKetThuc = dotDoAn.NgayKetThuc,
                SoTuanThucHien = dotDoAn.SoTuanThucHien,
                MaLop = dotDoAn.MaLop,
                TenLop = dotDoAn.Lop?.TenLop, 
                MaGV = dotDoAn.MaGV,
                HoTenGV = dotDoAn.GiangVien?.HoTen 
            });
        }

        [HttpGet("lop/{lopId}")]
        public async Task<ActionResult<IEnumerable<DotDoAnDTO>>> GetDotDoAnsByLop(string lopId)
        {
            if (!await _lopRepository.LopExistsAsync(lopId))
            {
                return NotFound($"Không tìm thấy lớp có mã: {lopId}");
            }

            var dotDoAns = await _dotDoAnRepository.GetDotDoAnByLopIdAsync(lopId);
            return Ok(dotDoAns.Select(dda => new DotDoAnDTO
            {
                MaDotDoAn = dda.MaDotDoAn,
                TenDotDoAn = dda.TenDotDoAn,
                KhoaHoc = dda.KhoaHoc,
                NgayBatDau = dda.NgayBatDau,
                NgayKetThuc = dda.NgayKetThuc,
                SoTuanThucHien = dda.SoTuanThucHien,
                MaLop = dda.MaLop,
                TenLop = dda.Lop?.TenLop, 
                MaGV = dda.MaGV,
                HoTenGV = dda.GiangVien?.HoTen 
            }).ToList());
        }

        [HttpGet("giangvien/{gvId}")]
        public async Task<ActionResult<IEnumerable<DotDoAnDTO>>> GetDotDoAnsByGiangVien(string gvId)
        {
            if (!await _giangVienRepository.GiangVienExistsAsync(gvId))
            {
                return NotFound($"Không tìm thấy giảng viên có mã: {gvId}");
            }

            var dotDoAns = await _dotDoAnRepository.GetDotDoAnByGiangVienIdAsync(gvId);
            return Ok(dotDoAns.Select(dda => new DotDoAnDTO
            {
                MaDotDoAn = dda.MaDotDoAn,
                TenDotDoAn = dda.TenDotDoAn,
                KhoaHoc = dda.KhoaHoc,
                NgayBatDau = dda.NgayBatDau,
                NgayKetThuc = dda.NgayKetThuc,
                SoTuanThucHien = dda.SoTuanThucHien,
                MaLop = dda.MaLop,
                TenLop = dda.Lop?.TenLop, 
                MaGV = dda.MaGV,
                HoTenGV = dda.GiangVien?.HoTen 
            }).ToList());
        }

        [HttpPost]
        public async Task<ActionResult<DotDoAnDTO>> CreateDotDoAn(DotDoAnForCreationDTO dotDoAnForCreation)
        {
            if (await _dotDoAnRepository.DotDoAnExistsAsync(dotDoAnForCreation.MaDotDoAn))
            {
                return Conflict("Mã đợt đồ án đã tồn tại.");
            }

            if (!string.IsNullOrEmpty(dotDoAnForCreation.MaLop) && !await _lopRepository.LopExistsAsync(dotDoAnForCreation.MaLop))
            {
                return BadRequest($"Mã lớp '{dotDoAnForCreation.MaLop}' không tồn tại.");
            }

            if (!string.IsNullOrEmpty(dotDoAnForCreation.MaGV) && !await _giangVienRepository.GiangVienExistsAsync(dotDoAnForCreation.MaGV))
            {
                return BadRequest($"Mã giảng viên '{dotDoAnForCreation.MaGV}' không tồn tại.");
            }

            var dotDoAn = new DotDoAn
            {
                MaDotDoAn = dotDoAnForCreation.MaDotDoAn,
                TenDotDoAn = dotDoAnForCreation.TenDotDoAn,
                KhoaHoc = dotDoAnForCreation.KhoaHoc,
                NgayBatDau = dotDoAnForCreation.NgayBatDau,
                NgayKetThuc = dotDoAnForCreation.NgayKetThuc,
                SoTuanThucHien = dotDoAnForCreation.SoTuanThucHien,
                MaLop = dotDoAnForCreation.MaLop,
                MaGV = dotDoAnForCreation.MaGV
            };

            _dotDoAnRepository.CreateDotDoAn(dotDoAn);
            await _dotDoAnRepository.SaveChangesAsync();

            var dotDoAnDTO = await _dotDoAnRepository.GetDotDoAnByIdAsync(dotDoAn.MaDotDoAn);
            return CreatedAtAction(nameof(GetDotDoAn), new { id = dotDoAn.MaDotDoAn }, new DotDoAnDTO
            {
                MaDotDoAn = dotDoAnDTO.MaDotDoAn,
                TenDotDoAn = dotDoAnDTO.TenDotDoAn,
                KhoaHoc = dotDoAnDTO.KhoaHoc,
                NgayBatDau = dotDoAnDTO.NgayBatDau,
                NgayKetThuc = dotDoAnDTO.NgayKetThuc,
                SoTuanThucHien = dotDoAnDTO.SoTuanThucHien,
                MaLop = dotDoAnDTO.MaLop,
                TenLop = dotDoAnDTO.Lop?.TenLop,
                MaGV = dotDoAnDTO.MaGV,
                HoTenGV = dotDoAnDTO.GiangVien?.HoTen
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDotDoAn(string id, DotDoAnForUpdateDTO dotDoAnForUpdate)
        {
            if (!await _dotDoAnRepository.DotDoAnExistsAsync(id))
            {
                return NotFound($"Không tìm thấy đợt đồ án có mã: {id}");
            }

            if (!string.IsNullOrEmpty(dotDoAnForUpdate.MaLop) && !await _lopRepository.LopExistsAsync(dotDoAnForUpdate.MaLop))
            {
                return BadRequest($"Mã lớp '{dotDoAnForUpdate.MaLop}' không tồn tại.");
            }

            if (!string.IsNullOrEmpty(dotDoAnForUpdate.MaGV) && !await _giangVienRepository.GiangVienExistsAsync(dotDoAnForUpdate.MaGV))
            {
                return BadRequest($"Mã giảng viên '{dotDoAnForUpdate.MaGV}' không tồn tại.");
            }

            var dotDoAnFromRepo = await _dotDoAnRepository.GetDotDoAnByIdAsync(id);
            if (dotDoAnFromRepo == null)
            {
                return NotFound();
            }

            dotDoAnFromRepo.TenDotDoAn = dotDoAnForUpdate.TenDotDoAn;
            dotDoAnFromRepo.KhoaHoc = dotDoAnForUpdate.KhoaHoc;
            dotDoAnFromRepo.NgayBatDau = dotDoAnForUpdate.NgayBatDau;
            dotDoAnFromRepo.NgayKetThuc = dotDoAnForUpdate.NgayKetThuc;
            dotDoAnFromRepo.SoTuanThucHien = dotDoAnForUpdate.SoTuanThucHien;
            dotDoAnFromRepo.MaLop = dotDoAnForUpdate.MaLop;
            dotDoAnFromRepo.MaGV = dotDoAnForUpdate.MaGV;

            _dotDoAnRepository.UpdateDotDoAn(dotDoAnFromRepo);
            await _dotDoAnRepository.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDotDoAn(string id)
        {
            if (!await _dotDoAnRepository.DotDoAnExistsAsync(id))
            {
                return NotFound($"Không tìm thấy đợt đồ án có mã: {id}");
            }

            var dotDoAn = await _dotDoAnRepository.GetDotDoAnByIdAsync(id);
            if (dotDoAn == null)
            {
                return NotFound();
            }

            _dotDoAnRepository.DeleteDotDoAn(dotDoAn);
            await _dotDoAnRepository.SaveChangesAsync();

            return NoContent();
        }
    }
}