using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.Interfaces;
using QLDoAnFITUTEHY.Data;
using QLDoAnFITUTEHY.Models;
using System.Linq.Expressions;

namespace QLDoAnFITUTEHY.API.Repositories
{
    public class LogRepository : ILogRepository
    {
        protected readonly ApplicationDbContext _context;

        public LogRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Log>> GetAllAsync()
        {
            return await _context.Logs.ToListAsync();
        }

        public async Task<Log?> GetByIdAsync(int id)
        {
            return await _context.Logs.FindAsync(id);
        }

        public async Task AddAsync(Log entity)
        {
            await _context.Logs.AddAsync(entity);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<Log>> FindAsync(Expression<Func<Log, bool>> predicate)
        {
            return await _context.Logs.Where(predicate).ToListAsync();
        }

        public async Task<IEnumerable<Log>> GetLogsByUsernameAsync(string tenDangNhap)
        {
            return await _context.Logs.Where(l => l.TenDangNhap == tenDangNhap).ToListAsync();
        }

        public async Task<IEnumerable<Log>> GetLogsByTableNameAsync(string tableName)
        {
            return await _context.Logs.Where(l => l.BangBiThayDoi == tableName).ToListAsync();
        }
    }
}