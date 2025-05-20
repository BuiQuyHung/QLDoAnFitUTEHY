using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Interfaces
{
    public interface IThanhVienHoiDongRepository
    {
        Task<IEnumerable<ThanhVienHoiDong>> GetAllThanhVienHoiDongAsync();
        Task<ThanhVienHoiDong> GetThanhVienHoiDongByIdAsync(string maHoiDong, string maGV);
        Task<IEnumerable<ThanhVienHoiDong>> GetThanhVienHoiDongByHoiDongIdAsync(string maHoiDong);
        Task<IEnumerable<ThanhVienHoiDong>> GetThanhVienHoiDongByGiangVienIdAsync(string maGV);
        void CreateThanhVienHoiDong(ThanhVienHoiDong thanhVienHoiDong);
        void UpdateThanhVienHoiDong(ThanhVienHoiDong thanhVienHoiDong);
        void DeleteThanhVienHoiDong(ThanhVienHoiDong thanhVienHoiDong);
        Task<bool> SaveChangesAsync();
        Task<bool> ThanhVienHoiDongExistsAsync(string maHoiDong, string maGV);
    }
}