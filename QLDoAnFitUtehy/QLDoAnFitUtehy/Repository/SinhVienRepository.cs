using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.Data;
using QLDoAnFITUTEHY.Interfaces;
using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Repository
{
    public class SinhVienRepository : ISinhVienRepository
    {
        private readonly ApplicationDbContext _context;

        public SinhVienRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SinhVien>> GetAllSinhVienAsync()
        {
            return await _context.SinhViens.Include(sv => sv.Lop).ToListAsync();
        }

        public async Task<SinhVien> GetSinhVienByIdAsync(string maSV)
        {
            return await _context.SinhViens.Include(sv => sv.Lop).FirstOrDefaultAsync(sv => sv.MaSV == maSV);
        }

        public async Task<IEnumerable<SinhVien>> GetSinhVienByLopIdAsync(string maLop)
        {
            return await _context.SinhViens.Where(sv => sv.MaLop == maLop).Include(sv => sv.Lop).ToListAsync();
        }

        public void CreateSinhVien(SinhVien sinhVien)
        {
            _context.SinhViens.Add(sinhVien);
        }

        public void UpdateSinhVien(SinhVien sinhVien)
        {
            _context.SinhViens.Update(sinhVien);
        }

        public void DeleteSinhVien(SinhVien sinhVien)
        {
            _context.SinhViens.Remove(sinhVien);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> SinhVienExistsAsync(string maSV)
        {
            return await _context.SinhViens.AnyAsync(sv => sv.MaSV == maSV);
        }
    }
}