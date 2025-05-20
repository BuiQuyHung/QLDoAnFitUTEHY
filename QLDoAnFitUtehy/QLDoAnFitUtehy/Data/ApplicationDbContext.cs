using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.Models;

namespace QLDoAnFITUTEHY.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Khoa> Khoas { get; set; }
        public DbSet<BoMon> BoMons { get; set; }
        public DbSet<Nganh> Nganhs { get; set; }
        public DbSet<ChuyenNganh> ChuyenNganhs { get; set; }
        public DbSet<Lop> Lops { get; set; }
        public DbSet<SinhVien> SinhViens { get; set; }
        public DbSet<GiangVien> GiangViens { get; set; }
        public DbSet<DotDoAn> DotDoAns { get; set; }
        public DbSet<DeTai> DeTais { get; set; }
        public DbSet<PhanCong> PhanCongs { get; set; }
        public DbSet<HoiDong> HoiDongs { get; set; }
        public DbSet<ThanhVienHoiDong> ThanhVienHoiDongs { get; set; }
        //public DbSet<TaiKhoan> TaiKhoans { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
    
            modelBuilder.Entity<PhanCong>()
                .HasKey(pc => new { pc.MaDeTai, pc.MaSV });

            modelBuilder.Entity<ThanhVienHoiDong>()
                .HasKey(tvhd => new { tvhd.MaHoiDong, tvhd.MaGV });

        }

    }

}
