using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Interfaces
{
    public interface IDotDoAnRepository
    {
        // Lấy tất cả đợt đồ án (có thể bao gồm cả lớp và giảng viên nếu cần ở view list)
        Task<IEnumerable<DotDoAn>> GetAllDotDoAnAsync();

        // Lấy chi tiết một đợt đồ án theo ID (bao gồm đầy đủ thông tin lớp và giảng viên)
        // Chúng ta sẽ cần Load các Navigation Properties (DotDoAn_Lops, DotDoAn_GiangViens)
        Task<DotDoAn> GetDotDoAnByIdAsync(string maDotDoAn);

        // Lấy đợt đồ án theo LopId:
        // Cần thay đổi logic để truy vấn qua bảng trung gian DotDoAn_Lop
        Task<IEnumerable<DotDoAn>> GetDotDoAnByLopIdAsync(string maLop);

        // Lấy đợt đồ án theo GiangVienId:
        // Cần thay đổi logic để truy vấn qua bảng trung gian DotDoAn_GiangVien
        Task<IEnumerable<DotDoAn>> GetDotDoAnByGiangVienIdAsync(string maGV);

        // --- CÁC PHƯƠNG THỨC THAY ĐỔI ĐỂ PHẢN ÁNH CẤU TRÚC MỚI ---

        // Tạo mới một đợt đồ án.
        // Phương thức này sẽ nhận một đối tượng DotDoAn đã được khởi tạo sẵn (bao gồm cả các collections)
        void AddDotDoAn(DotDoAn dotDoAn); // Đổi tên từ CreateDotDoAn thành AddDotDoAn cho rõ ràng hơn

        // Cập nhật một đợt đồ án.
        // Phương thức này sẽ nhận một đối tượng DotDoAn đã được cập nhật
        void UpdateDotDoAn(DotDoAn dotDoAn);

        // Xóa một đợt đồ án.
        // Phương thức này sẽ nhận một đối tượng DotDoAn để xóa (sẽ xử lý xóa các mối quan hệ trước)
        void DeleteDotDoAn(DotDoAn dotDoAn);

        // Kiểm tra sự tồn tại của đợt đồ án
        Task<bool> DotDoAnExistsAsync(string maDotDoAn);

        // Lưu thay đổi (Đây là phương thức quan trọng, xử lý tất cả các thay đổi theo dõi bởi DbContext)
        Task<bool> SaveChangesAsync();

        // --- CÁC PHƯƠNG THỨC MỚI NẾU BẠN MUỐN QUẢN LÝ RIÊNG CÁC MỐI QUAN HỆ TRUNG GIAN ---
        // (Trong trường hợp bạn không gói gọn việc thêm/xóa lớp/GV trong Add/Update DotDoAn)
        // Tuy nhiên, với cách chúng ta đang làm (gói gọn trong Add/Update), các phương thức này
        // có thể không cần thiết ở tầng Repository Interface trực tiếp, mà logic của chúng
        // sẽ được gọi bên trong implementation của AddDotDoAn và UpdateDotDoAn.
        // Tôi vẫn liệt kê ở đây để bạn tham khảo, tùy thuộc vào cách bạn tổ chức service layer.

        // Task AddLopToDotDoAnAsync(string maDotDoAn, string maLop);
        // Task RemoveLopFromDotDoAnAsync(string maDotDoAn, string maLop);
        // Task AddGiangVienToDotDoAnAsync(string maDotDoAn, string maGV);
        // Task RemoveGiangVienFromDotDoAnAsync(string maDotDoAn, string maGV);
    }
}