using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.DTOs.PhanCong;
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
    public class PhanCongController : ControllerBase
    {
        private readonly IPhanCongRepository _phanCongRepository;
        private readonly IDeTaiRepository _deTaiRepository;
        private readonly ISinhVienRepository _sinhVienRepository;
        private readonly IDotDoAnRepository _dotDoAnRepository;

        public PhanCongController(IPhanCongRepository phanCongRepository, IDeTaiRepository deTaiRepository, ISinhVienRepository sinhVienRepository, IDotDoAnRepository dotDoAnRepository)
        {
            _phanCongRepository = phanCongRepository;
            _deTaiRepository = deTaiRepository;
            _sinhVienRepository = sinhVienRepository;
            _dotDoAnRepository = dotDoAnRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PhanCongDTO>>> GetAllPhanCong()
        {
            var phanCongs = await _phanCongRepository.GetAllPhanCongAsync();
            return Ok(phanCongs.Select(pc => new PhanCongDTO
            {
                MaDeTai = pc.MaDeTai,
                TenDeTai = pc.DeTai?.TenDeTai,
                MaSV = pc.MaSV,
                HoTenSV = pc.SinhVien?.HoTen,
                NgayPhanCong = pc.NgayPhanCong,
                MaDotDoAn = pc.MaDotDoAn,
                TenDotDoAn = pc.DotDoAn?.TenDotDoAn
            }).ToList());
        }

        [HttpGet("{maDeTai}/{maSV}")]
        public async Task<ActionResult<PhanCongDTO>> GetPhanCong(string maDeTai, string maSV)
        {
            var phanCong = await _phanCongRepository.GetPhanCongByIdAsync(maDeTai, maSV);

            if (phanCong == null)
            {
                return NotFound();
            }

            return Ok(new PhanCongDTO
            {
                MaDeTai = phanCong.MaDeTai,
                TenDeTai = phanCong.DeTai?.TenDeTai,
                MaSV = phanCong.MaSV,
                HoTenSV = phanCong.SinhVien?.HoTen,
                NgayPhanCong = phanCong.NgayPhanCong,
                MaDotDoAn = phanCong.MaDotDoAn,
                TenDotDoAn = phanCong.DotDoAn?.TenDotDoAn
            });
        }

        [HttpGet("detai/{deTaiId}")]
        public async Task<ActionResult<IEnumerable<PhanCongDTO>>> GetPhanCongsByDeTai(string deTaiId)
        {
            if (!await _deTaiRepository.DeTaiExistsAsync(deTaiId))
            {
                return NotFound($"Không tìm thấy đề tài có mã: {deTaiId}");
            }

            var phanCongs = await _phanCongRepository.GetPhanCongByDeTaiIdAsync(deTaiId);
            return Ok(phanCongs.Select(pc => new PhanCongDTO
            {
                MaDeTai = pc.MaDeTai,
                TenDeTai = pc.DeTai?.TenDeTai,
                MaSV = pc.MaSV,
                HoTenSV = pc.SinhVien?.HoTen,
                NgayPhanCong = pc.NgayPhanCong,
                MaDotDoAn = pc.MaDotDoAn,
                TenDotDoAn = pc.DotDoAn?.TenDotDoAn
            }).ToList());
        }

        [HttpGet("sinhvien/{svId}")]
        public async Task<ActionResult<IEnumerable<PhanCongDTO>>> GetPhanCongsBySinhVien(string svId)
        {
            if (!await _sinhVienRepository.SinhVienExistsAsync(svId))
            {
                return NotFound($"Không tìm thấy sinh viên có mã: {svId}");
            }

            var phanCongs = await _phanCongRepository.GetPhanCongBySinhVienIdAsync(svId);
            return Ok(phanCongs.Select(pc => new PhanCongDTO
            {
                MaDeTai = pc.MaDeTai,
                TenDeTai = pc.DeTai?.TenDeTai,
                MaSV = pc.MaSV,
                HoTenSV = pc.SinhVien?.HoTen,
                NgayPhanCong = pc.NgayPhanCong,
                MaDotDoAn = pc.MaDotDoAn,
                TenDotDoAn = pc.DotDoAn?.TenDotDoAn
            }).ToList());
        }

        [HttpGet("dotdoan/{dotDoAnId}")]
        public async Task<ActionResult<IEnumerable<PhanCongDTO>>> GetPhanCongsByDotDoAn(string dotDoAnId)
        {
            if (!await _dotDoAnRepository.DotDoAnExistsAsync(dotDoAnId))
            {
                return NotFound($"Không tìm thấy đợt đồ án có mã: {dotDoAnId}");
            }

            var phanCongs = await _phanCongRepository.GetPhanCongByDotDoAnIdAsync(dotDoAnId);
            return Ok(phanCongs.Select(pc => new PhanCongDTO
            {
                MaDeTai = pc.MaDeTai,
                TenDeTai = pc.DeTai?.TenDeTai,
                MaSV = pc.MaSV,
                HoTenSV = pc.SinhVien?.HoTen,
                NgayPhanCong = pc.NgayPhanCong,
                MaDotDoAn = pc.MaDotDoAn,
                TenDotDoAn = pc.DotDoAn?.TenDotDoAn
            }).ToList());
        }

        [HttpPost]
        public async Task<ActionResult<PhanCongDTO>> CreatePhanCong(PhanCongForCreationDTO phanCongForCreation)
        {
            if (await _phanCongRepository.PhanCongExistsAsync(phanCongForCreation.MaDeTai, phanCongForCreation.MaSV))
            {
                return Conflict($"Phân công cho đề tài '{phanCongForCreation.MaDeTai}' và sinh viên '{phanCongForCreation.MaSV}' đã tồn tại.");
            }

            if (!await _deTaiRepository.DeTaiExistsAsync(phanCongForCreation.MaDeTai))
            {
                return BadRequest($"Mã đề tài '{phanCongForCreation.MaDeTai}' không tồn tại.");
            }

            if (!await _sinhVienRepository.SinhVienExistsAsync(phanCongForCreation.MaSV))
            {
                return BadRequest($"Mã sinh viên '{phanCongForCreation.MaSV}' không tồn tại.");
            }

            if (!await _dotDoAnRepository.DotDoAnExistsAsync(phanCongForCreation.MaDotDoAn))
            {
                return BadRequest($"Mã đợt đồ án '{phanCongForCreation.MaDotDoAn}' không tồn tại.");
            }

            var phanCong = new PhanCong
            {
                MaDeTai = phanCongForCreation.MaDeTai,
                MaSV = phanCongForCreation.MaSV,
                NgayPhanCong = phanCongForCreation.NgayPhanCong ?? DateTime.Now,
                MaDotDoAn = phanCongForCreation.MaDotDoAn
            };

            _phanCongRepository.CreatePhanCong(phanCong);
            await _phanCongRepository.SaveChangesAsync();

            var phanCongDTO = await _phanCongRepository.GetPhanCongByIdAsync(phanCong.MaDeTai, phanCong.MaSV);
            return CreatedAtAction(nameof(GetPhanCong), new { maDeTai = phanCong.MaDeTai, maSV = phanCong.MaSV }, new PhanCongDTO
            {
                MaDeTai = phanCongDTO.MaDeTai,
                TenDeTai = phanCongDTO.DeTai?.TenDeTai,
                MaSV = phanCongDTO.MaSV,
                HoTenSV = phanCongDTO.SinhVien?.HoTen,
                NgayPhanCong = phanCongDTO.NgayPhanCong,
                MaDotDoAn = phanCongDTO.MaDotDoAn,
                TenDotDoAn = phanCongDTO.DotDoAn?.TenDotDoAn
            });
        }

        [HttpPut("{maDeTai}/{maSV}")]
        public async Task<IActionResult> UpdatePhanCong(string maDeTai, string maSV, PhanCongForUpdateDTO phanCongForUpdate)
        {
            if (!await _phanCongRepository.PhanCongExistsAsync(maDeTai, maSV))
            {
                return NotFound($"Không tìm thấy phân công cho đề tài '{maDeTai}' và sinh viên '{maSV}'.");
            }

            if (!await _deTaiRepository.DeTaiExistsAsync(phanCongForUpdate.MaDeTai))
            {
                return BadRequest($"Mã đề tài '{phanCongForUpdate.MaDeTai}' không tồn tại.");
            }

            if (!await _sinhVienRepository.SinhVienExistsAsync(phanCongForUpdate.MaSV))
            {
                return BadRequest($"Mã sinh viên '{phanCongForUpdate.MaSV}' không tồn tại.");
            }

            if (!await _dotDoAnRepository.DotDoAnExistsAsync(phanCongForUpdate.MaDotDoAn))
            {
                return BadRequest($"Mã đợt đồ án '{phanCongForUpdate.MaDotDoAn}' không tồn tại.");
            }

            var phanCongFromRepo = await _phanCongRepository.GetPhanCongByIdAsync(maDeTai, maSV);
            if (phanCongFromRepo == null)
            {
                return NotFound();
            }

            phanCongFromRepo.MaDeTai = phanCongForUpdate.MaDeTai;
            phanCongFromRepo.MaSV = phanCongForUpdate.MaSV;
            phanCongFromRepo.NgayPhanCong = phanCongForUpdate.NgayPhanCong;
            phanCongFromRepo.MaDotDoAn = phanCongForUpdate.MaDotDoAn;

            _phanCongRepository.UpdatePhanCong(phanCongFromRepo);
            await _phanCongRepository.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{maDeTai}/{maSV}")]
        public async Task<IActionResult> DeletePhanCong(string maDeTai, string maSV)
        {
            if (!await _phanCongRepository.PhanCongExistsAsync(maDeTai, maSV))
            {
                return NotFound($"Không tìm thấy phân công cho đề tài '{maDeTai}' và sinh viên '{maSV}'.");
            }

            var phanCong = await _phanCongRepository.GetPhanCongByIdAsync(maDeTai, maSV);
            if (phanCong == null)
            {
                return NotFound();
            }

            _phanCongRepository.DeletePhanCong(phanCong);
            await _phanCongRepository.SaveChangesAsync();

            return NoContent();
        }
    }
}