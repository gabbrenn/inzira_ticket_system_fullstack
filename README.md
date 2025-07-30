# Inzira Ticket System

Welcome to the Inzira Ticket System! This is a comprehensive bus ticket management system built with Spring Boot backend and React frontend, designed to simplify the process of booking bus tickets online in Rwanda. The system features multiple user roles including Master Admin, Bus Agencies, Branch Managers, Agents, and Customers, allowing for comprehensive management of bus routes, schedules, and ticket sales.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [System Architecture](#system-architecture)
- [User Roles](#user-roles)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Features
- **Multi-Role Authentication**: Secure JWT-based authentication for different user roles
- **Real-time Seat Management**: Live seat availability tracking and booking
- **QR Code Tickets**: Digital tickets with QR codes for verification
- **PDF Ticket Generation**: Downloadable PDF tickets with booking details
- **Route Management**: Comprehensive route and district management system
- **Schedule Management**: Create and manage bus schedules with driver and bus assignments
- **Payment Tracking**: Payment status monitoring and management
- **File Upload**: Agency logo management with secure file storage

### Admin Features
- **District Management**: Create and manage districts with GPS-enabled route points
- **Route Management**: Define routes between districts with distance calculations
- **Agency Registration**: Register and manage bus agencies with profile management
- **System Oversight**: Complete system administration and user management

### Agency Features
- **Fleet Management**: Manage buses, drivers, and operational status
- **Branch Office Management**: Create and manage multiple branch offices
- **Agent Management**: Register and manage agents with confirmation workflows
- **Schedule Creation**: Create schedules with bus and driver assignments
- **Booking Analytics**: View booking history and revenue analytics
- **Route Pricing**: Set custom pricing for agency routes

### Customer Features
- **Schedule Search**: Search available schedules by route and date
- **Online Booking**: Book tickets with pickup and drop point selection
- **Booking Management**: View, cancel, and manage bookings
- **Digital Tickets**: Download PDF tickets and view QR codes
- **Payment Integration**: Secure payment processing

## Technologies Used

### Backend
- **Spring Boot 3.4.1**: Main application framework
- **Spring Security**: Authentication and authorization
- **Spring Data JPA**: Database operations and ORM
- **MySQL**: Primary database
- **JWT (JSON Web Tokens)**: Stateless authentication
- **MapStruct**: Entity-DTO mapping
- **iText PDF**: PDF ticket generation
- **ZXing**: QR code generation
- **Maven**: Dependency management and build tool

### Frontend
- **React 18**: Frontend framework
- **React Router DOM**: Client-side routing
- **Axios**: HTTP client for API communication
- **Tailwind CSS**: Utility-first CSS framework
- **React Hook Form**: Form handling and validation
- **React Hot Toast**: Toast notifications
- **Lucide React**: Icon library
- **Vite**: Build tool and development server

### Development Tools
- **Java 17**: Programming language for backend
- **Node.js**: JavaScript runtime for frontend
- **Git**: Version control
- **Postman**: API testing (recommended)

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Spring Boot    │    │     MySQL       │
│   (Port 5173)   │◄──►│   Backend       │◄──►│   Database      │
│                 │    │  (Port 8080)    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components
- **Authentication Service**: JWT-based authentication with role-based access control
- **File Storage Service**: Secure file upload and management for agency logos
- **PDF Generation Service**: Automated ticket PDF creation with QR codes
- **Booking Service**: Real-time seat management and booking processing
- **Notification System**: Toast notifications for user feedback

## User Roles

### 1. Master Admin
- **Full System Access**: Complete control over all system operations
- **District Management**: Create and manage districts and route points
- **Route Management**: Define routes between districts
- **Agency Management**: Register agencies, reset passwords, manage status
- **System Analytics**: View system-wide reports and statistics

### 2. Bus Agency
- **Fleet Management**: Manage buses, drivers, and maintenance schedules
- **Branch Operations**: Create and manage branch offices
- **Staff Management**: Register and manage branch managers and agents
- **Route Operations**: Create agency-specific routes with custom pricing
- **Schedule Management**: Create schedules and assign resources
- **Revenue Analytics**: Track bookings, revenue, and performance metrics

### 3. Branch Manager
- **Branch Operations**: Oversee specific branch office operations
- **Agent Management**: Create and manage agents within their branch
- **Schedule Oversight**: Create and manage schedules for the agency
- **Performance Reports**: View branch-specific analytics and reports
- **Customer Service**: Support booking operations and customer inquiries

### 4. Agent
- **Customer Service**: Create bookings for walk-in customers
- **Booking Management**: Process payments and confirm bookings
- **Ticket Issuance**: Generate and print tickets for customers
- **Schedule Access**: View available schedules for booking

### 5. Customer
- **Schedule Search**: Find available buses by route and date
- **Online Booking**: Book tickets with seat selection
- **Payment Processing**: Secure online payment for bookings
- **Ticket Management**: Download tickets, view QR codes, manage bookings
- **Booking History**: Track past and upcoming journeys

## Installation

### Prerequisites
- **Java 17** or higher
- **Node.js 16** or higher
- **MySQL 8.0** or higher
- **Maven 3.6** or higher

### Backend Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/inzira-ticket-system.git
   cd inzira-ticket-system/inzira_ticket_system_backend
   ```

2. **Configure MySQL Database**:
   ```sql
   CREATE DATABASE inzira;
   CREATE USER 'inzira_user'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON inzira.* TO 'inzira_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. **Update application.properties**:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/inzira
   spring.datasource.username=inzira_user
   spring.datasource.password=your_password
   ```

4. **Run the backend**:
   ```bash
   ./mvnw spring-boot:run
   ```

   The backend will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd ../inzira_ticket_system_frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:5173`

### Initial Setup

1. **Create Admin Account**: Register the first admin account through the frontend
2. **Add Districts**: Create districts and route points
3. **Create Routes**: Define routes between districts
4. **Register Agencies**: Add bus agencies to the system

## Usage

### For Administrators
1. Access the admin panel at `/admin`
2. Create districts and route points
3. Define routes between districts
4. Register and manage bus agencies

### For Agencies
1. Access the agency panel at `/agency`
2. Set up branch offices and staff
3. Add buses and drivers to your fleet
4. Create routes and schedules
5. Monitor bookings and revenue

### For Customers
1. Visit the customer panel at `/customer`
2. Search for available schedules
3. Book tickets with preferred seats
4. Download tickets and manage bookings

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Admin Endpoints
- `GET /api/admin/districts` - Get all districts
- `POST /api/admin/districts` - Create district
- `GET /api/admin/routes` - Get all routes
- `POST /api/admin/agencies` - Register agency

### Agency Endpoints
- `GET /api/agency/buses` - Get agency buses
- `POST /api/agency/schedules` - Create schedule
- `GET /api/agency/bookings` - Get agency bookings

### Customer Endpoints
- `GET /api/agency/schedules/search` - Search schedules
- `POST /api/bookings` - Create booking
- `GET /api/bookings/customer/{id}` - Get customer bookings

## File Structure

```
inzira-ticket-system/
├── inzira_ticket_system_backend/
│   ├── src/main/java/com/inzira/
│   │   ├── admin/          # Admin functionality
│   │   ├── agency/         # Agency management
│   │   ├── customer/       # Customer operations
│   │   ├── shared/         # Shared components
│   │   └── InziraTicketSystemApplication.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
├── inzira_ticket_system_frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── contexts/       # React contexts
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes and commit**:
   ```bash
   git commit -m "Add your feature description"
   ```
4. **Push to your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a pull request**

### Development Guidelines
- Follow Java coding conventions for backend
- Use ESLint and Prettier for frontend code formatting
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](./LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Contact the development team
- Check the documentation for common solutions

## Roadmap

### Upcoming Features
- **Mobile App**: React Native mobile application
- **Payment Integration**: Mobile money and card payment processing
- **SMS Notifications**: Booking confirmations and reminders
- **Advanced Analytics**: Detailed reporting and business intelligence
- **Multi-language Support**: Kinyarwanda, English, and French
- **API Rate Limiting**: Enhanced security and performance
- **Real-time Notifications**: WebSocket-based live updates

---

**Built with ❤️ for Rwanda's transportation system**