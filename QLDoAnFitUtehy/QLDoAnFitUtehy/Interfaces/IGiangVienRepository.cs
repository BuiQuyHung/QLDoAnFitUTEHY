using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Interfaces
{
    public interface IGiangVienRepository
    {
        Task<IEnumerable<GiangVien>> GetAllGiangVienAsync();
        Task<GiangVien> GetGiangVienByIdAsync(string maGV);
        void CreateGiangVien(GiangVien giangVien);
        void UpdateGiangVien(GiangVien giangVien);
        void DeleteGiangVien(GiangVien giangVien);
        Task<bool> SaveChangesAsync();
        Task<bool> GiangVienExistsAsync(string maGV);
        Task<IEnumerable<GiangVien>> GetGiangVienByChuyenNganhAsync(string chuyenNganh);
    }
}