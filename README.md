# BrainFIT 🧠

BrainFIT is a modern educational platform that tracks student progress, organizes real-time quiz competitions, and provides detailed analytical insights.
Made by : 
- Furkan Erhan 230201015
- İlhan Sıdal Karadeniz 220201006
- Taha Kılınçarslan 220201025

## 🚀 Features

- **Real-time Competitions**: Multi-player quiz lobbies powered by SignalR.
- **Detailed Analytics Dashboard**: Charts to track student progress, subject-based mastery, and score trends over time.
- **Dynamic Question Pool**: Rich set of questions across Mathematics, Physics, and Coding categories.
- **Leaderboards**: Global and session-based rankings.
- **PDF Reporting**: Export quiz results as PDF documents.

## 🛠️ Tech Stack

### Backend
- **Framework**: .NET 10
- **Database**: PostgreSQL
- **ORM**: Entity Framework Core
- **Real-time Communication**: SignalR
- **Security**: JWT Authentication

### Frontend
- **Library**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts

## 📦 Installation

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js (v18+)](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)

### 1. Database Configuration
Update the `ConnectionStrings` in `src/BrainFIT.API/appsettings.json` according to your PostgreSQL settings.

```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=BrainFITDb;Username=postgres;Password=your_password"
}
```

### 2. Run Backend
```bash
cd src/BrainFIT.API
dotnet restore
dotnet run
```
*Note: The application will automatically create the database and seed initial data on first run.*

### 3. Run Frontend
```bash
cd src/brainfit-ui
npm install
npm run dev
```
The application will be accessible at `http://localhost:5173`.

## 👤 Default Users

The system comes pre-configured with the following test accounts:

| Username | Password | Role |
| :--- | :--- | :--- |
| `admin` | `admin` | Administrator |
| `student` | `student` | Student |

## 📝 License
This project is developed for educational purposes.
