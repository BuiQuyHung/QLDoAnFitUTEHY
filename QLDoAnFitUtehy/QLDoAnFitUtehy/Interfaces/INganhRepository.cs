using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Interfaces
{
    public interface INganhRepository
    {
        Task<IEnumerable<Nganh>> GetAllNganhAsync();
        Task<Nganh> GetNganhByIdAsync(string maNganh);
        Task<IEnumerable<Nganh>> GetNganhByBoMonIdAsync(string boMonId);
        void CreateNganh(Nganh nganh);
        void UpdateNganh(Nganh nganh);
        void DeleteNganh(Nganh nganh);
        Task<bool> SaveChangesAsync();
        Task<bool> NganhExistsAsync(string maNganh);
    }
}