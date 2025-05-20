using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.Data;
using QLDoAnFITUTEHY.Interfaces;
using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Repository
{
    public class BoMonRepository : IBoMonRepository
    {
        private readonly ApplicationDbContext _context;

        public BoMonRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BoMon>> GetAllBoMonAsync()
        {
            return await _context.BoMons.Include(bm => bm.Khoa).ToListAsync();
        }

        public async Task<BoMon> GetBoMonByIdAsync(string maBoMon)
        {
            return await _context.BoMons.Include(bm => bm.Khoa).FirstOrDefaultAsync(bm => bm.MaBoMon == maBoMon);
        }

        public async Task<IEnumerable<BoMon>> GetBoMonByKhoaIdAsync(string khoaId)
        {
            return await _context.BoMons.Where(bm => bm.MaKhoa == khoaId).Include(bm => bm.Khoa).ToListAsync();
        }

        public void CreateBoMon(BoMon boMon)
        {
            _context.BoMons.Add(boMon);
        }

        public void UpdateBoMon(BoMon boMon)
        {
            _context.BoMons.Update(boMon);
        }

        public void DeleteBoMon(BoMon boMon)
        {
            _context.BoMons.Remove(boMon);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> BoMonExistsAsync(string maBoMon)
        {
            return await _context.BoMons.AnyAsync(bm => bm.MaBoMon == maBoMon);
        }
    }
}