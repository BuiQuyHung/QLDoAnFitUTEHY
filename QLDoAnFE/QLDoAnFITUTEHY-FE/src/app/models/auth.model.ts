export interface LoginCredentials {
  TenDangNhap: string;
  MatKhau: string;
}

export interface LoginResponse {
  token: string;
  tenDangNhap: string;
  vaiTro: string;
  maGV: string | null;
  maSV: string | null;
}

export interface UserInfo {
  username: string | null;
  role: string | null;
  maGV?: string | null;
  maSV?: string | null;
}