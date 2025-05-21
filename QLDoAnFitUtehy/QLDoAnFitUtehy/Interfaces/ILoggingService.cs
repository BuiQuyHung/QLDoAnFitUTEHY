namespace QLDoAnFITUTEHY.Interfaces 
{
    public interface ILoggingService
    {
        Task LogAction(string tenDangNhap, string hanhDong, string bangBiThayDoi, string? moTaChiTiet = null);
    }
}