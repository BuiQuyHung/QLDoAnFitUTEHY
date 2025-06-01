CREATE DATABASE QLDoAnFITUTEHY;
USE QLDoAnFITUTEHY;
GO

-- Bảng Khoa
CREATE TABLE Khoa (
    MaKhoa VARCHAR(10) PRIMARY KEY,
    TenKhoa NVARCHAR(100) NOT NULL
);

-- Bảng BoMon
CREATE TABLE BoMon (
    MaBoMon VARCHAR(10) PRIMARY KEY,
    TenBoMon NVARCHAR(100) NOT NULL,
    MaKhoa VARCHAR(10),
    FOREIGN KEY (MaKhoa) REFERENCES Khoa(MaKhoa)
);

-- Bảng Nganh
CREATE TABLE Nganh (
    MaNganh VARCHAR(10) PRIMARY KEY,
    TenNganh NVARCHAR(100) NOT NULL,
    MaBoMon VARCHAR(10),
    FOREIGN KEY (MaBoMon) REFERENCES BoMon(MaBoMon)
);

-- Bảng ChuyenNganh
CREATE TABLE ChuyenNganh (
    MaChuyenNganh VARCHAR(10) PRIMARY KEY,
    TenChuyenNganh NVARCHAR(100) NOT NULL,
    MaNganh VARCHAR(10),
    FOREIGN KEY (MaNganh) REFERENCES Nganh(MaNganh)
);

-- Bảng Lop
CREATE TABLE Lop (
    MaLop VARCHAR(10) PRIMARY KEY,
    TenLop NVARCHAR(100) NOT NULL,
    MaChuyenNganh VARCHAR(10),
    FOREIGN KEY (MaChuyenNganh) REFERENCES ChuyenNganh(MaChuyenNganh)
);

-- Bảng SinhVien
CREATE TABLE SinhVien (
    MaSV VARCHAR(10) PRIMARY KEY,
    HoTen NVARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    SoDienThoai VARCHAR(20),
    NgaySinh DATE,
    MaLop VARCHAR(10),
    FOREIGN KEY (MaLop) REFERENCES Lop(MaLop)
);

-- Bảng GiangVien
CREATE TABLE GiangVien (
    MaGV VARCHAR(10) PRIMARY KEY,
    HoTen NVARCHAR(100) NOT NULL,
    ChuyenNganh NVARCHAR(100),
    HocVi NVARCHAR(100),
    Email VARCHAR(100) UNIQUE NOT NULL,
    SoDienThoai VARCHAR(20)
);

-- Bảng DotDoAn
CREATE TABLE DotDoAn (
    MaDotDoAn VARCHAR(10) PRIMARY KEY,
    TenDotDoAn NVARCHAR(200) NOT NULL,
    KhoaHoc VARCHAR(10) NOT NULL,
    NgayBatDau DATE,
    NgayKetThuc DATE,
    SoTuanThucHien INT,
    MaLop VARCHAR(10),
    MaGV VARCHAR(10),  
    FOREIGN KEY (MaLop) REFERENCES Lop(MaLop),
    FOREIGN KEY (MaGV) REFERENCES GiangVien(MaGV)
);

-- Bảng liên kết Đợt đồ án - Lớp
CREATE TABLE DotDoAn_Lop (
    MaDotDoAn VARCHAR(10),
    MaLop VARCHAR(10),
    PRIMARY KEY (MaDotDoAn, MaLop),
    FOREIGN KEY (MaDotDoAn) REFERENCES DotDoAn(MaDotDoAn),
    FOREIGN KEY (MaLop) REFERENCES Lop(MaLop)
);

-- Bảng liên kết Đợt đồ án - Giảng viên
CREATE TABLE DotDoAn_GiangVien (
    MaDotDoAn VARCHAR(10),
    MaGV VARCHAR(10),
    PRIMARY KEY (MaDotDoAn, MaGV),
    FOREIGN KEY (MaDotDoAn) REFERENCES DotDoAn(MaDotDoAn),
    FOREIGN KEY (MaGV) REFERENCES GiangVien(MaGV)
);

-- Bảng DeTai
CREATE TABLE DeTai (
    MaDeTai VARCHAR(10) PRIMARY KEY,
    TenDeTai NVARCHAR(200) NOT NULL,
    MoTa TEXT,
    MaGV VARCHAR(10),
    MaDotDoAn VARCHAR(10),
    MaSV VARCHAR(10) NULL,
    TrangThaiDangKy NVARCHAR(50),
    FOREIGN KEY (MaGV) REFERENCES GiangVien(MaGV),
    FOREIGN KEY (MaDotDoAn) REFERENCES DotDoAn(MaDotDoAn),
    FOREIGN KEY (MaSV) REFERENCES SinhVien(MaSV)
);

-- Bảng PhanCong
CREATE TABLE PhanCong (
    MaDeTai VARCHAR(10),
    MaSV VARCHAR(10),
    NgayPhanCong DATE DEFAULT GETDATE(),
    MaDotDoAn VARCHAR(10),
    PRIMARY KEY (MaDeTai, MaSV),
    FOREIGN KEY (MaDeTai) REFERENCES DeTai(MaDeTai),
    FOREIGN KEY (MaSV) REFERENCES SinhVien(MaSV),
    FOREIGN KEY (MaDotDoAn) REFERENCES DotDoAn(MaDotDoAn)
);

-- Bảng BaoCaoTienDo
CREATE TABLE BaoCaoTienDo (
    MaBaoCao INT PRIMARY KEY IDENTITY,
    MaDeTai VARCHAR(10),
    MaSV VARCHAR(10),
    NgayNop DATETIME DEFAULT GETDATE(),
    TuanBaoCao INT NOT NULL,
    LoaiBaoCao NVARCHAR(50) NOT NULL,
    TepDinhKem NVARCHAR(255),
    GhiChuCuaSV NVARCHAR(500),
    MaGV VARCHAR(10),
    NgayNhanXet DATETIME,
    NhanXetCuaGV TEXT,
    DiemSo FLOAT,
    TrangThai NVARCHAR(50),
    FOREIGN KEY (MaDeTai) REFERENCES DeTai(MaDeTai),
    FOREIGN KEY (MaSV) REFERENCES SinhVien(MaSV),
    FOREIGN KEY (MaGV) REFERENCES GiangVien(MaGV)
);

-- Bảng HoiDong
CREATE TABLE HoiDong (
    MaHoiDong VARCHAR(10) PRIMARY KEY,
    TenHoiDong NVARCHAR(100) NOT NULL,
    NgayBaoVe DATE,
    MaDotDoAn VARCHAR(10),
    FOREIGN KEY (MaDotDoAn) REFERENCES DotDoAn(MaDotDoAn)
);

-- Bảng ThanhVienHoiDong
CREATE TABLE ThanhVienHoiDong (
    MaHoiDong VARCHAR(10),
    MaGV VARCHAR(10),
    VaiTro NVARCHAR(50) NOT NULL,
    PRIMARY KEY (MaHoiDong, MaGV),
    FOREIGN KEY (MaHoiDong) REFERENCES HoiDong(MaHoiDong),
    FOREIGN KEY (MaGV) REFERENCES GiangVien(MaGV)
);
-- Bảng TaiKhoan
CREATE TABLE TaiKhoan (
    TenDangNhap VARCHAR(50) PRIMARY KEY,
    MatKhau VARCHAR(100) NOT NULL,
    VaiTro VARCHAR(20) NOT NULL,
    MaGV VARCHAR(10),
    MaSV VARCHAR(10),
    CONSTRAINT CK_TaiKhoanDangNhap_MaGV_MaSV CHECK (
        (MaGV IS NOT NULL AND MaSV IS NULL) OR (MaGV IS NULL AND MaSV IS NOT NULL)
    ),
    FOREIGN KEY (MaGV) REFERENCES GiangVien(MaGV),
    FOREIGN KEY (MaSV) REFERENCES SinhVien(MaSV)
);

-- Bảng Log
CREATE TABLE Log (
    MaLog INT PRIMARY KEY IDENTITY,
    TenDangNhap VARCHAR(50),
    ThoiGian DATETIME DEFAULT GETDATE(),
    HanhDong NVARCHAR(200) NOT NULL,
    BangBiThayDoi NVARCHAR(100) NOT NULL,
    MoTaChiTiet NVARCHAR(500) NULL,
    FOREIGN KEY (TenDangNhap) REFERENCES TaiKhoan(TenDangNhap)
);
-------------------------------------------------------------------------
INSERT INTO Khoa (MaKhoa, TenKhoa)
VALUES
('CNTT01', N'Công nghệ thông tin'),
('KT01', N'Kinh tế');

INSERT INTO BoMon (MaBoMon, TenBoMon, MaKhoa)
VALUES
('BM01', N'Khoa học máy tính', 'CNTT01'),
('BM02', N'Hệ thống thông tin', 'CNTT01'),
('BM03', N'Công nghệ phần mềm', 'CNTT01');

INSERT INTO Nganh (MaNganh, TenNganh, MaBoMon)
VALUES
('NG01', N'Khoa học máy tính', 'BM01'),
('NG02', N'Công nghệ thông tin', 'BM02'),
('NG03', N'Kỹ thuật phần mềm', 'BM03');

INSERT INTO ChuyenNganh (MaChuyenNganh, TenChuyenNganh, MaNganh)
VALUES
('CN01', N'Khoa học dữ liệu', 'NG01'),
('CN02', N'Trí tuệ nhân tạo', 'NG01'),
('CN03', N'Mạng máy tính và truyền thông', 'NG02'),
('CN04', N'Công nghệ thông tin', 'NG02'),
('CN05', N'Thiết kế đồ họa', 'NG02'),
('CN06', N'Kiểm thử phần mềm', 'NG03'),
('CN07', N'Công nghệ di động', 'NG03'),
('CN08', N'Công nghệ web', 'NG03');

INSERT INTO Lop (MaLop, TenLop, MaChuyenNganh)
VALUES
('SEK1', N'Kỹ thuật phần mềm 1', 'CN06'),
('SEK2', N'Kỹ thuật phần mềm 2', 'CN07'),
('SEK3', N'Kỹ thuật phần mềm 3', 'CN08'),
('ITK1', N'Công nghệ thông tin 1', 'CN03'),
('ITK2', N'Công nghệ thông tin 2', 'CN04'),
('ITK3', N'Công nghệ thông tin 3', 'CN05'),
('AIK1', N'Khoa học máy tính 1', 'CN01'),
('AIK2', N'Khoa học máy tính 2', 'CN02'),
('SEK4', N'Kỹ thuật phần mềm 4', 'CN06'),
('ITK4', N'Công nghệ thông tin 4', 'CN04');

INSERT INTO SinhVien (MaSV, HoTen, Email, SoDienThoai, NgaySinh, MaLop)
VALUES
('SV011', N'Nguyễn Văn An', 'an.nguyen@gmail.com', '0912345678', '2003-05-10', 'SEK1'),
('SV012', N'Trần Thị Bình', 'b.tran@gmail.com', '0987654321', '2003-08-15', 'SEK1'),
('SV013', N'Lê Văn Cường', 'c.le@gmail.com', '0901234567', '2003-11-20', 'SEK1'),
('SV014', N'Phạm Thị Dịu', 'd.pham@gmail.com', '0978901234', '2004-01-25', 'SEK1'),
('SV015', N'Hoàng Xuân Én', 'e.hoang@gmail.com', '0934567890', '2004-04-30', 'SEK1'),
('SV016', N'Vũ Thị Mai', 'f.vu@gmail.com', '0965432109', '2003-06-05', 'SEK1'),
('SV017', N'Đặng Văn Giang', 'g.dang@gmail.com', '0923456789', '2004-07-10', 'SEK1'),
('SV018', N'Bùi Thị Huệ', 'h.bui@gmail.com', '0998765432', '2003-09-15', 'SEK1'),
('SV019', N'Cao Văn Hùng', 'i.cao@gmail.com', '0945678901', '2004-02-20', 'SEK1'),
('SV020', N'Lưu Thị Liễu', 'k.luu@gmail.com', '0956789012', '2004-05-25', 'SEK1');

INSERT INTO GiangVien (MaGV, HoTen, ChuyenNganh, HocVi, Email, SoDienThoai)
VALUES
('GV001', N'Trần Văn An', N'Công nghệ phần mềm', N'Tiến sĩ', 'an.tran@example.edu.vn', '0911223344'),
('GV002', N'Lê Thị Bình', N'Khoa học máy tính', N'Thạc sĩ', 'binh.le@example.edu.vn', '0988776655'),
('GV003', N'Phạm Văn Cường', N'Hệ thống thông tin', N'Phó giáo sư', 'cuong.pham@example.edu.vn', '0900112233'),
('GV004', N'Hoàng Thị Diệu', N'Mạng máy tính', N'Tiến sĩ', 'dieu.hoang@example.edu.vn', '0977665544'),
('GV005', N'Nguyễn Văn Em', N'Trí tuệ nhân tạo', N'Thạc sĩ', 'em.nguyen@example.edu.vn', '0933445566'),
('GV006', N'Vũ Thị Phương', N'Kiểm thử phần mềm', N'Giáo sư', 'phuong.vu@example.edu.vn', '0966554433'),
('GV007', N'Đặng Văn Hùng', N'Công nghệ web', N'Tiến sĩ', 'hung.dang@example.edu.vn', '0922334455'),
('GV008', N'Bùi Thị Kim', N'Khoa học dữ liệu', N'Thạc sĩ', 'kim.bui@example.edu.vn', '0999887766'),
('GV009', N'Cao Văn Lâm', N'Công nghệ di động', N'Phó giáo sư', 'lam.cao@example.edu.vn', '0944556677'),
('GV010', N'Lưu Thị Mai', N'Thiết kế đồ họa', N'Thạc sĩ', 'mai.luu@example.edu.vn', '0955667788');

INSERT INTO DotDoAn (MaDotDoAn, TenDotDoAn, KhoaHoc, NgayBatDau, NgayKetThuc, SoTuanThucHien, MaLop, MaGV)
VALUES
('DDA2025A', N'Đồ án chuyên ngành học kỳ 1 năm 2024', '2020-2024', '2025-06-01', '2025-08-30', 13, 'SEK1', 'GV001'),
('DDA2025B', N'Đồ án chuyên ngành học kỳ 2 năm 2024', '2020-2024', '2025-06-01', '2025-08-30', 13, 'ITK2', 'GV003'),
('DDA2025C', N'Đồ án chuyên ngành học kỳ 3 năm 2024', '2020-2024', '2025-06-01', '2025-08-30', 13, 'AIK1', 'GV002'),
('DDA2025D', N'Đồ án chuyên ngành học kỳ 4 năm 2024', '2020-2024', '2025-06-15', '2025-08-15', 9, 'SEK2', 'GV004'),
('DDA2025E', N'Đồ án chuyên ngành học kỳ 5 năm 2024', '2020-2024', '2025-06-15', '2025-08-15', 9, 'ITK1', 'GV005'),
('DDA2025F', N'Đồ án chuyên ngành học kỳ 1 năm 2025', '2021-2025', '2025-06-15', '2025-08-15', 9, 'AIK2', 'GV006'),
('DDA2025G', N'Đồ án chuyên ngành học kỳ 2 năm 2025', '2021-2025', '2025-07-01', '2025-08-31', 8, 'SEK3', 'GV007'),
('DDA2025H', N'Đồ án chuyên ngành học kỳ 3 năm 2025', '2021-2025', '2025-07-01', '2025-08-31', 8, 'ITK3', 'GV008'),
('DDA2025I', N'Đồ án chuyên ngành học kỳ 4 năm 2025', '2021-2025', '2025-07-01', '2025-08-31', 8, 'AIK1', 'GV009'),
('DDA2025K', N'Đồ án chuyên ngành học kỳ 5 năm 2025', '2021-2025', '2025-06-01', '2025-08-30', 13, 'ITK4', 'GV010');

INSERT INTO DeTai (MaDeTai, TenDeTai, MoTa, MaGV, MaDotDoAn, MaSV, TrangThaiDangKy)
VALUES
('DT001', N'Xây dựng hệ thống quản lý thư viện', N'Hệ thống quản lý các hoạt động của thư viện.', 'GV001', 'DDA2025A', 'SV001', N'Đã duyệt'),
('DT002', N'Phát triển ứng dụng đặt vé xem phim trực tuyến', N'Ứng dụng cho phép người dùng đặt vé xem phim.', 'GV003', 'DDA2025B', 'SV002', N'Đã duyệt'),
('DT003', N'Nghiên cứu thuật toán phân cụm dữ liệu', N'Tìm hiểu và triển khai các thuật toán clustering.', 'GV002', 'DDA2025C', 'SV003', N'Đã duyệt'),
('DT004', N'Xây dựng website bán hàng trực tuyến', N'Website thương mại điện tử cơ bản.', 'GV004', 'DDA2025D', 'SV004', N'Đã duyệt'),
('DT005', N'Phát triển ứng dụng di động quản lý chi tiêu cá nhân', N'Ứng dụng giúp người dùng theo dõi thu chi.', 'GV005', 'DDA2025E', 'SV005', N'Đã duyệt'),
('DT006', N'Nghiên cứu các phương pháp kiểm thử tự động', N'Tìm hiểu và áp dụng automation testing.', 'GV006', 'DDA2025F', 'SV006', N'Đã duyệt'),
('DT007', N'Xây dựng API cho ứng dụng web', N'Phát triển các dịch vụ backend cho website.', 'GV007', 'DDA2025G', 'SV007', N'Đã duyệt'),
('DT008', N'Phân tích dữ liệu mạng xã hội', N'Thu thập và phân tích thông tin từ mạng xã hội.', 'GV008', 'DDA2025H', 'SV008', N'Đã duyệt'),
('DT009', N'Ứng dụng trí tuệ nhân tạo trong nhận dạng ảnh', N'Sử dụng AI để phân loại và nhận diện hình ảnh.', 'GV009', 'DDA2025I', 'SV009', N'Đã duyệt'),
('DT010', N'Xây dựng hệ thống quản lý dự án', N'Công cụ hỗ trợ quản lý tiến độ và công việc dự án.', 'GV010', 'DDA2025K', 'SV010', N'Đã duyệt');

INSERT INTO PhanCong (MaDeTai, MaSV, MaDotDoAn)
VALUES
('DT001', 'SV001', 'DDA2025A'),
('DT002', 'SV002', 'DDA2025B'),
('DT003', 'SV003', 'DDA2025C'),
('DT004', 'SV004', 'DDA2025D'),
('DT005', 'SV005', 'DDA2025E'),
('DT006', 'SV006', 'DDA2025F'),
('DT007', 'SV007', 'DDA2025G'),
('DT008', 'SV008', 'DDA2025H'),
('DT009', 'SV009', 'DDA2025I'),
('DT010', 'SV010', 'DDA2025K');

INSERT INTO BaoCaoTienDo (MaDeTai, MaSV, TuanBaoCao, LoaiBaoCao, GhiChuCuaSV, MaGV, TrangThai)
VALUES
('DT001', 'SV001', 1, N'Tuần', N'Bắt đầu tìm hiểu yêu cầu và lên kế hoạch.', 'GV001', N'Đã nộp'),
('DT002', 'SV002', 2, N'Tuần', N'Hoàn thành thiết kế cơ sở dữ liệu.', 'GV003', N'Đã nộp'),
('DT003', 'SV003', 3, N'Tuần', N'Triển khai thuật toán K-Means.', 'GV002', N'Đã nộp'),
('DT004', 'SV004', 1, N'Giữa kỳ', N'Báo cáo tiến độ giữa kỳ.', 'GV004', N'Đã nộp'),
('DT005', 'SV005', 2, N'Tuần', N'Xây dựng giao diện người dùng.', 'GV005', N'Đã nộp'),
('DT006', 'SV006', 4, N'Tuần', N'Viết test case cho module đăng nhập.', 'GV006', N'Đã nộp'),
('DT007', 'SV007', 3, N'Tuần', N'Hoàn thành API cho chức năng sản phẩm.', 'GV007', N'Đã nộp'),
('DT008', 'SV008', 2, N'Tuần', N'Thu thập dữ liệu từ Twitter.', 'GV008', N'Đã nộp'),
('DT009', 'SV009', 1, N'Tuần', N'Tìm hiểu về mạng CNN.', 'GV009', N'Đã nộp'),
('DT010', 'SV010', 5, N'Tuần', N'Thiết kế database cho module quản lý task.', 'GV010', N'Đã nộp');

INSERT INTO HoiDong (MaHoiDong, TenHoiDong, NgayBaoVe, MaDotDoAn)
VALUES
('HD001', N'Hội đồng bảo vệ đồ án 1', '2025-08-25', 'DDA2025A'),
('HD002', N'Hội đồng bảo vệ đồ án 2', '2025-08-26', 'DDA2025B'),
('HD003', N'Hội đồng bảo vệ đồ án 3', '2025-08-27', 'DDA2025C'),
('HD004', N'Hội đồng bảo vệ chuyên ngành 1', '2025-08-10', 'DDA2025D'),
('HD005', N'Hội đồng bảo vệ chuyên ngành 2', '2025-08-11', 'DDA2025E'),
('HD006', N'Hội đồng bảo vệ chuyên ngành 3', '2025-08-12', 'DDA2025F'),
('HD007', N'Hội đồng bảo vệ thực tập 1', '2025-08-20', 'DDA2025G'),
('HD008', N'Hội đồng bảo vệ thực tập 2', '2025-08-21', 'DDA2025H'),
('HD009', N'Hội đồng bảo vệ thực tập 3', '2025-08-22', 'DDA2025I'),
('HD010', N'Hội đồng bảo vệ đồ án 4', '2025-08-28', 'DDA2025K');

INSERT INTO ThanhVienHoiDong (MaHoiDong, MaGV, VaiTro)
VALUES
('HD001', 'GV001', N'Chủ tịch'),
('HD001', 'GV002', N'Phản biện'),
('HD001', 'GV003', N'Ủy viên'),
('HD002', 'GV003', N'Chủ tịch'),
('HD002', 'GV004', N'Phản biện'),
('HD002', 'GV005', N'Ủy viên'),
('HD003', 'GV002', N'Chủ tịch'),
('HD003', 'GV006', N'Phản biện'),
('HD003', 'GV007', N'Ủy viên'),
('HD004', 'GV004', N'Chủ tịch'),
('HD004', 'GV008', N'Phản biện'),
('HD004', 'GV009', N'Ủy viên'),
('HD005', 'GV005', N'Chủ tịch'),
('HD005', 'GV010', N'Phản biện'),
('HD005', 'GV001', N'Ủy viên'),
('HD006', 'GV006', N'Chủ tịch'),
('HD006', 'GV002', N'Phản biện'),
('HD006', 'GV003', N'Ủy viên'),
('HD007', 'GV007', N'Chủ tịch'),
('HD007', 'GV004', N'Phản biện'),
('HD007', 'GV005', N'Ủy viên'),
('HD008', 'GV008', N'Chủ tịch'),
('HD008', 'GV006', N'Phản biện'),
('HD008', 'GV007', N'Ủy viên'),
('HD009', 'GV009', N'Chủ tịch'),
('HD009', 'GV010', N'Phản biện'),
('HD009', 'GV008', N'Ủy viên'),
('HD010', 'GV010', N'Chủ tịch'),
('HD010', 'GV001', N'Phản biện'),
('HD010', 'GV002', N'Ủy viên');

INSERT INTO TaiKhoan (TenDangNhap, MatKhau, VaiTro, MaGV, MaSV)
VALUES
('admin', '123456', 'QTV', 'GV001', NULL),
('binh.le', 'abcdef', 'GV', 'GV002', NULL),
('cuong.pham', 'qwerty', 'GV', 'GV003', NULL),
('an.nguyen', 'nguyena', 'SV', NULL, 'SV001'),
('b.tran', 'tranb', 'SV', NULL, 'SV002'),
('c.le', 'lec', 'SV', NULL, 'SV003'),
('dieu.hoang', 'hoangd', 'GV', 'GV004', NULL),
('em.nguyen', 'nguyene', 'GV', 'GV005', NULL),
('pham.vu', 'vup', 'GV', 'GV006', NULL),
('g.dang', 'dangg', 'SV', NULL, 'SV007');

INSERT INTO Log (TenDangNhap, HanhDong, BangBiThayDoi, MoTaChiTiet)
VALUES
('admin', N'Thêm mới', N'DeTai', N'Thêm đề tài Xây dựng hệ thống quản lý thư viện'),
('binh.le', N'Xem', N'SinhVien', N'Xem thông tin sinh viên SV002'),
('cuong.pham', N'Cập nhật', N'BaoCaoTienDo', N'Cập nhật điểm số báo cáo của SV001'),
('an.nguyen', N'Đăng nhập', N'TaiKhoan', NULL),
('b.tran', N'Xem', N'DeTai', N'Xem danh sách đề tài'),
('c.le', N'Nộp', N'BaoCaoTienDo', N'Nộp báo cáo tuần 3'),
('dieu.hoang', N'Thêm mới', N'HoiDong', N'Thêm hội đồng bảo vệ đồ án 1'),
('em.nguyen', N'Xem', N'PhanCong', N'Xem danh sách phân công'),
('pham.vu', N'Cập nhật', N'DeTai', N'Cập nhật trạng thái đề tài DT005 thành Đã duyệt'),
('g.dang', N'Đăng xuất', N'TaiKhoan', NULL);
----------------------------------------------------------------------------
INSERT INTO DotDoAn_Lop (MaDotDoAn, MaLop) VALUES ('DDA2025A', 'SEK1');
INSERT INTO DotDoAn_Lop (MaDotDoAn, MaLop) VALUES ('DDA2025A', 'SEK2');
INSERT INTO DotDoAn_Lop (MaDotDoAn, MaLop) VALUES ('DDA2025A', 'SEK3');
INSERT INTO DotDoAn_Lop (MaDotDoAn, MaLop) VALUES ('DDA2025A', 'SEK4');
----------------------------------------------------------------------------
INSERT INTO DotDoAn_GiangVien (MaDotDoAn, MaGV) VALUES ('DDA2025A', 'GV001');
INSERT INTO DotDoAn_GiangVien (MaDotDoAn, MaGV) VALUES ('DDA2025A', 'GV002');
INSERT INTO DotDoAn_GiangVien (MaDotDoAn, MaGV) VALUES ('DDA2025A', 'GV003');
INSERT INTO DotDoAn_GiangVien (MaDotDoAn, MaGV) VALUES ('DDA2025A', 'GV004');
INSERT INTO DotDoAn_GiangVien (MaDotDoAn, MaGV) VALUES ('DDA2025A', 'GV005');