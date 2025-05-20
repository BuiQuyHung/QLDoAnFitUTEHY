using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Interfaces
{
    public interface ISinhVienRepository
    {
        Task<IEnumerable<SinhVien>> GetAllSinhVienAsync();
        Task<SinhVien> GetSinhVienByIdAsync(string maSV);
        Task<IEnumerable<SinhVien>> GetSinhVienByLopIdAsync(string maLop);
        void CreateSinhVien(SinhVien sinhVien);
        void UpdateSinhVien(SinhVien sinhVien);
        void DeleteSinhVien(SinhVien sinhVien);
        Task<bool> SaveChangesAsync();
        Task<bool> SinhVienExistsAsync(string maSV);
    }
}