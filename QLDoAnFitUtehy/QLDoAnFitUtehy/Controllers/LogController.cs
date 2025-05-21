using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using QLDoAnFITUTEHY.DTOs.Log;
using QLDoAnFITUTEHY.Interfaces;
using QLDoAnFITUTEHY.Models;

namespace QLDoAnFITUTEHY.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize(Roles = "Admin")] 
    public class LogController : ControllerBase
    {
        private readonly ILogRepository _logRepository;

        public LogController(ILogRepository logRepository)
        {
            _logRepository = logRepository;
        }

        [HttpGet]
        // [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<LogDto>>> GetAllLogs()
        {
            var logs = await _logRepository.GetAllAsync();
            var logDtos = new List<LogDto>();

            foreach (var log in logs)
            {
                logDtos.Add(new LogDto
                {
                    MaLog = log.MaLog,
                    TenDangNhap = log.TenDangNhap,
                    ThoiGian = log.ThoiGian,
                    HanhDong = log.HanhDong,
                    BangBiThayDoi = log.BangBiThayDoi,
                    MoTaChiTiet = log.MoTaChiTiet
                });
            }
            return Ok(logDtos);
        }

        [HttpGet("{id}")]
        // [Authorize(Roles = "Admin")]
        public async Task<ActionResult<LogDto>> GetLogById(int id)
        {
            var log = await _logRepository.GetByIdAsync(id);
            if (log == null)
            {
                return NotFound($"Không tìm thấy Log với mã: {id}");
            }

            var logDto = new LogDto
            {
                MaLog = log.MaLog,
                TenDangNhap = log.TenDangNhap,
                ThoiGian = log.ThoiGian,
                HanhDong = log.HanhDong,
                BangBiThayDoi = log.BangBiThayDoi,
                MoTaChiTiet = log.MoTaChiTiet
            };
            return Ok(logDto);
        }

        [HttpGet("byUsername/{username}")]
        // [Authorize(Roles = "Admin")] 
        public async Task<ActionResult<IEnumerable<LogDto>>> GetLogsByUsername(string username)
        {
            var logs = await _logRepository.GetLogsByUsernameAsync(username);
            var logDtos = new List<LogDto>();

            foreach (var log in logs)
            {
                logDtos.Add(new LogDto
                {
                    MaLog = log.MaLog,
                    TenDangNhap = log.TenDangNhap,
                    ThoiGian = log.ThoiGian,
                    HanhDong = log.HanhDong,
                    BangBiThayDoi = log.BangBiThayDoi,
                    MoTaChiTiet = log.MoTaChiTiet
                });
            }
            return Ok(logDtos);
        }

        [HttpGet("byTableName/{tableName}")]
        // [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<LogDto>>> GetLogsByTableName(string tableName)
        {
            var logs = await _logRepository.GetLogsByTableNameAsync(tableName);
            var logDtos = new List<LogDto>();

            foreach (var log in logs)
            {
                logDtos.Add(new LogDto
                {
                    MaLog = log.MaLog,
                    TenDangNhap = log.TenDangNhap,
                    ThoiGian = log.ThoiGian,
                    HanhDong = log.HanhDong,
                    BangBiThayDoi = log.BangBiThayDoi,
                    MoTaChiTiet = log.MoTaChiTiet
                });
            }
            return Ok(logDtos);
        }

        [HttpPost]
        // [Authorize(Roles = "Admin")] 
        public async Task<ActionResult<LogDto>> CreateLog([FromBody] LogCreateDto logCreateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var log = new Log
            {
                TenDangNhap = logCreateDto.TenDangNhap,
                HanhDong = logCreateDto.HanhDong,
                BangBiThayDoi = logCreateDto.BangBiThayDoi,
                MoTaChiTiet = logCreateDto.MoTaChiTiet,
                ThoiGian = DateTime.Now 
            };

            await _logRepository.AddAsync(log);
            if (!await _logRepository.SaveChangesAsync())
            {
                return StatusCode(500, "Lỗi khi tạo Log mới.");
            }

            var logDto = new LogDto
            {
                MaLog = log.MaLog,
                TenDangNhap = log.TenDangNhap,
                ThoiGian = log.ThoiGian,
                HanhDong = log.HanhDong,
                BangBiThayDoi = log.BangBiThayDoi,
                MoTaChiTiet = log.MoTaChiTiet
            };

            return CreatedAtAction(nameof(GetLogById), new { id = logDto.MaLog }, logDto);
        }
    }
}