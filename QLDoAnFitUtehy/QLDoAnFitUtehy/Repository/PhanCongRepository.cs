using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.Data;
using QLDoAnFITUTEHY.Interfaces;
using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Repository
{
    public class PhanCongRepository : IPhanCongRepository
    {
        private readonly ApplicationDbContext _context;

        public PhanCongRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PhanCong>> GetAllPhanCongAsync()
        {
            return await _context.PhanCongs
                                 .Include(pc => pc.DeTai)
                                 .Include(pc => pc.SinhVien)
                                 .Include(pc => pc.DotDoAn)
                                 .ToListAsync();
        }

        public async Task<PhanCong> GetPhanCongByIdAsync(string maDeTai, string maSV)
        {
            return await _context.PhanCongs
                                 .Include(pc => pc.DeTai)
                                 .Include(pc => pc.SinhVien)
                                 .Include(pc => pc.DotDoAn)
                                 .FirstOrDefaultAsync(pc => pc.MaDeTai == maDeTai && pc.MaSV == maSV);
        }

        public async Task<IEnumerable<PhanCong>> GetPhanCongByDeTaiIdAsync(string maDeTai)
        {
            return await _context.PhanCongs
                                 .Where(pc => pc.MaDeTai == maDeTai)
                                 .Include(pc => pc.DeTai)
                                 .Include(pc => pc.SinhVien)
                                 .Include(pc => pc.DotDoAn)
                                 .ToListAsync();
        }

        public async Task<IEnumerable<PhanCong>> GetPhanCongBySinhVienIdAsync(string maSV)
        {
            return await _context.PhanCongs
                                 .Where(pc => pc.MaSV == maSV)
                                 .Include(pc => pc.DeTai)
                                 .Include(pc => pc.SinhVien)
                                 .Include(pc => pc.DotDoAn)
                                 .ToListAsync();
        }

        public async Task<IEnumerable<PhanCong>> GetPhanCongByDotDoAnIdAsync(string maDotDoAn)
        {
            return await _context.PhanCongs
                                 .Where(pc => pc.MaDotDoAn == maDotDoAn)
                                 .Include(pc => pc.DeTai)
                                 .Include(pc => pc.SinhVien)
                                 .Include(pc => pc.DotDoAn)
                                 .ToListAsync();
        }

        public void CreatePhanCong(PhanCong phanCong)
        {
            _context.PhanCongs.Add(phanCong);
        }

        public void UpdatePhanCong(PhanCong phanCong)
        {
            _context.PhanCongs.Update(phanCong);
        }

        public void DeletePhanCong(PhanCong phanCong)
        {
            _context.PhanCongs.Remove(phanCong);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> PhanCongExistsAsync(string maDeTai, string maSV)
        {
            return await _context.PhanCongs.AnyAsync(pc => pc.MaDeTai == maDeTai && pc.MaSV == maSV);
        }
    }
}