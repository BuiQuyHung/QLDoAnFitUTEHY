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
            return await _context.DotDoAns
                                 .Include(dda => dda.DotDoAn_Lops)
                                     .ThenInclude(dal => dal.Lop) 
                                 .Include(dda => dda.DotDoAn_GiangViens)
                                     .ThenInclude(dagv => dagv.GiangVien) 
                                 .ToListAsync();
        }
        public async Task<DotDoAn> GetDotDoAnByIdAsync(string maDotDoAn)
        {
            return await _context.DotDoAns
                                 .Include(dda => dda.DotDoAn_Lops)
                                     .ThenInclude(dal => dal.Lop)
                                 .Include(dda => dda.DotDoAn_GiangViens)
                                     .ThenInclude(dagv => dagv.GiangVien)
                                 .FirstOrDefaultAsync(dda => dda.MaDotDoAn == maDotDoAn);
        }
        public async Task<IEnumerable<DotDoAn>> GetDotDoAnByLopIdAsync(string maLop)
        {
            return await _context.DotDoAn_Lop
                                 .Where(dal => dal.MaLop == maLop) 
                                 .Select(dal => dal.DotDoAn) 
                                 .Include(dda => dda.DotDoAn_Lops) 
                                     .ThenInclude(dal => dal.Lop)
                                 .Include(dda => dda.DotDoAn_GiangViens)
                                     .ThenInclude(dagv => dagv.GiangVien)
                                 .ToListAsync();
        }
        public async Task<IEnumerable<DotDoAn>> GetDotDoAnByGiangVienIdAsync(string maGV)
        {
            return await _context.DotDoAn_GiangVien
                                 .Where(dagv => dagv.MaGV == maGV) 
                                 .Select(dagv => dagv.DotDoAn) 
                                 .Include(dda => dda.DotDoAn_Lops) 
                                     .ThenInclude(dal => dal.Lop)
                                 .Include(dda => dda.DotDoAn_GiangViens)
                                     .ThenInclude(dagv => dagv.GiangVien)
                                 .ToListAsync();
        }
        public void AddDotDoAn(DotDoAn dotDoAn) 
        {
            _context.DotDoAns.Add(dotDoAn);
        }
        public void UpdateDotDoAn(DotDoAn dotDoAn)
        {
            _context.DotDoAns.Update(dotDoAn);
        }

        public void DeleteDotDoAn(DotDoAn dotDoAn)
        {
            var relatedLops = _context.DotDoAn_Lop.Where(dal => dal.MaDotDoAn == dotDoAn.MaDotDoAn);
            _context.DotDoAn_Lop.RemoveRange(relatedLops);

            var relatedGiangViens = _context.DotDoAn_GiangVien.Where(dagv => dagv.MaDotDoAn == dotDoAn.MaDotDoAn);
            _context.DotDoAn_GiangVien.RemoveRange(relatedGiangViens);

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