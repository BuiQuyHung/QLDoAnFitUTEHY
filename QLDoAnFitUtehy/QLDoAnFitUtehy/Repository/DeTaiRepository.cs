using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.Data;
using QLDoAnFITUTEHY.Interfaces;
using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Repository
{
    public class DeTaiRepository : IDeTaiRepository
    {
        private readonly ApplicationDbContext _context;

        public DeTaiRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<DeTai>> GetAllDeTaiAsync()
        {
            return await _context.DeTais
                                 .Include(dt => dt.GiangVien)
                                 .Include(dt => dt.DotDoAn)
                                 .Include(dt => dt.SinhVien)
                                 .ToListAsync();
        }

        public async Task<DeTai> GetDeTaiByIdAsync(string maDeTai)
        {
            return await _context.DeTais
                                 .Include(dt => dt.GiangVien)
                                 .Include(dt => dt.DotDoAn)
                                 .Include(dt => dt.SinhVien)
                                 .FirstOrDefaultAsync(dt => dt.MaDeTai == maDeTai);
        }

        public async Task<IEnumerable<DeTai>> GetDeTaiByGiangVienIdAsync(string maGV)
        {
            return await _context.DeTais
                                 .Where(dt => dt.MaGV == maGV)
                                 .Include(dt => dt.GiangVien)
                                 .Include(dt => dt.DotDoAn)
                                 .Include(dt => dt.SinhVien)
                                 .ToListAsync();
        }

        public async Task<IEnumerable<DeTai>> GetDeTaiByDotDoAnIdAsync(string maDotDoAn)
        {
            return await _context.DeTais
                                 .Where(dt => dt.MaDotDoAn == maDotDoAn)
                                 .Include(dt => dt.GiangVien)
                                 .Include(dt => dt.DotDoAn)
                                 .Include(dt => dt.SinhVien)
                                 .ToListAsync();
        }

        public async Task<IEnumerable<DeTai>> GetDeTaiBySinhVienIdAsync(string maSV)
        {
            return await _context.DeTais
                                 .Where(dt => dt.MaSV == maSV)
                                 .Include(dt => dt.GiangVien)
                                 .Include(dt => dt.DotDoAn)
                                 .Include(dt => dt.SinhVien)
                                 .ToListAsync();
        }

        public void CreateDeTai(DeTai deTai)
        {
            _context.DeTais.Add(deTai);
        }

        public void UpdateDeTai(DeTai deTai)
        {
            _context.DeTais.Update(deTai);
        }

        public void DeleteDeTai(DeTai deTai)
        {
            _context.DeTais.Remove(deTai);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeTaiExistsAsync(string maDeTai)
        {
            return await _context.DeTais.AnyAsync(dt => dt.MaDeTai == maDeTai);
        }
    }
}