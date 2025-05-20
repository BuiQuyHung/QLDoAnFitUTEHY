using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.Data;
using QLDoAnFITUTEHY.Interfaces;
using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Repository
{
    public class KhoaRepository : IKhoaRepository
    {
        private readonly ApplicationDbContext _context;

        public KhoaRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Khoa>> GetAllKhoaAsync()
        {
            return await _context.Khoas.ToListAsync();
        }

        public async Task<Khoa> GetKhoaByIdAsync(string maKhoa)
        {
            return await _context.Khoas.FirstOrDefaultAsync(k => k.MaKhoa == maKhoa);
        }

        public void CreateKhoa(Khoa khoa)
        {
            _context.Khoas.Add(khoa);
        }

        public void UpdateKhoa(Khoa khoa)
        {
            _context.Khoas.Update(khoa);
        }

        public void DeleteKhoa(Khoa khoa)
        {
            _context.Khoas.Remove(khoa);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> KhoaExistsAsync(string maKhoa)
        {
            return await _context.Khoas.AnyAsync(k => k.MaKhoa == maKhoa);
        }
    }
}