using QLDoAnFITUTEHY.Models;
using System.Linq.Expressions;

namespace QLDoAnFITUTEHY.Interfaces
{
    public interface ILogRepository
    {
        Task<IEnumerable<Log>> GetAllAsync();
        Task<Log?> GetByIdAsync(int id);
        Task AddAsync(Log entity);
        Task<bool> SaveChangesAsync();
        Task<IEnumerable<Log>> FindAsync(Expression<Func<Log, bool>> predicate);
        Task<IEnumerable<Log>> GetLogsByUsernameAsync(string tenDangNhap);
        Task<IEnumerable<Log>> GetLogsByTableNameAsync(string tableName);
    }
}