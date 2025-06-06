﻿using Microsoft.EntityFrameworkCore;
using QLDoAnFITUTEHY.Data;
using QLDoAnFITUTEHY.Interfaces;
using QLDoAnFITUTEHY.Models;
using System.Linq.Expressions;

namespace QLDoAnFITUTEHY.Repository
{
    public class TaiKhoanRepository : ITaiKhoanRepository
    {
        protected readonly ApplicationDbContext _context;

        public TaiKhoanRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TaiKhoan>> GetAllAsync()
        {
            return await _context.TaiKhoans.ToListAsync();
        }

        public async Task<TaiKhoan?> GetByIdAsync(string id)
        {
            return await _context.TaiKhoans.FindAsync(id);
        }

        public async Task AddAsync(TaiKhoan entity)
        {
            await _context.TaiKhoans.AddAsync(entity);
        }

        public void Update(TaiKhoan entity)
        {
            _context.TaiKhoans.Update(entity);
        }

        public void Delete(TaiKhoan entity)
        {
            _context.TaiKhoans.Remove(entity);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<TaiKhoan>> FindAsync(Expression<Func<TaiKhoan, bool>> predicate)
        {
            return await _context.TaiKhoans.Where(predicate).ToListAsync();
        }

        public async Task<TaiKhoan?> GetTaiKhoanByUsernameAsync(string username)
        {
            return await _context.TaiKhoans.FirstOrDefaultAsync(tk => tk.TenDangNhap == username);
        }

        public async Task<bool> IsUsernameExistAsync(string username)
        {
            return await _context.TaiKhoans.AnyAsync(tk => tk.TenDangNhap == username);
        }

        public async Task<TaiKhoan?> LoginAsync(string tenDangNhap, string matKhau)
        {
            return await _context.TaiKhoans.FirstOrDefaultAsync(tk => tk.TenDangNhap == tenDangNhap && tk.MatKhau == matKhau);
        }
    }
}