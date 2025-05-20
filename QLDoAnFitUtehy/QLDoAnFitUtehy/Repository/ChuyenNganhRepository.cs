using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.Data;
using QLDoAnFITUTEHY.Interfaces;
using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Repository
{
    public class ChuyenNganhRepository : IChuyenNganhRepository
    {
        private readonly ApplicationDbContext _context;

        public ChuyenNganhRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ChuyenNganh>> GetAllChuyenNganhAsync()
        {
            return await _context.ChuyenNganhs.Include(cn => cn.Nganh).ToListAsync();
        }

        public async Task<ChuyenNganh> GetChuyenNganhByIdAsync(string maChuyenNganh)
        {
            return await _context.ChuyenNganhs.Include(cn => cn.Nganh).FirstOrDefaultAsync(cn => cn.MaChuyenNganh == maChuyenNganh);
        }

        public async Task<IEnumerable<ChuyenNganh>> GetChuyenNganhByNganhIdAsync(string nganhId)
        {
            return await _context.ChuyenNganhs.Where(cn => cn.MaNganh == nganhId).Include(cn => cn.Nganh).ToListAsync();
        }

        public void CreateChuyenNganh(ChuyenNganh chuyenNganh)
        {
            _context.ChuyenNganhs.Add(chuyenNganh);
        }

        public void UpdateChuyenNganh(ChuyenNganh chuyenNganh)
        {
            _context.ChuyenNganhs.Update(chuyenNganh);
        }

        public void DeleteChuyenNganh(ChuyenNganh chuyenNganh)
        {
            _context.ChuyenNganhs.Remove(chuyenNganh);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> ChuyenNganhExistsAsync(string maChuyenNganh)
        {
            return await _context.ChuyenNganhs.AnyAsync(cn => cn.MaChuyenNganh == maChuyenNganh);
        }
    }
}