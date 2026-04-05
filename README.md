1. Hafta videosu : https://youtu.be/zreH9NEHG-s
2. Hafta videosu : https://youtu.be/aWOj9isG0-8
3. Hafta videosu : https://youtu.be/TnF1XmhcPQQ

# 💈 Kuaför Randevu — Barbershop Appointment System

A full-stack mobile application that digitizes the appointment process between barbershops and customers. Built with **React Native (Expo)** on the frontend and **.NET 10 Web API** on the backend.

---

## 📱 Overview

Customers can browse barbershops, compare services and prices, book appointments at available time slots, and leave reviews. Barbers manage their daily schedules and income statistics. Admins oversee the entire platform from a single panel.

---

## 🏗️ Architecture

The backend follows **Clean Architecture** with four layers:

```
KuaforRandevu/
├── KuaforRandevu.API/              # HTTP layer — controllers, middleware, startup
├── KuaforRandevu.Application/      # Business logic — interfaces, DTOs, validators
├── KuaforRandevu.Domain/           # Core entities and enums — no dependencies
└── KuaforRandevu.Infrastructure/   # Data access — EF Core, services, repositories
```

**Dependency rule:** outer layers depend on inner layers, never the other way around.

```
API ──► Application ──► Domain
 │                        ▲
 └────► Infrastructure ───┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native (Expo SDK 52) |
| Backend API | .NET 10 Web API |
| Database | Microsoft SQL Server |
| ORM | Entity Framework Core |
| Authentication | JWT (JSON Web Token) |
| State Management | Zustand |
| Navigation | React Navigation |
| HTTP Client | Axios |
| Real-time | SignalR |
| API Docs | Swagger / Swashbuckle |

---

## 👥 User Roles

| Role | Description |
|---|---|
| **Customer** | Browses salons, books appointments, leaves reviews |
| **Barber** | Manages appointments, edits profile, views earnings |
| **Admin** | Oversees all users, approves salons, views statistics |

---

## ✨ Features

- **Authentication** — Register, login, JWT access/refresh tokens, forgot/reset password
- **Salon & Barber Listing** — Search, filter by category, price range and rating
- **Appointment System** — Step-by-step booking flow with availability checking
- **Review System** — Star ratings and comments on completed appointments
- **Gallery** — Barbers can upload portfolio images
- **Favorites** — Save and manage favorite salons
- **Notifications** — Push notifications and real-time status updates via SignalR
- **Barber Dashboard** — Daily calendar, appointment management, income statistics
- **Admin Panel** — User management, salon approval, platform-wide statistics

---

## 🚀 Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (local)
- [Node.js](https://nodejs.org/) (for React Native)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

---

### Backend Setup

**1 — Clone the repository**
```bash
git clone https://github.com/sametyildirim314/kuafor-randevu.git
cd kuafor-randevu
```

**2 — Configure the database connection**

Open `KuaforRandevu.API/appsettings.json` and update the connection string:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=KuaforRandevuDB;Trusted_Connection=True;TrustServerCertificate=True;"
}
```

**3 — Update the JWT secret key**
```json
"Jwt": {
  "Key": "your-secret-key-at-least-32-characters-long!"
}
```

**4 — Apply migrations and run**
```bash
dotnet ef migrations add InitialCreate --project KuaforRandevu.Infrastructure --startup-project KuaforRandevu.API
dotnet ef database update --project KuaforRandevu.Infrastructure --startup-project KuaforRandevu.API
dotnet run --project KuaforRandevu.API
```

**5 — Open Swagger UI**

Navigate to `https://localhost:{port}/swagger` to explore and test all endpoints.

---

### Frontend Setup

```bash
cd KuaforRandevu.MobileApp
npm install
npx expo start
```

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive tokens |
| POST | `/api/auth/refresh-token` | Get a new access token |
| POST | `/api/auth/forgot-password` | Request a password reset email |
| POST | `/api/auth/reset-password` | Reset password with token |

### Salons
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/salons` | List all salons |
| GET | `/api/salons/{id}` | Get salon details |
| POST | `/api/salons` | Create a salon |
| PUT | `/api/salons/{id}` | Update a salon |
| GET | `/api/salons/search` | Search and filter salons |

### Appointments
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/appointments` | Book an appointment |
| GET | `/api/appointments/my` | Get current user's appointments |
| GET | `/api/appointments/{id}` | Get appointment details |
| PUT | `/api/appointments/{id}/cancel` | Cancel an appointment |
| PUT | `/api/appointments/{id}/status` | Update appointment status |

### Reviews
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/reviews` | Submit a review |
| GET | `/api/barbers/{id}/reviews` | Get barber reviews |
| DELETE | `/api/reviews/{id}` | Delete a review |

---

## 📁 Project Structure (Backend)

```
KuaforRandevu.Domain/
├── Entities/           # AppUser, Salon, Barber, Appointment, Review...
├── Enums/              # UserRole, AppointmentStatus
└── Common/             # BaseEntity (Id, CreatedAt, UpdatedAt)

KuaforRandevu.Application/
├── DTOs/               # Request and response data transfer objects
├── Interfaces/         # Service contracts
├── Validators/         # FluentValidation rules
└── Mappings/           # AutoMapper profiles

KuaforRandevu.Infrastructure/
├── Persistence/
│   ├── AppDbContext.cs
│   └── Configurations/  # EF Core entity configurations
├── Services/            # AuthService, TokenService...
└── DependencyInjection.cs

KuaforRandevu.API/
├── Controllers/         # AuthController, SalonController...
├── Middleware/          # Global exception handler
├── Extensions/          # JWT and Swagger service extensions
└── Program.cs
```

---



