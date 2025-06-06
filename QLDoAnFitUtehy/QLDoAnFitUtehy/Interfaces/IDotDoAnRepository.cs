﻿using QLDoAnFITUTEHY.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QLDoAnFITUTEHY.Interfaces
{
    public interface IDotDoAnRepository
    {
        Task<IEnumerable<DotDoAn>> GetAllDotDoAnAsync();
        Task<DotDoAn> GetDotDoAnByIdAsync(string maDotDoAn);
        Task<IEnumerable<DotDoAn>> GetDotDoAnByLopIdAsync(string maLop);
        Task<IEnumerable<DotDoAn>> GetDotDoAnByGiangVienIdAsync(string maGV);
        void AddDotDoAn(DotDoAn dotDoAn); 
        void UpdateDotDoAn(DotDoAn dotDoAn);
        void DeleteDotDoAn(DotDoAn dotDoAn);
        Task<bool> DotDoAnExistsAsync(string maDotDoAn);
        Task<bool> SaveChangesAsync();
    }
}