# Jamii Loans - Loan Application System

A full-stack loan application system built with Node.js, Express, MongoDB, and React. The system allows users to apply for loans, make payments via M-PESA, and administrators to manage loan approvals.

## Features

### User Features
- User registration and authentication
- Loan eligibility checking based on credit score
- Loan application with M-PESA payment integration
- Dashboard with loan history and statistics
- Real-time loan status tracking

### Admin Features
- Admin dashboard for loan management
- Approve/reject loan applications
- View all loan applications with filtering
- User management and statistics

### Technical Features
- Secure JWT-based authentication
- M-PESA STK Push integration for payments
- Credit scoring system
- Responsive React frontend with Tailwind CSS
- RESTful API with proper error handling
- MongoDB database with Mongoose ODM

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Axios** - HTTP client for M-PESA API

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- M-PESA API credentials (for production)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jamii-loan
   ```

2. **Install dependencies**
   ```bash
   # Install all dependencies (backend and frontend)
   npm run install-all
   ```

3. **Environment Setup**

   **Backend (.env)**
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/jamii-loan?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_here
   MPESA_CONSUMER_KEY=your_mpesa_consumer_key
   MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
   MPESA_SHORTCODE=174379
   MPESA_PASSKEY=your_mpesa_passkey
   MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/callback
   NODE_ENV=development
   ```

   **Frontend (.env)**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the application**
   ```bash
   # Start both backend and frontend
   npm run dev
   ```

   Or run them separately:

   ```bash
   # Backend
   cd server
   npm run dev

   # Frontend (new terminal)
   cd client
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### User Routes (Protected)
- `GET /api/user/profile` - Get user profile
- `GET /api/user/eligibility` - Check loan eligibility
- `GET /api/user/loans` - Get loan history

### Loan Routes (Protected)
- `POST /api/loan/apply` - Apply for loan

### Admin Routes (Protected, Admin only)
- `GET /api/admin/loans` - Get all loans
- `PATCH /api/admin/loan/:id/approve` - Approve loan
- `PATCH /api/admin/loan/:id/reject` - Reject loan

### M-PESA Routes
- `POST /api/mpesa/callback` - M-PESA payment callback

## Demo Credentials

### User Account
- Email: `user@jamii.com`
- Password: `password123`

### Admin Account
- Email: `admin@jamii.com`
- Password: `admin123`

## Project Structure

```
jamii-loan/
├── server/                 # Backend application
│   ├── config/            # Database configuration
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── server.js         # Main server file
│   └── package.json
├── client/                # Frontend application
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── api/          # API configuration
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React context providers
│   │   ├── pages/        # Page components
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # App entry point
│   └── package.json
├── .gitignore
├── README.md
└── package.json          # Root package.json with scripts
```

## Development

### Available Scripts

- `npm run install-all` - Install dependencies for both backend and frontend
- `npm run dev` - Start both backend and frontend in development mode
- `npm run build` - Build the frontend for production
- `npm run start` - Start the backend server

### Backend Development
```bash
cd server
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
cd client
npm run dev  # Uses Vite for fast development
```

## Deployment

### Backend Deployment
1. Set environment variables for production
2. Build and deploy to your preferred hosting service (Heroku, AWS, etc.)
3. Ensure MongoDB is accessible from your deployment environment

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to your hosting service (Netlify, Vercel, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support or questions, please contact the development team.
