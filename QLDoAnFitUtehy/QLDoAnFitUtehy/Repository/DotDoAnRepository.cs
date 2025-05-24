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

        // Phương thức này sẽ lấy tất cả đợt đồ án.
        // Tùy thuộc vào yêu cầu hiển thị ở frontend (ví dụ: chỉ cần thông tin chính,
        // hay cần cả danh sách lớp/giảng viên kèm theo trong danh sách tổng quát),
        // bạn có thể Include các bảng trung gian hoặc không.
        // Tôi sẽ Include để có thể truy cập được các lớp/giảng viên liên quan.
        public async Task<IEnumerable<DotDoAn>> GetAllDotDoAnAsync()
        {
            return await _context.DotDoAns
                                 .Include(dda => dda.DotDoAn_Lops)
                                     .ThenInclude(dal => dal.Lop) // Load chi tiết Lop
                                 .Include(dda => dda.DotDoAn_GiangViens)
                                     .ThenInclude(dagv => dagv.GiangVien) // Load chi tiết GiangVien
                                 .ToListAsync();
        }

        // Lấy chi tiết một đợt đồ án theo ID, bao gồm đầy đủ thông tin lớp và giảng viên
        public async Task<DotDoAn> GetDotDoAnByIdAsync(string maDotDoAn)
        {
            return await _context.DotDoAns
                                 .Include(dda => dda.DotDoAn_Lops)
                                     .ThenInclude(dal => dal.Lop)
                                 .Include(dda => dda.DotDoAn_GiangViens)
                                     .ThenInclude(dagv => dagv.GiangVien)
                                 .FirstOrDefaultAsync(dda => dda.MaDotDoAn == maDotDoAn);
        }

        // Lấy đợt đồ án theo MaLop (truy vấn qua bảng trung gian DotDoAn_Lop)
        public async Task<IEnumerable<DotDoAn>> GetDotDoAnByLopIdAsync(string maLop)
        {
            return await _context.DotDoAn_Lop
                                 .Where(dal => dal.MaLop == maLop) // Lọc theo MaLop trong bảng trung gian
                                 .Select(dal => dal.DotDoAn) // Chọn ra đối tượng DotDoAn
                                 .Include(dda => dda.DotDoAn_Lops) // Bao gồm lại các mối quan hệ cho DotDoAn
                                     .ThenInclude(dal => dal.Lop)
                                 .Include(dda => dda.DotDoAn_GiangViens)
                                     .ThenInclude(dagv => dagv.GiangVien)
                                 .ToListAsync();
        }

        // Lấy đợt đồ án theo MaGV (truy vấn qua bảng trung gian DotDoAn_GiangVien)
        public async Task<IEnumerable<DotDoAn>> GetDotDoAnByGiangVienIdAsync(string maGV)
        {
            return await _context.DotDoAn_GiangVien
                                 .Where(dagv => dagv.MaGV == maGV) // Lọc theo MaGV trong bảng trung gian
                                 .Select(dagv => dagv.DotDoAn) // Chọn ra đối tượng DotDoAn
                                 .Include(dda => dda.DotDoAn_Lops) // Bao gồm lại các mối quan hệ cho DotDoAn
                                     .ThenInclude(dal => dal.Lop)
                                 .Include(dda => dda.DotDoAn_GiangViens)
                                     .ThenInclude(dagv => dagv.GiangVien)
                                 .ToListAsync();
        }

        // Thêm DotDoAn (DotDoAn entity giờ đã có ICollection<DotDoAn_Lop> và ICollection<DotDoAn_GiangVien>)
        public void AddDotDoAn(DotDoAn dotDoAn) // Đổi tên từ CreateDotDoAn
        {
            _context.DotDoAns.Add(dotDoAn);
            // EF Core sẽ tự động thêm các bản ghi trong DotDoAn_Lops và DotDoAn_GiangViens
            // nếu chúng được đính kèm vào đối tượng dotDoAn này khi Add.
            // Điều này cần được xử lý ở tầng Controller/Service.
        }

        // Cập nhật DotDoAn
        // Logic phức tạp hơn cần xử lý ở tầng Service hoặc Controller
        // Ở đây chỉ đánh dấu là Updated
        public void UpdateDotDoAn(DotDoAn dotDoAn)
        {
            // Để cập nhật các mối quan hệ nhiều-nhiều, logic này thường được xử lý ở tầng Service/Controller
            // bằng cách xóa các mối quan hệ cũ và thêm các mối quan hệ mới
            _context.DotDoAns.Update(dotDoAn);
        }

        // Xóa DotDoAn. Cần xóa các mối quan hệ trong bảng trung gian trước
        public void DeleteDotDoAn(DotDoAn dotDoAn)
        {
            // Xóa các bản ghi liên quan trong DotDoAn_Lop
            var relatedLops = _context.DotDoAn_Lop.Where(dal => dal.MaDotDoAn == dotDoAn.MaDotDoAn);
            _context.DotDoAn_Lop.RemoveRange(relatedLops);

            // Xóa các bản ghi liên quan trong DotDoAn_GiangVien
            var relatedGiangViens = _context.DotDoAn_GiangVien.Where(dagv => dagv.MaDotDoAn == dotDoAn.MaDotDoAn);
            _context.DotDoAn_GiangVien.RemoveRange(relatedGiangViens);

            // Sau đó mới xóa bản ghi DotDoAn chính
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