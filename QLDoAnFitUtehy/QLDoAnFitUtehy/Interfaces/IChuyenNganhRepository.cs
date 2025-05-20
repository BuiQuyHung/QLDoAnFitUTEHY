using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Interfaces
{
    public interface IChuyenNganhRepository
    {
        Task<IEnumerable<ChuyenNganh>> GetAllChuyenNganhAsync();
        Task<ChuyenNganh> GetChuyenNganhByIdAsync(string maChuyenNganh);
        Task<IEnumerable<ChuyenNganh>> GetChuyenNganhByNganhIdAsync(string nganhId);
        void CreateChuyenNganh(ChuyenNganh chuyenNganh);
        void UpdateChuyenNganh(ChuyenNganh chuyenNganh);
        void DeleteChuyenNganh(ChuyenNganh chuyenNganh);
        Task<bool> SaveChangesAsync();
        Task<bool> ChuyenNganhExistsAsync(string maChuyenNganh);
    }
}