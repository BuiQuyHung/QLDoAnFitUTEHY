using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.Data;
using QLDoAnFITUTEHY.Interfaces;
using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Repository
{
    public class LopRepository : ILopRepository
    {
        private readonly ApplicationDbContext _context;

        public LopRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Lop>> GetAllLopAsync()
        {
            return await _context.Lops.Include(l => l.ChuyenNganh).ThenInclude(cn => cn.Nganh).ToListAsync();
        }

        public async Task<Lop> GetLopByIdAsync(string maLop)
        {
            return await _context.Lops.Include(l => l.ChuyenNganh).ThenInclude(cn => cn.Nganh)
                                     .FirstOrDefaultAsync(l => l.MaLop == maLop);
        }

        public async Task<IEnumerable<Lop>> GetLopByChuyenNganhIdAsync(string chuyenNganhId)
        {
            return await _context.Lops.Where(l => l.MaChuyenNganh == chuyenNganhId)
                                     .Include(l => l.ChuyenNganh).ThenInclude(cn => cn.Nganh)
                                     .ToListAsync();
        }

        public void CreateLop(Lop lop)
        {
            _context.Lops.Add(lop);
        }

        public void UpdateLop(Lop lop)
        {
            _context.Lops.Update(lop);
        }

        public void DeleteLop(Lop lop)
        {
            _context.Lops.Remove(lop);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> LopExistsAsync(string maLop)
        {
            return await _context.Lops.AnyAsync(l => l.MaLop == maLop);
        }
    }
}