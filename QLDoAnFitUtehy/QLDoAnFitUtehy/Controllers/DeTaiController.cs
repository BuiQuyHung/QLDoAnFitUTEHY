using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.DTOs.DeTai;
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
    public class DeTaiController : ControllerBase
    {
        private readonly IDeTaiRepository _deTaiRepository;
        private readonly IGiangVienRepository _giangVienRepository;
        private readonly IDotDoAnRepository _dotDoAnRepository;
        private readonly ISinhVienRepository _sinhVienRepository;

        public DeTaiController(IDeTaiRepository deTaiRepository, IGiangVienRepository giangVienRepository, IDotDoAnRepository dotDoAnRepository, ISinhVienRepository sinhVienRepository)
        {
            _deTaiRepository = deTaiRepository;
            _giangVienRepository = giangVienRepository;
            _dotDoAnRepository = dotDoAnRepository;
            _sinhVienRepository = sinhVienRepository;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DeTaiDTO>>> GetAllDeTai()
        {
            var deTais = await _deTaiRepository.GetAllDeTaiAsync();
            return Ok(deTais.Select(dt => new DeTaiDTO
            {
                MaDeTai = dt.MaDeTai,
                TenDeTai = dt.TenDeTai,
                MoTa = dt.MoTa,
                MaGV = dt.MaGV,
                HoTenGV = dt.GiangVien?.HoTen,
                MaDotDoAn = dt.MaDotDoAn,
                TenDotDoAn = dt.DotDoAn?.TenDotDoAn,
                MaSV = dt.MaSV,
                HoTenSV = dt.SinhVien?.HoTen,
                TrangThaiDangKy = dt.TrangThaiDangKy
            }).ToList());
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DeTaiDTO>> GetDeTai(string id)
        {
            var deTai = await _deTaiRepository.GetDeTaiByIdAsync(id);

            if (deTai == null)
            {
                return NotFound();
            }

            return Ok(new DeTaiDTO
            {
                MaDeTai = deTai.MaDeTai,
                TenDeTai = deTai.TenDeTai,
                MoTa = deTai.MoTa,
                MaGV = deTai.MaGV,
                HoTenGV = deTai.GiangVien?.HoTen,
                MaDotDoAn = deTai.MaDotDoAn,
                TenDotDoAn = deTai.DotDoAn?.TenDotDoAn,
                MaSV = deTai.MaSV,
                HoTenSV = deTai.SinhVien?.HoTen,
                TrangThaiDangKy = deTai.TrangThaiDangKy
            });
        }

        [HttpGet("giangvien/{gvId}")]
        public async Task<ActionResult<IEnumerable<DeTaiDTO>>> GetDeTaisByGiangVien(string gvId)
        {
            if (!await _giangVienRepository.GiangVienExistsAsync(gvId))
            {
                return NotFound($"Không tìm thấy giảng viên có mã: {gvId}");
            }

            var deTais = await _deTaiRepository.GetDeTaiByGiangVienIdAsync(gvId);
            return Ok(deTais.Select(dt => new DeTaiDTO
            {
                MaDeTai = dt.MaDeTai,
                TenDeTai = dt.TenDeTai,
                MoTa = dt.MoTa,
                MaGV = dt.MaGV,
                HoTenGV = dt.GiangVien?.HoTen,
                MaDotDoAn = dt.MaDotDoAn,
                TenDotDoAn = dt.DotDoAn?.TenDotDoAn,
                MaSV = dt.MaSV,
                HoTenSV = dt.SinhVien?.HoTen,
                TrangThaiDangKy = dt.TrangThaiDangKy
            }).ToList());
        }

        [HttpGet("dotdoan/{dotDoAnId}")]
        public async Task<ActionResult<IEnumerable<DeTaiDTO>>> GetDeTaisByDotDoAn(string dotDoAnId)
        {
            if (!await _dotDoAnRepository.DotDoAnExistsAsync(dotDoAnId))
            {
                return NotFound($"Không tìm thấy đợt đồ án có mã: {dotDoAnId}");
            }

            var deTais = await _deTaiRepository.GetDeTaiByDotDoAnIdAsync(dotDoAnId);
            return Ok(deTais.Select(dt => new DeTaiDTO
            {
                MaDeTai = dt.MaDeTai,
                TenDeTai = dt.TenDeTai,
                MoTa = dt.MoTa,
                MaGV = dt.MaGV,
                HoTenGV = dt.GiangVien?.HoTen,
                MaDotDoAn = dt.MaDotDoAn,
                TenDotDoAn = dt.DotDoAn?.TenDotDoAn,
                MaSV = dt.MaSV,
                HoTenSV = dt.SinhVien?.HoTen,
                TrangThaiDangKy = dt.TrangThaiDangKy
            }).ToList());
        }

        [HttpGet("sinhvien/{svId}")]
        public async Task<ActionResult<DeTaiDTO>> GetDeTaiBySinhVien(string svId)
        {
            if (!await _sinhVienRepository.SinhVienExistsAsync(svId))
            {
                return NotFound($"Không tìm thấy sinh viên có mã: {svId}");
            }

            var deTais = await _deTaiRepository.GetDeTaiBySinhVienIdAsync(svId); 

            var deTai = deTais.FirstOrDefault(); 

            if (deTai == null)
            {
                return NotFound($"Không tìm thấy đề tài nào cho sinh viên có mã: {svId}");
            }

            return Ok(new DeTaiDTO
            {
                MaDeTai = deTai.MaDeTai,
                TenDeTai = deTai.TenDeTai,
                MoTa = deTai.MoTa,
                MaGV = deTai.MaGV,
                HoTenGV = deTai.GiangVien?.HoTen,
                MaDotDoAn = deTai.MaDotDoAn,
                TenDotDoAn = deTai.DotDoAn?.TenDotDoAn,
                MaSV = deTai.MaSV,
                HoTenSV = deTai.SinhVien?.HoTen,
                TrangThaiDangKy = deTai.TrangThaiDangKy
            });
        }

        [HttpPost]
        public async Task<ActionResult<DeTaiDTO>> CreateDeTai(DeTaiForCreationDTO deTaiForCreation)
        {
            if (await _deTaiRepository.DeTaiExistsAsync(deTaiForCreation.MaDeTai))
            {
                return Conflict("Mã đề tài đã tồn tại.");
            }

            if (!await _giangVienRepository.GiangVienExistsAsync(deTaiForCreation.MaGV))
            {
                return BadRequest($"Mã giảng viên '{deTaiForCreation.MaGV}' không tồn tại.");
            }

            if (!await _dotDoAnRepository.DotDoAnExistsAsync(deTaiForCreation.MaDotDoAn))
            {
                return BadRequest($"Mã đợt đồ án '{deTaiForCreation.MaDotDoAn}' không tồn tại.");
            }

            if (!string.IsNullOrEmpty(deTaiForCreation.MaSV) && !await _sinhVienRepository.SinhVienExistsAsync(deTaiForCreation.MaSV))
            {
                return BadRequest($"Mã sinh viên '{deTaiForCreation.MaSV}' không tồn tại.");
            }

            var deTai = new DeTai
            {
                MaDeTai = deTaiForCreation.MaDeTai,
                TenDeTai = deTaiForCreation.TenDeTai,
                MoTa = deTaiForCreation.MoTa,
                MaGV = deTaiForCreation.MaGV,
                MaDotDoAn = deTaiForCreation.MaDotDoAn,
                MaSV = deTaiForCreation.MaSV,
                TrangThaiDangKy = deTaiForCreation.TrangThaiDangKy
            };

            _deTaiRepository.CreateDeTai(deTai);
            await _deTaiRepository.SaveChangesAsync();

            var deTaiDTO = await _deTaiRepository.GetDeTaiByIdAsync(deTai.MaDeTai);
            return CreatedAtAction(nameof(GetDeTai), new { id = deTai.MaDeTai }, new DeTaiDTO
            {
                MaDeTai = deTaiDTO.MaDeTai,
                TenDeTai = deTaiDTO.TenDeTai,
                MoTa = deTaiDTO.MoTa,
                MaGV = deTaiDTO.MaGV,
                HoTenGV = deTaiDTO.GiangVien?.HoTen,
                MaDotDoAn = deTaiDTO.MaDotDoAn,
                TenDotDoAn = deTaiDTO.DotDoAn?.TenDotDoAn,
                MaSV = deTaiDTO.MaSV,
                HoTenSV = deTaiDTO.SinhVien?.HoTen,
                TrangThaiDangKy = deTaiDTO.TrangThaiDangKy
            });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDeTai(string id, DeTaiForUpdateDTO deTaiForUpdate)
        {
            if (!await _deTaiRepository.DeTaiExistsAsync(id))
            {
                return NotFound($"Không tìm thấy đề tài có mã: {id}");
            }

            if (!await _giangVienRepository.GiangVienExistsAsync(deTaiForUpdate.MaGV))
            {
                return BadRequest($"Mã giảng viên '{deTaiForUpdate.MaGV}' không tồn tại.");
            }

            if (!await _dotDoAnRepository.DotDoAnExistsAsync(deTaiForUpdate.MaDotDoAn))
            {
                return BadRequest($"Mã đợt đồ án '{deTaiForUpdate.MaDotDoAn}' không tồn tại.");
            }

            if (!string.IsNullOrEmpty(deTaiForUpdate.MaSV) && !await _sinhVienRepository.SinhVienExistsAsync(deTaiForUpdate.MaSV))
            {
                return BadRequest($"Mã sinh viên '{deTaiForUpdate.MaSV}' không tồn tại.");
            }

            var deTaiFromRepo = await _deTaiRepository.GetDeTaiByIdAsync(id);
            if (deTaiFromRepo == null)
            {
                return NotFound();
            }

            deTaiFromRepo.TenDeTai = deTaiForUpdate.TenDeTai;
            deTaiFromRepo.MoTa = deTaiForUpdate.MoTa;
            deTaiFromRepo.MaGV = deTaiForUpdate.MaGV;
            deTaiFromRepo.MaDotDoAn = deTaiForUpdate.MaDotDoAn;
            deTaiFromRepo.MaSV = deTaiForUpdate.MaSV;
            deTaiFromRepo.TrangThaiDangKy = deTaiForUpdate.TrangThaiDangKy;

            _deTaiRepository.UpdateDeTai(deTaiFromRepo);
            await _deTaiRepository.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDeTai(string id)
        {
            if (!await _deTaiRepository.DeTaiExistsAsync(id))
            {
                return NotFound($"Không tìm thấy đề tài có mã: {id}");
            }

            var deTai = await _deTaiRepository.GetDeTaiByIdAsync(id);
            if (deTai == null)
            {
                return NotFound();
            }

            _deTaiRepository.DeleteDeTai(deTai);
            await _deTaiRepository.SaveChangesAsync();

            return NoContent();
        }
    }
}