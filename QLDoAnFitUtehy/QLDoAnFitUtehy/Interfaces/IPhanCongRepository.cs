using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Interfaces
{
    public interface IPhanCongRepository
    {
        Task<IEnumerable<PhanCong>> GetAllPhanCongAsync();
        Task<PhanCong> GetPhanCongByIdAsync(string maDeTai, string maSV);
        Task<IEnumerable<PhanCong>> GetPhanCongByDeTaiIdAsync(string maDeTai);
        Task<IEnumerable<PhanCong>> GetPhanCongBySinhVienIdAsync(string maSV);
        Task<IEnumerable<PhanCong>> GetPhanCongByDotDoAnIdAsync(string maDotDoAn);
        void CreatePhanCong(PhanCong phanCong);
        void UpdatePhanCong(PhanCong phanCong);
        void DeletePhanCong(PhanCong phanCong);
        Task<bool> SaveChangesAsync();
        Task<bool> PhanCongExistsAsync(string maDeTai, string maSV);
    }
}