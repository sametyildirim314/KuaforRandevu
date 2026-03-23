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

// ── Dependency Injection ─────────────────────────────────────────────
builder.Services.AddScoped<TokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();

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
app.UseAuthentication(); // Önce authentication
app.UseAuthorization();  // Sonra authorization
app.MapControllers();

// ── İlk çalıştırmada migration uygula ───────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

app.Run();