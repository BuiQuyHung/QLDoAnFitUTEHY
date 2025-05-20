using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Interfaces
{
    public interface IDeTaiRepository
    {
        Task<IEnumerable<DeTai>> GetAllDeTaiAsync();
        Task<DeTai> GetDeTaiByIdAsync(string maDeTai);
        Task<IEnumerable<DeTai>> GetDeTaiByGiangVienIdAsync(string maGV);
        Task<IEnumerable<DeTai>> GetDeTaiByDotDoAnIdAsync(string maDotDoAn);
        Task<IEnumerable<DeTai>> GetDeTaiBySinhVienIdAsync(string maSV);
        void CreateDeTai(DeTai deTai);
        void UpdateDeTai(DeTai deTai);
        void DeleteDeTai(DeTai deTai);
        Task<bool> SaveChangesAsync();
        Task<bool> DeTaiExistsAsync(string maDeTai);
    }
}