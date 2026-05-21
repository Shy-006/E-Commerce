# 🛒 Full-Stack E-Commerce Application

A modern, high-performance full-stack E-Commerce web application featuring user authentication, Google OAuth, Stripe payment integration, Cloudinary media storage, Upstash Redis caching, and an administrative analytics dashboard.

---

## 🚀 Features

### **Client-Side (Frontend)**
- **User Authentication**: Secure login, registration, and logout with JWT and Axios interceptors.
- **Google OAuth Login**: Quick and secure sign-in option powered by Google Identity Services.
- **Responsive E-Commerce Layout**: Sleek UI built with TailwindCSS, Lucide Icons, and Framer Motion.
- **Interactive Cart System**: Real-time cart calculations (subtotal, coupon discounts, total).
- **Stripe Checkout**: Seamless Stripe checkout integration with success and cancellation pages.
- **Administrative Dashboard**: Protected admin view featuring:
  - **Analytics Tab**: Real-time sales statistics graphs (Daily Sales, Revenue).
  - **Product Management Tab**: Create new products (with Cloudinary image uploads) and delete existing ones.
  - **Featured Products Switcher**: Toggle which products appear on the homepage slider.

### **Server-Side (Backend)**
- **Robust REST API**: Built on Node.js, Express, and MongoDB (Mongoose).
- **Secure Token Flow**: Access token (15m expiry) and Refresh token (7d expiry) rotation.
- **Upstash Redis Integration**: High-speed cache for featured products and user session refresh tokens.
- **Cloudinary Storage**: Automated upload and deletion of product images.
- **Stripe API**: Integration for secure card processing, custom session creation, and secure payment verification.
- **Analytics System**: Daily transaction aggregates compiled using MongoDB pipeline aggregations.

---

## 🛠️ Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, Zustand, TailwindCSS, Framer Motion, Axios, React Router Dom, Recharts |
| **Backend** | Node.js, Express, MongoDB (Mongoose), Upstash Redis (ioredis) |
| **Integrations** | Stripe (Payments), Cloudinary (Images), Google OAuth (Authentication) |
| **Security** | JWT, bcryptjs, cookie-parser, CORS, HTTPS-only cookies |

---

## 📂 Project Structure

```
E-Commerce/
├── backend/                  # Node.js + Express backend server
│   ├── controllers/          # API route controllers
│   ├── lib/                  # Database connections & third-party clients (DB, Redis, Cloudinary, Stripe)
│   ├── middleware/           # Authentication & role authorization checks
│   ├── models/               # MongoDB models (User, Product, Order, Coupon)
│   ├── routes/               # API route definitions
│   ├── server.js             # Main server entrypoint
│   └── .env.example          # Environment variables template
├── frontend/                 # React + Vite frontend client
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Shared UI components (Navbar, Spinner, Slider)
│   │   ├── lib/              # Client services (Axios configuration)
│   │   ├── pages/            # Page components (Home, Cart, Admin, Login/Signup)
│   │   ├── stores/           # Zustand state management stores
│   │   ├── App.jsx           # Main routing and auth check loader
│   │   └── index.css         # Styling and design system variables
│   └── package.json          # Frontend dependencies
└── README.md                 # Project documentation
```

---

## 🔧 Environment Variables

Before launching the project, you must set up your environment variables.

### **Backend (`backend/.env`)**
Create a `.env` file inside the `backend/` folder and populate it with the following configuration:
```env
PORT=5000
NODE_ENV=development

# Database Setup
MONGO_URI=your_mongodb_connection_string
UPSTASH_REDIS_URL=your_upstash_redis_connection_string

# Authentication Secrets
ACCESS_TOKEN_SECRET=your_access_token_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_token_jwt_secret

# Third-Party API Keys
STRIPE_SECRET_KEY=your_stripe_secret_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GOOGLE_CLIENT_ID=your_google_client_id

# Mail Setup (Optional)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### **Frontend (`frontend/.env`)**
Create a `.env` file inside the `frontend/` folder:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## ⚡ Setup & Installation

### **Prerequisites**
- **Node.js** (v18 or higher recommended)
- **MongoDB** account / Atlas cluster
- **Upstash** account (Redis)
- **Stripe** developer account
- **Cloudinary** developer account
- **Google Cloud Console** (for Google Login API)

---

### **1. Clone the repository**
```bash
git clone <your-repository-url>
cd E-Commerce
```

### **2. Setup Backend Server**
```bash
# Navigate to the backend folder
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
```
The backend server will launch at `http://localhost:5000`.

### **3. Setup Frontend Client**
```bash
# Navigate to the frontend folder
cd ../frontend

# Install dependencies
npm install

# Start Vite server
npm run dev
```
The client app will launch at `http://localhost:5173`. Open this URL in your web browser.

---

## 📦 Deployment

### **Backend Deployment (Render/Heroku/Railway)**
- Configure the build command: `npm install`
- Configure the start command: `node server.js`
- Set all environment variables listed in the Backend Environment Setup in your deployment provider settings.

### **Frontend Deployment (Vercel/Netlify)**
- Set the API URL environment variable `VITE_API_URL` to point to your live backend domain (e.g. `https://your-backend.onrender.com/api`).
- Deploy directory: `frontend/`
- Build command: `npm run build`
- Output directory: `dist/`
