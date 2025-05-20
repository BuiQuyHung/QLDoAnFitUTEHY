using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.Data;
using QLDoAnFITUTEHY.Interfaces;
using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Repository
{
    public class ThanhVienHoiDongRepository : IThanhVienHoiDongRepository
    {
        private readonly ApplicationDbContext _context;

        public ThanhVienHoiDongRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ThanhVienHoiDong>> GetAllThanhVienHoiDongAsync()
        {
            return await _context.ThanhVienHoiDongs
                .Include(tv => tv.HoiDong)
                .Include(tv => tv.GiangVien)
                .ToListAsync();
        }

        public async Task<ThanhVienHoiDong> GetThanhVienHoiDongByIdAsync(string maHoiDong, string maGV)
        {
            return await _context.ThanhVienHoiDongs
                .Include(tv => tv.HoiDong)
                .Include(tv => tv.GiangVien)
                .FirstOrDefaultAsync(tv => tv.MaHoiDong == maHoiDong && tv.MaGV == maGV);
        }

        public async Task<IEnumerable<ThanhVienHoiDong>> GetThanhVienHoiDongByHoiDongIdAsync(string maHoiDong)
        {
            return await _context.ThanhVienHoiDongs
                .Where(tv => tv.MaHoiDong == maHoiDong)
                .Include(tv => tv.HoiDong)
                .Include(tv => tv.GiangVien)
                .ToListAsync();
        }

        public async Task<IEnumerable<ThanhVienHoiDong>> GetThanhVienHoiDongByGiangVienIdAsync(string maGV)
        {
            return await _context.ThanhVienHoiDongs
               .Where(tv => tv.MaGV == maGV)
               .Include(tv => tv.HoiDong)
               .Include(tv => tv.GiangVien)
               .ToListAsync();
        }


        public void CreateThanhVienHoiDong(ThanhVienHoiDong thanhVienHoiDong)
        {
            _context.ThanhVienHoiDongs.Add(thanhVienHoiDong);
        }

        public void UpdateThanhVienHoiDong(ThanhVienHoiDong thanhVienHoiDong)
        {
            _context.ThanhVienHoiDongs.Update(thanhVienHoiDong);
        }

        public void DeleteThanhVienHoiDong(ThanhVienHoiDong thanhVienHoiDong)
        {
            _context.ThanhVienHoiDongs.Remove(thanhVienHoiDong);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> ThanhVienHoiDongExistsAsync(string maHoiDong, string maGV)
        {
            return await _context.ThanhVienHoiDongs.AnyAsync(tv => tv.MaHoiDong == maHoiDong && tv.MaGV == maGV);
        }
    }
}