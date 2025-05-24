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
        public DbSet<BaoCaoTienDo> BaoCaoTienDos { get; set; }
        public DbSet<TaiKhoan> TaiKhoans { get; set; }
        public DbSet<Log> Logs { get; set; }

        public DbSet<DotDoAn_Lop> DotDoAn_Lop { get; set; }
        public DbSet<DotDoAn_GiangVien> DotDoAn_GiangVien { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
    
            modelBuilder.Entity<PhanCong>()
                .HasKey(pc => new { pc.MaDeTai, pc.MaSV });

            modelBuilder.Entity<ThanhVienHoiDong>()
                .HasKey(tvhd => new { tvhd.MaHoiDong, tvhd.MaGV });
           
            modelBuilder.Entity<TaiKhoan>()
                .HasCheckConstraint("CK_TaiKhoanDangNhap_MaGV_MaSV", "(MaGV IS NOT NULL AND MaSV IS NULL) OR (MaGV IS NULL AND MaSV IS NOT NULL)");

            modelBuilder.Entity<Log>()
                .HasKey(l => l.MaLog); 

            modelBuilder.Entity<Log>()
                .Property(l => l.ThoiGian)
                .HasDefaultValueSql("GETDATE()"); 

            modelBuilder.Entity<Log>()
                .Property(l => l.HanhDong)
                .IsRequired() 
                .HasMaxLength(200);

            modelBuilder.Entity<Log>()
                .Property(l => l.BangBiThayDoi)
                .IsRequired() 
                .HasMaxLength(100);

            modelBuilder.Entity<Log>()
                .Property(l => l.MoTaChiTiet)
                .HasMaxLength(500);

            modelBuilder.Entity<Log>()
                .HasOne(l => l.TaiKhoan)
                .WithMany() 
                .HasForeignKey(l => l.TenDangNhap)
                .IsRequired(false) 
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<BaoCaoTienDo>()
                .HasKey(bc => bc.MaBaoCao);

            modelBuilder.Entity<BaoCaoTienDo>()
                .Property(bc => bc.NgayNop)
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<BaoCaoTienDo>()
                .Property(bc => bc.LoaiBaoCao)
                .IsRequired()
                .HasMaxLength(50);

            modelBuilder.Entity<BaoCaoTienDo>()
                .Property(bc => bc.TuanBaoCao)
                .IsRequired();

            modelBuilder.Entity<BaoCaoTienDo>()
                .Property(bc => bc.MaDeTai)
                .IsRequired()
                .HasMaxLength(10);

            modelBuilder.Entity<BaoCaoTienDo>()
                .Property(bc => bc.MaSV)
                .IsRequired()
                .HasMaxLength(10);

            modelBuilder.Entity<BaoCaoTienDo>()
                .HasOne(bc => bc.DeTai)
                .WithMany()
                .HasForeignKey(bc => bc.MaDeTai)
                .OnDelete(DeleteBehavior.Restrict); 

            modelBuilder.Entity<BaoCaoTienDo>()
                .HasOne(bc => bc.SinhVien)
                .WithMany()
                .HasForeignKey(bc => bc.MaSV)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<BaoCaoTienDo>()
                .HasOne(bc => bc.GiangVien)
                .WithMany()
                .HasForeignKey(bc => bc.MaGV)
                .IsRequired(false) 
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<DotDoAn_Lop>()
               .HasKey(dal => new { dal.MaDotDoAn, dal.MaLop }); // Khóa chính kết hợp

            modelBuilder.Entity<DotDoAn_Lop>()
                .HasOne(dal => dal.DotDoAn)
                .WithMany(dda => dda.DotDoAn_Lops)
                .HasForeignKey(dal => dal.MaDotDoAn);

            modelBuilder.Entity<DotDoAn_Lop>()
                .HasOne(dal => dal.Lop)
                .WithMany(l => l.DotDoAn_Lops) // Đảm bảo entity Lop có ICollection<DotDoAn_Lop>
                .HasForeignKey(dal => dal.MaLop);
            // -----------------------------------------------------

            // --- CẤU HÌNH MỐI QUAN HỆ NHIỀU-NHIỀU CHO DotDoAn_GiangVien ---
            modelBuilder.Entity<DotDoAn_GiangVien>()
                .HasKey(dagv => new { dagv.MaDotDoAn, dagv.MaGV }); // Khóa chính kết hợp

            modelBuilder.Entity<DotDoAn_GiangVien>()
                .HasOne(dagv => dagv.DotDoAn)
                .WithMany(dda => dda.DotDoAn_GiangViens)
                .HasForeignKey(dagv => dagv.MaDotDoAn);

            modelBuilder.Entity<DotDoAn_GiangVien>()
                .HasOne(dagv => dagv.GiangVien)
                .WithMany(gv => gv.DotDoAn_GiangViens) // Đảm bảo entity GiangVien có ICollection<DotDoAn_GiangVien>
                .HasForeignKey(dagv => dagv.MaGV);
        }

    }

}
