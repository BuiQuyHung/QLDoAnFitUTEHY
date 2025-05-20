using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.Data;
using QLDoAnFITUTEHY.Interfaces;
using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Repository
{
    public class HoiDongRepository : IHoiDongRepository
    {
        private readonly ApplicationDbContext _context;

        public HoiDongRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<HoiDong>> GetAllHoiDongAsync()
        {
            return await _context.HoiDongs
                .Include(hd => hd.DotDoAn)
                .ToListAsync();
        }

        public async Task<HoiDong> GetHoiDongByIdAsync(string maHoiDong)
        {
            return await _context.HoiDongs
                .Include(hd => hd.DotDoAn)
                .FirstOrDefaultAsync(hd => hd.MaHoiDong == maHoiDong);
        }

        public async Task<IEnumerable<HoiDong>> GetHoiDongByDotDoAnIdAsync(string maDotDoAn)
        {
            return await _context.HoiDongs
                .Where(hd => hd.MaDotDoAn == maDotDoAn)
                .Include(hd => hd.DotDoAn)
                .ToListAsync();
        }

        public void CreateHoiDong(HoiDong hoiDong)
        {
            _context.HoiDongs.Add(hoiDong);
        }

        public void UpdateHoiDong(HoiDong hoiDong)
        {
            _context.HoiDongs.Update(hoiDong);
        }

        public void DeleteHoiDong(HoiDong hoiDong)
        {
            _context.HoiDongs.Remove(hoiDong);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> HoiDongExistsAsync(string maHoiDong)
        {
            return await _context.HoiDongs.AnyAsync(hd => hd.MaHoiDong == maHoiDong);
        }
    }
}   