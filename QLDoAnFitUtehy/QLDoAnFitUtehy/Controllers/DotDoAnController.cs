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
        private readonly ILopRepository _lopRepository; // Cần thiết để kiểm tra Lop tồn tại
        private readonly IGiangVienRepository _giangVienRepository; // Cần thiết để kiểm tra GiangVien tồn tại

        public DotDoAnController(IDotDoAnRepository dotDoAnRepository, ILopRepository lopRepository, IGiangVienRepository giangVienRepository)
        {
            _dotDoAnRepository = dotDoAnRepository;
            _lopRepository = lopRepository;
            _giangVienRepository = giangVienRepository;
        }

        // GET: api/DotDoAn
        // Lấy tất cả đợt đồ án
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
                // Tính toán NgayKetThuc nếu có NgayBatDau và SoTuanThucHien
                NgayKetThuc = dda.NgayBatDau?.AddDays((double)(dda.SoTuanThucHien * 7 ?? 0)),
                SoTuanThucHien = dda.SoTuanThucHien,
                // Mapping danh sách các lớp và giảng viên từ các bảng trung gian
                DsLop = dda.DotDoAn_Lops.Select(dal => new LopDto
                {
                    MaLop = dal.Lop.MaLop,
                    TenLop = dal.Lop.TenLop
                }).ToList(),
                DsGiangVien = dda.DotDoAn_GiangViens.Select(dagv => new GiangVienDto
                {
                    MaGV = dagv.GiangVien.MaGV,
                    HoTen = dagv.GiangVien.HoTen // Đảm bảo thuộc tính này tồn tại trong GiangVien model
                }).ToList()
            }).ToList();

            return Ok(dotDoAnDTOs);
        }

        // GET: api/DotDoAn/{id}
        // Lấy một đợt đồ án theo ID
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
                // Tính toán NgayKetThuc
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

        // GET: api/DotDoAn/lop/{lopId}
        // Lấy các đợt đồ án theo LopId
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

        // GET: api/DotDoAn/giangvien/{gvId}
        // Lấy các đợt đồ án theo GiangVienId
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

        // POST: api/DotDoAn
        // Tạo mới một đợt đồ án
        [HttpPost]
        public async Task<ActionResult<DotDoAnDTO>> CreateDotDoAn(DotDoAnForCreationDTO dotDoAnForCreation)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState); // Trả về lỗi validation từ DTO
            }

            // Kiểm tra trùng mã đợt đồ án
            if (await _dotDoAnRepository.DotDoAnExistsAsync(dotDoAnForCreation.MaDotDoAn))
            {
                return Conflict("Mã đợt đồ án đã tồn tại.");
            }

            // Kiểm tra sự tồn tại của các mã lớp được gửi lên
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
                return BadRequest("Phải có ít nhất một lớp cho đợt đồ án."); // Yêu cầu từ [Required] trong DTO
            }

            // Kiểm tra sự tồn tại của các mã giảng viên được gửi lên (nếu có)
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

            // Tạo đối tượng DotDoAn từ DTO
            var dotDoAnEntity = new DotDoAn
            {
                MaDotDoAn = dotDoAnForCreation.MaDotDoAn,
                TenDotDoAn = dotDoAnForCreation.TenDotDoAn,
                KhoaHoc = dotDoAnForCreation.KhoaHoc,
                NgayBatDau = dotDoAnForCreation.NgayBatDau,
                // NgayKetThuc sẽ được tính toán hoặc để null nếu không cần lưu trực tiếp
                NgayKetThuc = dotDoAnForCreation.NgayBatDau?.AddDays((double)(dotDoAnForCreation.SoTuanThucHien * 7 ?? 0)),
                SoTuanThucHien = dotDoAnForCreation.SoTuanThucHien
            };

            // Tạo các mối quan hệ với Lop
            if (dotDoAnForCreation.LopIds != null)
            {
                foreach (var lopId in dotDoAnForCreation.LopIds)
                {
                    dotDoAnEntity.DotDoAn_Lops.Add(new DotDoAn_Lop { MaDotDoAn = dotDoAnForCreation.MaDotDoAn, MaLop = lopId });
                }
            }

            // Tạo các mối quan hệ với GiangVien
            if (dotDoAnForCreation.GiangVienIds != null)
            {
                foreach (var gvId in dotDoAnForCreation.GiangVienIds)
                {
                    dotDoAnEntity.DotDoAn_GiangViens.Add(new DotDoAn_GiangVien { MaDotDoAn = dotDoAnForCreation.MaDotDoAn, MaGV = gvId });
                }
            }

            // Thêm đợt đồ án vào repository
            _dotDoAnRepository.AddDotDoAn(dotDoAnEntity); // Đổi từ CreateDotDoAn thành AddDotDoAn
            if (!await _dotDoAnRepository.SaveChangesAsync())
            {
                return StatusCode(500, "Lỗi khi lưu đợt đồ án.");
            }

            // Lấy lại đợt đồ án vừa tạo để trả về DTO đầy đủ thông tin
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

        // PUT: api/DotDoAn/{id}
        // Cập nhật một đợt đồ án
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDotDoAn(string id, DotDoAnForUpdateDTO dotDoAnForUpdate)
        {
            if (id != dotDoAnForUpdate.MaDotDoAn) // Đảm bảo ID trong URL khớp với ID trong body
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

            // Kiểm tra sự tồn tại của các mã lớp được gửi lên
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

            // Kiểm tra sự tồn tại của các mã giảng viên được gửi lên (nếu có)
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

            // Cập nhật các thuộc tính cơ bản của DotDoAn
            dotDoAnFromRepo.TenDotDoAn = dotDoAnForUpdate.TenDotDoAn;
            dotDoAnFromRepo.KhoaHoc = dotDoAnForUpdate.KhoaHoc;
            dotDoAnFromRepo.NgayBatDau = dotDoAnForUpdate.NgayBatDau;
            dotDoAnFromRepo.NgayKetThuc = dotDoAnForUpdate.NgayBatDau?.AddDays((double)(dotDoAnForUpdate.SoTuanThucHien * 7 ?? 0));
            dotDoAnFromRepo.SoTuanThucHien = dotDoAnForUpdate.SoTuanThucHien;

            // Xử lý cập nhật các mối quan hệ Lop
            // Xóa các mối quan hệ Lop cũ không còn tồn tại trong LopIds mới
            var currentLops = dotDoAnFromRepo.DotDoAn_Lops.ToList(); // ToList để tránh lỗi khi sửa đổi collection
            foreach (var existingLop in currentLops)
            {
                if (!dotDoAnForUpdate.LopIds.Contains(existingLop.MaLop))
                {
                    dotDoAnFromRepo.DotDoAn_Lops.Remove(existingLop);
                }
            }
            // Thêm các mối quan hệ Lop mới
            foreach (var newLopId in dotDoAnForUpdate.LopIds)
            {
                if (!dotDoAnFromRepo.DotDoAn_Lops.Any(dal => dal.MaLop == newLopId))
                {
                    dotDoAnFromRepo.DotDoAn_Lops.Add(new DotDoAn_Lop { MaDotDoAn = id, MaLop = newLopId });
                }
            }

            // Xử lý cập nhật các mối quan hệ GiangVien (tương tự Lop)
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

            // Cập nhật entity chính
            _dotDoAnRepository.UpdateDotDoAn(dotDoAnFromRepo);
            if (!await _dotDoAnRepository.SaveChangesAsync())
            {
                return StatusCode(500, "Lỗi khi lưu cập nhật đợt đồ án.");
            }

            return NoContent();
        }

        // DELETE: api/DotDoAn/{id}
        // Xóa một đợt đồ án
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDotDoAn(string id)
        {
            var dotDoAnToDelete = await _dotDoAnRepository.GetDotDoAnByIdAsync(id);
            if (dotDoAnToDelete == null)
            {
                return NotFound($"Không tìm thấy đợt đồ án có mã: {id}");
            }

            // Logic xóa các mối quan hệ trung gian đã được xử lý trong DotDoAnRepository.DeleteDotDoAn()
            _dotDoAnRepository.DeleteDotDoAn(dotDoAnToDelete);
            if (!await _dotDoAnRepository.SaveChangesAsync())
            {
                return StatusCode(500, "Lỗi khi xóa đợt đồ án.");
            }

            return NoContent();
        }
    }
}