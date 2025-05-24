using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.API.Interfaces;
using QLDoAnFITUTEHY.Data;
using QLDoAnFITUTEHY.Models;
using System.Linq.Expressions;

namespace QLDoAnFITUTEHY.API.Repositories
{
    public class BaoCaoTienDoRepository : IBaoCaoTienDoRepository
    {
        protected readonly ApplicationDbContext _context;

        public BaoCaoTienDoRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BaoCaoTienDo>> GetAllAsync()
        {
            return await _context.BaoCaoTienDos.ToListAsync();
        }

        public async Task<BaoCaoTienDo?> GetByIdAsync(int id)
        {
            return await _context.BaoCaoTienDos.FindAsync(id);
        }

        public async Task AddAsync(BaoCaoTienDo entity)
        {
            await _context.BaoCaoTienDos.AddAsync(entity);
        }

        public void Update(BaoCaoTienDo entity)
        {
            _context.BaoCaoTienDos.Update(entity);
        }

        public void Delete(BaoCaoTienDo entity)
        {
            _context.BaoCaoTienDos.Remove(entity);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<BaoCaoTienDo>> FindAsync(Expression<Func<BaoCaoTienDo, bool>> predicate)
        {
            return await _context.BaoCaoTienDos.Where(predicate).ToListAsync();
        }

        public async Task<IEnumerable<BaoCaoTienDo>> GetReportsByStudentIdAsync(string maSV)
        {
            return await _context.BaoCaoTienDos.Where(bc => bc.MaSV == maSV).ToListAsync();
        }

        public async Task<IEnumerable<BaoCaoTienDo>> GetReportsByLecturerIdAsync(string maGV)
        {
            return await _context.BaoCaoTienDos.Where(bc => bc.MaGV == maGV).ToListAsync();
        }

        public async Task<BaoCaoTienDo?> GetReportByStudentAndDeTaiAsync(string maSV, string maDeTai)
        {
            return await _context.BaoCaoTienDos.FirstOrDefaultAsync(bc => bc.MaSV == maSV && bc.MaDeTai == maDeTai);
        }
    }
}