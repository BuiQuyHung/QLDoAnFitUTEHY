using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Interfaces
{
    public interface IBoMonRepository
    {
        Task<IEnumerable<BoMon>> GetAllBoMonAsync();
        Task<BoMon> GetBoMonByIdAsync(string maBoMon);
        Task<IEnumerable<BoMon>> GetBoMonByKhoaIdAsync(string khoaId);
        void CreateBoMon(BoMon boMon);
        void UpdateBoMon(BoMon boMon);
        void DeleteBoMon(BoMon boMon);
        Task<bool> SaveChangesAsync();
        Task<bool> BoMonExistsAsync(string maBoMon);
    }
}