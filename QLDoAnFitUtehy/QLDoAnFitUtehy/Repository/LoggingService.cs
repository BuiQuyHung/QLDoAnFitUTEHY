
using QLDoAnFITUTEHY.Models;
using QLDoAnFITUTEHY.Interfaces; 
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Repository 
{
    public class LoggingService : ILoggingService
    {
        private readonly ILogRepository _logRepository;

        public LoggingService(ILogRepository logRepository)
        {
            _logRepository = logRepository;
        }

        public async Task LogAction(string tenDangNhap, string hanhDong, string bangBiThayDoi, string? moTaChiTiet = null)
        {
            var logEntry = new Log
            {
                TenDangNhap = tenDangNhap,
                ThoiGian = DateTime.Now,
                HanhDong = hanhDong,
                BangBiThayDoi = bangBiThayDoi,
                MoTaChiTiet = moTaChiTiet
            };

            await _logRepository.AddAsync(logEntry);
            await _logRepository.SaveChangesAsync();
        }
    }
}