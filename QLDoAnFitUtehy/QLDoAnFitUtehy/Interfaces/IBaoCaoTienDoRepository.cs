using QLDoAnFITUTEHY.Models;
using System.Linq.Expressions;

namespace QLDoAnFITUTEHY.API.Interfaces
{
    public interface IBaoCaoTienDoRepository
    {
        Task<IEnumerable<BaoCaoTienDo>> GetAllAsync();
        Task<BaoCaoTienDo?> GetByIdAsync(int id);
        Task AddAsync(BaoCaoTienDo entity);
        void Update(BaoCaoTienDo entity);
        void Delete(BaoCaoTienDo entity);
        Task<bool> SaveChangesAsync();
        Task<IEnumerable<BaoCaoTienDo>> FindAsync(Expression<Func<BaoCaoTienDo, bool>> predicate);
        Task<IEnumerable<BaoCaoTienDo>> GetReportsByStudentIdAsync(string maSV);
        Task<IEnumerable<BaoCaoTienDo>> GetReportsByLecturerIdAsync(string maGV);
        Task<BaoCaoTienDo?> GetReportByStudentAndDeTaiAsync(string maSV, string maDeTai);
    }
}