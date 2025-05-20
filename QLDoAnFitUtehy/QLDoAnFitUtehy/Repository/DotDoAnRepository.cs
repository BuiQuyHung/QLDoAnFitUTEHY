using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.Data;
using QLDoAnFITUTEHY.Interfaces;
using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Repository
{
    public class DotDoAnRepository : IDotDoAnRepository
    {
        private readonly ApplicationDbContext _context;

        public DotDoAnRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<DotDoAn>> GetAllDotDoAnAsync()
        {
            return await _context.DotDoAns.Include(dda => dda.Lop).Include(dda => dda.GiangVien).ToListAsync();
        }

        public async Task<DotDoAn> GetDotDoAnByIdAsync(string maDotDoAn)
        {
            return await _context.DotDoAns.Include(dda => dda.Lop).Include(dda => dda.GiangVien)
                                         .FirstOrDefaultAsync(dda => dda.MaDotDoAn == maDotDoAn);
        }

        public async Task<IEnumerable<DotDoAn>> GetDotDoAnByLopIdAsync(string maLop)
        {
            return await _context.DotDoAns.Where(dda => dda.MaLop == maLop)
                                         .Include(dda => dda.Lop).Include(dda => dda.GiangVien).ToListAsync();
        }

        public async Task<IEnumerable<DotDoAn>> GetDotDoAnByGiangVienIdAsync(string maGV)
        {
            return await _context.DotDoAns.Where(dda => dda.MaGV == maGV)
                                         .Include(dda => dda.Lop).Include(dda => dda.GiangVien).ToListAsync();
        }

        public void CreateDotDoAn(DotDoAn dotDoAn)
        {
            _context.DotDoAns.Add(dotDoAn);
        }

        public void UpdateDotDoAn(DotDoAn dotDoAn)
        {
            _context.DotDoAns.Update(dotDoAn);
        }

        public void DeleteDotDoAn(DotDoAn dotDoAn)
        {
            _context.DotDoAns.Remove(dotDoAn);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DotDoAnExistsAsync(string maDotDoAn)
        {
            return await _context.DotDoAns.AnyAsync(dda => dda.MaDotDoAn == maDotDoAn);
        }
    }
}