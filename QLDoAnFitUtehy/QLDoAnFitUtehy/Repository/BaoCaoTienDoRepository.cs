﻿using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using QLDoAnFITUTEHY.Data; 
using QLDoAnFITUTEHY.Models; 
using QLDoAnFITUTEHY.Interfaces; 

namespace QLDoAnFITUTEHY.Repository
{
    public class BaoCaoTienDoRepository : IBaoCaoTienDoRepository
    {
        private readonly ApplicationDbContext _context;

        public BaoCaoTienDoRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BaoCaoTienDo>> GetAllBaoCaoTienDosAsync()
        {
            return await _context.BaoCaoTienDos
                                 .Include(b => b.DeTai)      
                                 .Include(b => b.SinhVien) 
                                 .Include(b => b.GiangVien)  
                                 .ToListAsync();
        }

        public async Task<BaoCaoTienDo> GetBaoCaoTienDoByIdAsync(int id)
        {
            return await _context.BaoCaoTienDos
                                 .Include(b => b.DeTai)
                                 .Include(b => b.SinhVien)
                                 .Include(b => b.GiangVien)
                                 .FirstOrDefaultAsync(b => b.MaBaoCao == id);
        }

        public async Task AddBaoCaoTienDoAsync(BaoCaoTienDo baoCao)
        {
            _context.BaoCaoTienDos.Add(baoCao);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateBaoCaoTienDoAsync(BaoCaoTienDo baoCao)
        {
            _context.Entry(baoCao).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteBaoCaoTienDoAsync(int id)
        {
            var baoCao = await _context.BaoCaoTienDos.FindAsync(id);
            if (baoCao != null)
            {
                _context.BaoCaoTienDos.Remove(baoCao);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<BaoCaoTienDo>> GetBaoCaoBySinhVienAndDeTaiAsync(string maSV, string maDeTai)
        {
            return await _context.BaoCaoTienDos
                                 .Where(b => b.MaSV == maSV && b.MaDeTai == maDeTai)
                                 .Include(b => b.DeTai)
                                 .Include(b => b.SinhVien)
                                 .Include(b => b.GiangVien)
                                 .ToListAsync();
        }

        public async Task<IEnumerable<BaoCaoTienDo>> GetBaoCaoByGiangVienAsync(string maGV)
        {
            return await _context.BaoCaoTienDos
                                 .Include(b => b.DeTai)
                                 .Include(b => b.SinhVien)
                                 .Include(b => b.GiangVien)
                                 .Where(b => b.DeTai.MaGV == maGV)
                                 .ToListAsync();
        }

        public async Task<bool> BaoCaoTienDoExists(int id)
        {
            return await _context.BaoCaoTienDos.AnyAsync(e => e.MaBaoCao == id);
        }
    }
}