using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using QLDoAnFITUTEHY.Data;
using QLDoAnFITUTEHY.Interfaces;
using QLDoAnFITUTEHY.Repository;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.WriteIndented = true;
});

builder.Services.AddControllers();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();
builder.Services.AddSwaggerGen(option =>
{
    option.SwaggerDoc("v1", new OpenApiInfo { Title = "QLDoAnFITUTEHY API", Version = "v1" });
    option.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "Please enter a valid token",
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        BearerFormat = "JWT",
        Scheme = "Bearer"
    });
    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type=ReferenceType.SecurityScheme,
                    Id="Bearer"
                }
            },
            new string[]{}
        }
    });
});

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IKhoaRepository, KhoaRepository>();
builder.Services.AddScoped<IBoMonRepository, BoMonRepository>();
builder.Services.AddScoped<INganhRepository, NganhRepository>();
builder.Services.AddScoped<IChuyenNganhRepository, ChuyenNganhRepository>();
builder.Services.AddScoped<ILopRepository, LopRepository>();
builder.Services.AddScoped<ISinhVienRepository, SinhVienRepository>();
builder.Services.AddScoped<IGiangVienRepository, GiangVienRepository>();
builder.Services.AddScoped<IDotDoAnRepository, DotDoAnRepository>();
builder.Services.AddScoped<IDeTaiRepository, DeTaiRepository>();
builder.Services.AddScoped<IPhanCongRepository, PhanCongRepository>();
builder.Services.AddScoped<IHoiDongRepository, HoiDongRepository>();
builder.Services.AddScoped<IThanhVienHoiDongRepository, ThanhVienHoiDongRepository>();
builder.Services.AddScoped<IBaoCaoTienDoRepository, BaoCaoTienDoRepository>();
builder.Services.AddScoped<ITaiKhoanRepository, TaiKhoanRepository>();
builder.Services.AddScoped<ILogRepository, LogRepository>();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true, 
        ValidateAudience = true, 
        ValidateLifetime = true, 
        ValidateIssuerSigningKey = true, 

        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
    };
});

builder.Services.AddAuthorization(options =>
{
    
    options.AddPolicy("RequireAdminRole", policy => policy.RequireRole("Admin"));

    options.AddPolicy("RequireGiangVienRole", policy => policy.RequireRole("GiangVien", "Admin"));

    options.AddPolicy("RequireSinhVienRole", policy => policy.RequireRole("SinhVien", "Admin"));

    options.AddPolicy("RequireAuthenticatedUser", policy => policy.RequireAuthenticatedUser());
});



builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "QLDoAnFITUTEHY API V1");

        // Lấy token từ cấu hình (appsettings.Development.json)
        var adminToken = builder.Configuration["SwaggerAdminToken"];

        // Chỉ inject script nếu token tồn tại và không rỗng
        if (!string.IsNullOrEmpty(adminToken))
        {
            // Inject JavaScript để tự động authorize
            // Sử dụng HeadContent để chèn script vào phần <head> của trang Swagger UI
            c.HeadContent = $@"
                <script type='text/javascript'>
                    document.addEventListener('DOMContentLoaded', function() {{
                        // Đảm bảo ui object đã sẵn sàng
                        const interval = setInterval(() => {{
                            if (window.ui) {{
                                clearInterval(interval);
                                // Gọi preauthorizeApiKey với tên security definition là 'Bearer'
                                // và giá trị token có tiền tố 'Bearer '
                                window.ui.preauthorizeApiKey('Bearer', 'Bearer {adminToken}');
                                console.log('Swagger UI: Automatically authorized with Admin token.');
                            }}
                        }}, 100); // Kiểm tra mỗi 100ms cho đến khi ui object sẵn sàng
                    }});
                </script>";
        }
    });
}

app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
