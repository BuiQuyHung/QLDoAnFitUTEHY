export interface TaiKhoan {
  tenDangNhap: string;
  matKhau: string;
  vaiTro: string; 
  maGV?: string | null; 
  maSV?: string | null; 
}

export interface LoginResponse {
  token: string;
  user: {
    tenDangNhap: string;
    vaiTro: string;
    maGV?: string | null;
    maSV?: string | null;
  };
}
