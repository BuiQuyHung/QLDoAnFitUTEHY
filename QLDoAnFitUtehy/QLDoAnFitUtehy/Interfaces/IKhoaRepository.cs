using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Interfaces
{
    public interface IKhoaRepository
    {
        Task<IEnumerable<Khoa>> GetAllKhoaAsync();
        Task<Khoa> GetKhoaByIdAsync(string maKhoa);
        void CreateKhoa(Khoa khoa);
        void UpdateKhoa(Khoa khoa);
        void DeleteKhoa(Khoa khoa);
        Task<bool> SaveChangesAsync();
        Task<bool> KhoaExistsAsync(string maKhoa);
    }
}