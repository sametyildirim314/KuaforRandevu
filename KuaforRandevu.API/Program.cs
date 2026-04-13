using System.Text;
using KuaforRandevu.API.Middleware;
using KuaforRandevu.Application.Interfaces;
using KuaforRandevu.Domain.Entities;
using KuaforRandevu.Infrastructure.Persistence;
using KuaforRandevu.Infrastructure.Services;
using KuaforRandevu.Domain.Enums;
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
builder.Services.AddScoped<IAppointmentService, AppointmentService>();
builder.Services.AddScoped<IReviewService, ReviewService>();
builder.Services.AddScoped<ISalonDashboardService, SalonDashboardService>();

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

// ── Migration + Seed Data ─────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
    db.Database.Migrate();

    // ── Salon sahiplerini oluştur ──────────────────────────────────
    (string Email, string First, string Last)[] ownerSeeds =
    [
        ("modern@kuafor.com", "Ahmet", "Yıldız"),
        ("elite@kuafor.com",  "Zeynep", "Aksoy"),
        ("studio@kuafor.com", "Mert",   "Özkan"),
    ];

    var ownerUsers = new List<AppUser>();
    foreach (var o in ownerSeeds)
    {
        var user = userManager.FindByEmailAsync(o.Email).GetAwaiter().GetResult();
        if (user == null)
        {
            user = new AppUser { FirstName = o.First, LastName = o.Last, Email = o.Email, UserName = o.Email, Role = "SalonOwner" };
            userManager.CreateAsync(user, "Salon123!").GetAwaiter().GetResult();
        }
        ownerUsers.Add(user);
    }

    // ── Örnek salonlar (sahipleriyle birlikte) ─────────────────────
    if (!db.Salons.Any())
    {
        db.Salons.AddRange(
            new Salon { Name = "Salon Modern", City = "İstanbul", Address = "Bağdat Cad. No:12", Phone = "+90 216 555 0001", Description = "Saç kesimi, boyama ve bakım.", OwnerId = ownerUsers[0].Id },
            new Salon { Name = "Kuaför Elite", City = "Ankara", Address = "Kızılay Mah. 45", Phone = "+90 312 555 0002", Description = "Erkek ve kadın kuaför.", OwnerId = ownerUsers[1].Id },
            new Salon { Name = "Hair Studio", City = "İzmir", Address = "Alsancak 78", Phone = "+90 232 555 0003", Description = "Randevu ile hizmet.", OwnerId = ownerUsers[2].Id }
        );
        db.SaveChanges();
    }

    // ── Örnek berberler — her salona bir berber ───────────────────
    if (!db.Barbers.Any())
    {
        var salonModern = db.Salons.First(s => s.Name == "Salon Modern");
        var salonElite  = db.Salons.First(s => s.Name == "Kuaför Elite");
        var salonHair   = db.Salons.First(s => s.Name == "Hair Studio");

        (string Email, string FirstName, string LastName, int SalonId, string DisplayName)[] barberSeeds =
        [
            ("emre@kuafor.com", "Emre", "Yılmaz", salonModern.Id, "Emre Yılmaz"),
            ("ayse@kuafor.com", "Ayşe", "Demir",  salonElite.Id,  "Ayşe Demir"),
            ("can@kuafor.com",  "Can",  "Kaya",   salonHair.Id,   "Can Kaya"),
        ];

        foreach (var s in barberSeeds)
        {
            var user = userManager.FindByEmailAsync(s.Email).GetAwaiter().GetResult();
            if (user == null)
            {
                user = new AppUser { FirstName = s.FirstName, LastName = s.LastName, Email = s.Email, UserName = s.Email, Role = "Barber" };
                userManager.CreateAsync(user, "Barber123!").GetAwaiter().GetResult();
            }
            db.Barbers.Add(new Barber { UserId = user.Id, SalonId = s.SalonId, DisplayName = s.DisplayName });
        }
        db.SaveChanges();
    }

    // ── Örnek Müşteriler ───────────────────────────────────────────
    (string Email, string First, string Last)[] customerSeeds =
    [
        ("deniz@musteri.com", "Deniz", "Ak"),
        ("baran@musteri.com", "Baran", "Yalçın"),
        ("selin@musteri.com", "Selin", "Kara"),
        ("okan@musteri.com", "Okan", "Güneş"),
        ("elif@musteri.com", "Elif", "Demirci"),
    ];
    
    var customerUsers = new List<AppUser>();
    foreach (var c in customerSeeds)
    {
        var user = userManager.FindByEmailAsync(c.Email).GetAwaiter().GetResult();
        if (user == null)
        {
            user = new AppUser { FirstName = c.First, LastName = c.Last, Email = c.Email, UserName = c.Email, Role = "Customer" };
            userManager.CreateAsync(user, "Musteri123!").GetAwaiter().GetResult();
        }
        customerUsers.Add(user);
    }

    // ── Örnek Randevular ve Değerlendirmeler ───────────────────────
    if (!db.Appointments.Any())
    {
        var barbers = db.Barbers.ToList();
        var random = new Random();

        var appointments = new List<Appointment>();

        foreach (var barber in barbers)
        {
            for (int i = 0; i < 8; i++) // Her berbere 8 randevu
            {
                var customer = customerUsers[random.Next(customerUsers.Count)];
                
                // Zaman belirleme (dün, bugün, yarın)
                int dayOffset = random.Next(-4, 3);
                var appointedAt = DateTime.UtcNow.AddDays(dayOffset).Date.AddHours(random.Next(9, 17));

                AppointmentStatus status = AppointmentStatus.Pending;

                if (dayOffset < 0) {
                     status = random.NextDouble() > 0.1 ? AppointmentStatus.Completed : AppointmentStatus.Cancelled;
                } else if (dayOffset == 0) {
                     status = random.NextDouble() > 0.4 ? AppointmentStatus.Confirmed : AppointmentStatus.Pending;
                }

                appointments.Add(new Appointment
                {
                    CustomerId = customer.Id,
                    BarberId = barber.Id,
                    SalonId = barber.SalonId,
                    AppointedAt = appointedAt,
                    DurationMinutes = barber.SlotDurationMinutes,
                    Status = status,
                    Notes = random.NextDouble() > 0.7 ? "Saç ve sakal kesimi lütfen." : null,
                    CreatedAt = DateTime.UtcNow.AddDays(-5)
                });
            }
        }
        db.Appointments.AddRange(appointments);
        db.SaveChanges(); // Randevular kaydedilsin ki ID'leri alınabilsin

        // Değerlendirmeler ekleyelim (Tamamlanan randevular için)
        if (!db.Reviews.Any())
        {
            var completedAppointments = db.Appointments.Where(a => a.Status == AppointmentStatus.Completed).ToList();
            var reviews = new List<Review>();
            foreach (var appt in completedAppointments)
            {
                // %80 ihtimalle yorum yapılsın
                if (random.NextDouble() > 0.2)
                {
                    int rating = random.Next(3, 6); // 3 ile 5 arası puan
                    reviews.Add(new Review
                    {
                        AppointmentId = appt.Id,
                        BarberId = appt.BarberId,
                        AuthorId = appt.CustomerId,
                        Rating = rating,
                        Comment = rating == 5 ? "Harika bir deneyimdi, çok teşekkürler!" : (rating == 4 ? "Güzeldi ama biraz bekledim." : "İdare eder bir kesimdi.")
                    });
                }
            }
            db.Reviews.AddRange(reviews);
            db.SaveChanges();

            // Berberlerin puanlarını güncelle
            foreach (var barber in barbers)
            {
                var barberReviews = db.Reviews.Where(r => r.BarberId == barber.Id).ToList();
                if (barberReviews.Any())
                {
                    barber.AverageRating = barberReviews.Average(r => r.Rating);
                    barber.ReviewCount = barberReviews.Count;
                }
            }
            db.SaveChanges();
        }
    }
}

app.Run();
