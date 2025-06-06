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

            var dotDoAnDTOs = dotDoAns.Select(dda => new DotDoAnDTO
            {
                MaDotDoAn = dda.MaDotDoAn,
                TenDotDoAn = dda.TenDotDoAn,
                KhoaHoc = dda.KhoaHoc,
                NgayBatDau = dda.NgayBatDau,
                NgayKetThuc = dda.NgayBatDau?.AddDays((double)(dda.SoTuanThucHien * 7 ?? 0)),
                SoTuanThucHien = dda.SoTuanThucHien,
                DsLop = dda.DotDoAn_Lops.Select(dal => new LopDto
                {
                    MaLop = dal.Lop.MaLop,
                    TenLop = dal.Lop.TenLop
                }).ToList(),
                DsGiangVien = dda.DotDoAn_GiangViens.Select(dagv => new GiangVienDto
                {
                    MaGV = dagv.GiangVien.MaGV,
                    HoTen = dagv.GiangVien.HoTen 
                }).ToList()
            }).ToList();

            return Ok(dotDoAnDTOs);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DotDoAnDTO>> GetDotDoAn(string id)
        {
            var dotDoAn = await _dotDoAnRepository.GetDotDoAnByIdAsync(id);

            if (dotDoAn == null)
            {
                return NotFound($"Không tìm thấy đợt đồ án có mã: {id}");
            }

            var dotDoAnDTO = new DotDoAnDTO
            {
                MaDotDoAn = dotDoAn.MaDotDoAn,
                TenDotDoAn = dotDoAn.TenDotDoAn,
                KhoaHoc = dotDoAn.KhoaHoc,
                NgayBatDau = dotDoAn.NgayBatDau,
                NgayKetThuc = dotDoAn.NgayBatDau?.AddDays((double)(dotDoAn.SoTuanThucHien * 7 ?? 0)),
                SoTuanThucHien = dotDoAn.SoTuanThucHien,
                DsLop = dotDoAn.DotDoAn_Lops.Select(dal => new LopDto
                {
                    MaLop = dal.Lop.MaLop,
                    TenLop = dal.Lop.TenLop
                }).ToList(),
                DsGiangVien = dotDoAn.DotDoAn_GiangViens.Select(dagv => new GiangVienDto
                {
                    MaGV = dagv.GiangVien.MaGV,
                    HoTen = dagv.GiangVien.HoTen
                }).ToList()
            };

            return Ok(dotDoAnDTO);
        }

        [HttpGet("lop/{lopId}")]
        public async Task<ActionResult<IEnumerable<DotDoAnDTO>>> GetDotDoAnsByLop(string lopId)
        {
            if (!await _lopRepository.LopExistsAsync(lopId))
            {
                return NotFound($"Không tìm thấy lớp có mã: {lopId}");
            }

            var dotDoAns = await _dotDoAnRepository.GetDotDoAnByLopIdAsync(lopId);

            var dotDoAnDTOs = dotDoAns.Select(dda => new DotDoAnDTO
            {
                MaDotDoAn = dda.MaDotDoAn,
                TenDotDoAn = dda.TenDotDoAn,
                KhoaHoc = dda.KhoaHoc,
                NgayBatDau = dda.NgayBatDau,
                NgayKetThuc = dda.NgayBatDau?.AddDays((double)(dda.SoTuanThucHien * 7 ?? 0)),
                SoTuanThucHien = dda.SoTuanThucHien,
                DsLop = dda.DotDoAn_Lops.Select(dal => new LopDto
                {
                    MaLop = dal.Lop.MaLop,
                    TenLop = dal.Lop.TenLop
                }).ToList(),
                DsGiangVien = dda.DotDoAn_GiangViens.Select(dagv => new GiangVienDto
                {
                    MaGV = dagv.GiangVien.MaGV,
                    HoTen = dagv.GiangVien.HoTen
                }).ToList()
            }).ToList();

            return Ok(dotDoAnDTOs);
        }

        [HttpGet("giangvien/{gvId}")]
        public async Task<ActionResult<IEnumerable<DotDoAnDTO>>> GetDotDoAnsByGiangVien(string gvId)
        {
            if (!await _giangVienRepository.GiangVienExistsAsync(gvId))
            {
                return NotFound($"Không tìm thấy giảng viên có mã: {gvId}");
            }

            var dotDoAns = await _dotDoAnRepository.GetDotDoAnByGiangVienIdAsync(gvId);

            var dotDoAnDTOs = dotDoAns.Select(dda => new DotDoAnDTO
            {
                MaDotDoAn = dda.MaDotDoAn,
                TenDotDoAn = dda.TenDotDoAn,
                KhoaHoc = dda.KhoaHoc,
                NgayBatDau = dda.NgayBatDau,
                NgayKetThuc = dda.NgayBatDau?.AddDays((double)(dda.SoTuanThucHien * 7 ?? 0)),
                SoTuanThucHien = dda.SoTuanThucHien,
                DsLop = dda.DotDoAn_Lops.Select(dal => new LopDto
                {
                    MaLop = dal.Lop.MaLop,
                    TenLop = dal.Lop.TenLop
                }).ToList(),
                DsGiangVien = dda.DotDoAn_GiangViens.Select(dagv => new GiangVienDto
                {
                    MaGV = dagv.GiangVien.MaGV,
                    HoTen = dagv.GiangVien.HoTen
                }).ToList()
            }).ToList();

            return Ok(dotDoAnDTOs);
        }

        [HttpPost]
        public async Task<ActionResult<DotDoAnDTO>> CreateDotDoAn(DotDoAnForCreationDTO dotDoAnForCreation)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); 
            }

            if (await _dotDoAnRepository.DotDoAnExistsAsync(dotDoAnForCreation.MaDotDoAn))
            {
                return Conflict("Mã đợt đồ án đã tồn tại.");
            }

            if (dotDoAnForCreation.LopIds != null && dotDoAnForCreation.LopIds.Any())
            {
                foreach (var lopId in dotDoAnForCreation.LopIds)
                {
                    if (!await _lopRepository.LopExistsAsync(lopId))
                    {
                        return BadRequest($"Mã lớp '{lopId}' không tồn tại.");
                    }
                }
            }
            else
            {
                return BadRequest("Phải có ít nhất một lớp cho đợt đồ án."); 
            }

            if (dotDoAnForCreation.GiangVienIds != null && dotDoAnForCreation.GiangVienIds.Any())
            {
                foreach (var gvId in dotDoAnForCreation.GiangVienIds)
                {
                    if (!await _giangVienRepository.GiangVienExistsAsync(gvId))
                    {
                        return BadRequest($"Mã giảng viên '{gvId}' không tồn tại.");
                    }
                }
            }

            var dotDoAnEntity = new DotDoAn
            {
                MaDotDoAn = dotDoAnForCreation.MaDotDoAn,
                TenDotDoAn = dotDoAnForCreation.TenDotDoAn,
                KhoaHoc = dotDoAnForCreation.KhoaHoc,
                NgayBatDau = dotDoAnForCreation.NgayBatDau,
                NgayKetThuc = dotDoAnForCreation.NgayBatDau?.AddDays((double)(dotDoAnForCreation.SoTuanThucHien * 7 ?? 0)),
                SoTuanThucHien = dotDoAnForCreation.SoTuanThucHien
            };

            if (dotDoAnForCreation.LopIds != null)
            {
                foreach (var lopId in dotDoAnForCreation.LopIds)
                {
                    dotDoAnEntity.DotDoAn_Lops.Add(new DotDoAn_Lop { MaDotDoAn = dotDoAnForCreation.MaDotDoAn, MaLop = lopId });
                }
            }

            if (dotDoAnForCreation.GiangVienIds != null)
            {
                foreach (var gvId in dotDoAnForCreation.GiangVienIds)
                {
                    dotDoAnEntity.DotDoAn_GiangViens.Add(new DotDoAn_GiangVien { MaDotDoAn = dotDoAnForCreation.MaDotDoAn, MaGV = gvId });
                }
            }

            _dotDoAnRepository.AddDotDoAn(dotDoAnEntity); 
            if (!await _dotDoAnRepository.SaveChangesAsync())
            {
                return StatusCode(500, "Lỗi khi lưu đợt đồ án.");
            }

            var createdDotDoAn = await _dotDoAnRepository.GetDotDoAnByIdAsync(dotDoAnEntity.MaDotDoAn);
            var createdDotDoAnDTO = new DotDoAnDTO
            {
                MaDotDoAn = createdDotDoAn.MaDotDoAn,
                TenDotDoAn = createdDotDoAn.TenDotDoAn,
                KhoaHoc = createdDotDoAn.KhoaHoc,
                NgayBatDau = createdDotDoAn.NgayBatDau,
                NgayKetThuc = createdDotDoAn.NgayBatDau?.AddDays((double)(createdDotDoAn.SoTuanThucHien * 7 ?? 0)),
                SoTuanThucHien = createdDotDoAn.SoTuanThucHien,
                DsLop = createdDotDoAn.DotDoAn_Lops.Select(dal => new LopDto
                {
                    MaLop = dal.Lop.MaLop,
                    TenLop = dal.Lop.TenLop
                }).ToList(),
                DsGiangVien = createdDotDoAn.DotDoAn_GiangViens.Select(dagv => new GiangVienDto
                {
                    MaGV = dagv.GiangVien.MaGV,
                    HoTen = dagv.GiangVien.HoTen
                }).ToList()
            };

            return CreatedAtAction(nameof(GetDotDoAn), new { id = createdDotDoAnDTO.MaDotDoAn }, createdDotDoAnDTO);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDotDoAn(string id, DotDoAnForUpdateDTO dotDoAnForUpdate)
        {
            if (id != dotDoAnForUpdate.MaDotDoAn) 
            {
                return BadRequest("Mã đợt đồ án trong URL không khớp với mã đợt đồ án trong nội dung.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var dotDoAnFromRepo = await _dotDoAnRepository.GetDotDoAnByIdAsync(id);
            if (dotDoAnFromRepo == null)
            {
                return NotFound($"Không tìm thấy đợt đồ án có mã: {id}");
            }

            if (dotDoAnForUpdate.LopIds != null && dotDoAnForUpdate.LopIds.Any())
            {
                foreach (var lopId in dotDoAnForUpdate.LopIds)
                {
                    if (!await _lopRepository.LopExistsAsync(lopId))
                    {
                        return BadRequest($"Mã lớp '{lopId}' không tồn tại.");
                    }
                }
            }
            else
            {
                return BadRequest("Phải có ít nhất một lớp cho đợt đồ án.");
            }

            if (dotDoAnForUpdate.GiangVienIds != null && dotDoAnForUpdate.GiangVienIds.Any())
            {
                foreach (var gvId in dotDoAnForUpdate.GiangVienIds)
                {
                    if (!await _giangVienRepository.GiangVienExistsAsync(gvId))
                    {
                        return BadRequest($"Mã giảng viên '{gvId}' không tồn tại.");
                    }
                }
            }

            dotDoAnFromRepo.TenDotDoAn = dotDoAnForUpdate.TenDotDoAn;
            dotDoAnFromRepo.KhoaHoc = dotDoAnForUpdate.KhoaHoc;
            dotDoAnFromRepo.NgayBatDau = dotDoAnForUpdate.NgayBatDau;
            dotDoAnFromRepo.NgayKetThuc = dotDoAnForUpdate.NgayBatDau?.AddDays((double)(dotDoAnForUpdate.SoTuanThucHien * 7 ?? 0));
            dotDoAnFromRepo.SoTuanThucHien = dotDoAnForUpdate.SoTuanThucHien;

            var currentLops = dotDoAnFromRepo.DotDoAn_Lops.ToList(); 
            foreach (var existingLop in currentLops)
            {
                if (!dotDoAnForUpdate.LopIds.Contains(existingLop.MaLop))
                {
                    dotDoAnFromRepo.DotDoAn_Lops.Remove(existingLop);
                }
            }

            foreach (var newLopId in dotDoAnForUpdate.LopIds)
            {
                if (!dotDoAnFromRepo.DotDoAn_Lops.Any(dal => dal.MaLop == newLopId))
                {
                    dotDoAnFromRepo.DotDoAn_Lops.Add(new DotDoAn_Lop { MaDotDoAn = id, MaLop = newLopId });
                }
            }

            var currentGiangViens = dotDoAnFromRepo.DotDoAn_GiangViens.ToList();
            foreach (var existingGiangVien in currentGiangViens)
            {
                if (!dotDoAnForUpdate.GiangVienIds.Contains(existingGiangVien.MaGV))
                {
                    dotDoAnFromRepo.DotDoAn_GiangViens.Remove(existingGiangVien);
                }
            }
            foreach (var newGvId in dotDoAnForUpdate.GiangVienIds)
            {
                if (!dotDoAnFromRepo.DotDoAn_GiangViens.Any(dagv => dagv.MaGV == newGvId))
                {
                    dotDoAnFromRepo.DotDoAn_GiangViens.Add(new DotDoAn_GiangVien { MaDotDoAn = id, MaGV = newGvId });
                }
            }

            _dotDoAnRepository.UpdateDotDoAn(dotDoAnFromRepo);
            if (!await _dotDoAnRepository.SaveChangesAsync())
            {
                return StatusCode(500, "Lỗi khi lưu cập nhật đợt đồ án.");
            }

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDotDoAn(string id)
        {
            var dotDoAnToDelete = await _dotDoAnRepository.GetDotDoAnByIdAsync(id);
            if (dotDoAnToDelete == null)
            {
                return NotFound($"Không tìm thấy đợt đồ án có mã: {id}");
            }
            _dotDoAnRepository.DeleteDotDoAn(dotDoAnToDelete);
            if (!await _dotDoAnRepository.SaveChangesAsync())
            {
                return StatusCode(500, "Lỗi khi xóa đợt đồ án.");
            }
            return NoContent();
        }
    }
}