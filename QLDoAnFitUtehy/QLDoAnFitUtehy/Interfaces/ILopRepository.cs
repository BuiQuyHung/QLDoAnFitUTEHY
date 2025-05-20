using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Interfaces
{
    public interface ILopRepository
    {
        Task<IEnumerable<Lop>> GetAllLopAsync();
        Task<Lop> GetLopByIdAsync(string maLop);
        Task<IEnumerable<Lop>> GetLopByChuyenNganhIdAsync(string chuyenNganhId);
        void CreateLop(Lop lop);
        void UpdateLop(Lop lop);
        void DeleteLop(Lop lop);
        Task<bool> SaveChangesAsync();
        Task<bool> LopExistsAsync(string maLop);
    }
}