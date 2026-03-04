# E-Commerce App

Full-stack e-commerce project with:
- `frontend`: customer storefront (React + Vite)
- `admin`: admin dashboard (React + Vite)
- `backend`: REST API (Express + MongoDB)

## Features
- User signup/login with JWT auth
- Product listing and product details
- Cart management by product + size
- Checkout with three methods:
  - Cash on Delivery (COD)
  - Stripe
  - Razorpay
- Order history for users
- Admin login, product add/remove, order status management
- Image upload to Cloudinary

## Tech Stack
- Frontend/Admin: React, Vite, Axios, Tailwind CSS
- Backend: Node.js, Express, Mongoose, JWT, Multer
- Database: MongoDB
- Payments: Stripe, Razorpay
- Media storage: Cloudinary

## Project Structure
```text
E commerce  app/
  backend/
  frontend/
  admin/
```

## Prerequisites
- Node.js 20+
- npm
- MongoDB database
- Cloudinary account
- (Optional) Stripe and Razorpay accounts for online payments

## Environment Variables

### 1) Backend (`backend/.env`)
Create `backend/.env` and add:

```env
PORT=4000

MONGODB_URI=your_mongodb_connection_string
MONGO_DB_NAME=e-commerce

JWT_SECRET=your_jwt_secret

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password

CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret

FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173

DELIVERY_CHARGE=10
CURRENCY=usd

STRIPE_SECRET_KEY=your_stripe_secret_key

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_CURRENCY=INR
```

Notes:
- Backend also supports aliases for some keys, e.g. `MONGO_URI`, `STRIPE_SECRET`, `ADMIN_PASS`.
- Keep Stripe/Razorpay keys empty if you only want COD checkout.

### 2) Frontend (`frontend/.env`)
```env
VITE_BACKEND_URL=http://localhost:4000
```

### 3) Admin (`admin/.env`)
```env
VITE_BACKEND_URL=http://localhost:4000
```

## Install Dependencies
Run in each app folder:

```bash
cd backend
npm install

cd ../frontend
npm install

cd ../admin
npm install
```

## Run Locally
Start all three apps in separate terminals:

```bash
# Terminal 1
cd backend
npm run server

# Terminal 2
cd frontend
npm run dev

# Terminal 3
cd admin
npm run dev
```

Default local URLs:
- Frontend: `http://localhost:5173`
- Admin: `http://localhost:5174`
- Backend API: `http://localhost:4000`

## API Overview
Base URL: `http://localhost:4000`

### Auth
- `POST /api/user/register`
- `POST /api/user/login`
- `POST /api/user/admin`

### Products
- `GET /api/product/list`
- `POST /api/product/add` (admin auth)
- `POST /api/product/remove` (admin auth)
- `POST /api/product/single`

### Cart
- `POST /api/cart/get` (user auth)
- `POST /api/cart/add` (user auth)
- `POST /api/cart/update` (user auth)

### Orders
- `POST /api/order/place` (COD)
- `POST /api/order/stripe`
- `POST /api/order/verifyStripe`
- `POST /api/order/razorpay`
- `POST /api/order/verifyRazorpay`
- `POST /api/order/userorders`
- `POST /api/order/list` (admin auth)
- `POST /api/order/status` (admin auth)

Auth header supported by backend:
- `token: <jwt>` or
- `Authorization: Bearer <jwt>`

## Build for Production
```bash
cd frontend && npm run build
cd ../admin && npm run build
cd ../backend && npm start
```

## Deployment Notes
- `vercel.json` files are present in all three apps.
- Set the same environment variables on your hosting provider.
- Update `VITE_BACKEND_URL` in frontend/admin to your deployed backend URL.

## Troubleshooting
- `Stripe is not configured`: set `STRIPE_SECRET_KEY` in `backend/.env`.
- `Razorpay is not configured`: set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
- `Missing MONGODB_URI`: add MongoDB connection string in `backend/.env`.
- Image upload errors: verify Cloudinary keys and account limits.
