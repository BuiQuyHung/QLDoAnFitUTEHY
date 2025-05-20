using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.Data;
using QLDoAnFITUTEHY.Interfaces;
using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Repository
{
    public class GiangVienRepository : IGiangVienRepository
    {
        private readonly ApplicationDbContext _context;

        public GiangVienRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<GiangVien>> GetAllGiangVienAsync()
        {
            return await _context.GiangViens.ToListAsync();
        }

        public async Task<GiangVien> GetGiangVienByIdAsync(string maGV)
        {
            return await _context.GiangViens.FirstOrDefaultAsync(gv => gv.MaGV == maGV);
        }

        public void CreateGiangVien(GiangVien giangVien)
        {
            _context.GiangViens.Add(giangVien);
        }

        public void UpdateGiangVien(GiangVien giangVien)
        {
            _context.GiangViens.Update(giangVien);
        }

        public void DeleteGiangVien(GiangVien giangVien)
        {
            _context.GiangViens.Remove(giangVien);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> GiangVienExistsAsync(string maGV)
        {
            return await _context.GiangViens.AnyAsync(gv => gv.MaGV == maGV);
        }

        public async Task<IEnumerable<GiangVien>> GetGiangVienByChuyenNganhAsync(string chuyenNganh)
        {
            return await _context.GiangViens.Where(gv => gv.ChuyenNganh == chuyenNganh).ToListAsync();
        }
    }
}