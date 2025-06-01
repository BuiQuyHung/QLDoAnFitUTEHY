// Interfaces/IBaoCaoTienDoRepository.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using QLDoAnFITUTEHY.Models; // Sử dụng Model đã nằm trong namespace

namespace QLDoAnFITUTEHY.Interfaces
{
    public interface IBaoCaoTienDoRepository
    {
        Task<IEnumerable<BaoCaoTienDo>> GetAllBaoCaoTienDosAsync();
        Task<BaoCaoTienDo> GetBaoCaoTienDoByIdAsync(int id);
        Task AddBaoCaoTienDoAsync(BaoCaoTienDo baoCao);
        Task UpdateBaoCaoTienDoAsync(BaoCaoTienDo baoCao);
        Task DeleteBaoCaoTienDoAsync(int id);

        Task<IEnumerable<BaoCaoTienDo>> GetBaoCaoBySinhVienAndDeTaiAsync(string maSV, string maDeTai);
        Task<IEnumerable<BaoCaoTienDo>> GetBaoCaoByGiangVienAsync(string maGV);
        Task<bool> BaoCaoTienDoExists(int id);
    }
}