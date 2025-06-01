// DTOs/BaoCaoTienDoDto.cs
using System;

namespace QLDoAnFITUTEHY.DTOs
{
    public class BaoCaoTienDoDto
    {
        public int MaBaoCao { get; set; }
        public string MaDeTai { get; set; }
        public string TenDeTai { get; set; }
        public string MaSV { get; set; }
        public string TenSV { get; set; }
        public DateTime NgayNop { get; set; }
        public int TuanBaoCao { get; set; }
        public string LoaiBaoCao { get; set; }
        public string TepDinhKem { get; set; }
        public string GhiChuCuaSV { get; set; }
        public string MaGV { get; set; }
        public string TenGV { get; set; }
        public DateTime? NgayNhanXet { get; set; }
        public string NhanXetCuaGV { get; set; }
        public double? DiemSo { get; set; }
        public string TrangThai { get; set; }
    }
}