using System.Linq.Expressions;
using QLDoAnFITUTEHY.Models;

namespace QLDoAnFITUTEHY.Interfaces
{
    public interface ITaiKhoanRepository
    {
        Task<IEnumerable<TaiKhoan>> GetAllAsync();
        Task<TaiKhoan?> GetByIdAsync(string id);
        Task AddAsync(TaiKhoan entity);
        void Update(TaiKhoan entity);
        void Delete(TaiKhoan entity);
        Task<bool> SaveChangesAsync();
        Task<IEnumerable<TaiKhoan>> FindAsync(Expression<Func<TaiKhoan, bool>> predicate);
        Task<TaiKhoan?> GetTaiKhoanByUsernameAsync(string username);
        Task<bool> IsUsernameExistAsync(string username);
        Task<TaiKhoan?> LoginAsync(string tenDangNhap, string matKhau);
    }
}