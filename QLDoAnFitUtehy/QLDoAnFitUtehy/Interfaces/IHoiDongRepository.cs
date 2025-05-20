using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Interfaces
{
    public interface IHoiDongRepository
    {
        Task<IEnumerable<HoiDong>> GetAllHoiDongAsync();
        Task<HoiDong> GetHoiDongByIdAsync(string maHoiDong);
        Task<IEnumerable<HoiDong>> GetHoiDongByDotDoAnIdAsync(string maDotDoAn);
        void CreateHoiDong(HoiDong hoiDong);
        void UpdateHoiDong(HoiDong hoiDong);
        void DeleteHoiDong(HoiDong hoiDong);
        Task<bool> SaveChangesAsync();
        Task<bool> HoiDongExistsAsync(string maHoiDong);
    }
}