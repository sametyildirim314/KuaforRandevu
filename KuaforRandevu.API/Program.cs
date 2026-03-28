using System.Text;
using KuaforRandevu.API.Middleware;
using KuaforRandevu.Application.Interfaces;
using KuaforRandevu.Domain.Entities;
using KuaforRandevu.Infrastructure.Persistence;
using KuaforRandevu.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
var builder = WebApplication.CreateBuilder(args);

// ── Veritabanı ──────────────────────────────────────────────────────
var useSqlite = builder.Configuration.GetValue<bool>("UseSqlite");
builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (useSqlite)
        options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
    else
        options.UseSqlServer(builder.Configuration.GetConnectionString("SqlServer"));
});

// ── Identity ────────────────────────────────────────────────────────
builder.Services.AddIdentity<AppUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 6;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// ── JWT Authentication ───────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"]!;
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

// ── CORS (Expo / web istemci) ───────────────────────────────────────
builder.Services.AddCors(o => o.AddPolicy("DevCors", p =>
    p.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader()));

// ── Dependency Injection ─────────────────────────────────────────────
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ISalonService, SalonService>();

// ── Swagger ──────────────────────────────────────────────────────────
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Kuaför Randevu API",
        Version = "v1"
    });

    // Swagger'a JWT desteği ekle (Authorize butonu çıkar)
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Token giriniz: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddControllers();

var app = builder.Build();

// ── Middleware Pipeline ───────────────────────────────────────────────
app.UseMiddleware<ExceptionMiddleware>(); // Global hata yakalama — en üstte olmalı

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("DevCors");
app.UseAuthentication(); // Önce authentication
app.UseAuthorization();  // Sonra authorization
app.MapControllers();

// ── Migration + örnek salonlar ───────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    if (!db.Salons.Any())
    {
        db.Salons.AddRange(
            new Salon
            {
                Name = "Salon Modern",
                City = "İstanbul",
                Address = "Bağdat Cad. No:12",
                Phone = "+90 216 555 0001",
                Description = "Saç kesimi, boyama ve bakım.",
            },
            new Salon
            {
                Name = "Kuaför Elite",
                City = "Ankara",
                Address = "Kızılay Mah. 45",
                Phone = "+90 312 555 0002",
                Description = "Erkek ve kadın kuaför.",
            },
            new Salon
            {
                Name = "Hair Studio",
                City = "İzmir",
                Address = "Alsancak 78",
                Phone = "+90 232 555 0003",
                Description = "Randevu ile hizmet.",
            });
        db.SaveChanges();
    }
}

app.Run();
