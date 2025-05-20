using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.Data;
using QLDoAnFITUTEHY.Interfaces;
using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Repository
{
    public class NganhRepository : INganhRepository
    {
        private readonly ApplicationDbContext _context;

        public NganhRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Nganh>> GetAllNganhAsync()
        {
            return await _context.Nganhs.Include(n => n.BoMon).ToListAsync();
        }

        public async Task<Nganh> GetNganhByIdAsync(string maNganh)
        {
            return await _context.Nganhs.Include(n => n.BoMon).FirstOrDefaultAsync(n => n.MaNganh == maNganh);
        }

        public async Task<IEnumerable<Nganh>> GetNganhByBoMonIdAsync(string boMonId)
        {
            return await _context.Nganhs.Where(n => n.MaBoMon == boMonId).Include(n => n.BoMon).ToListAsync();
        }

        public void CreateNganh(Nganh nganh)
        {
            _context.Nganhs.Add(nganh);
        }

        public void UpdateNganh(Nganh nganh)
        {
            _context.Nganhs.Update(nganh);
        }

        public void DeleteNganh(Nganh nganh)
        {
            _context.Nganhs.Remove(nganh);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> NganhExistsAsync(string maNganh)
        {
            return await _context.Nganhs.AnyAsync(n => n.MaNganh == maNganh);
        }
    }
}