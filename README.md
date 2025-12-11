# Smart Exit Monitoring System - Backend

This is the backend for the Smart Exit Monitoring System, built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- MongoDB Atlas account (for cloud database)
- Render account (for deployment)

## Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=production
JWT_SECRET=your_jwt_secret_key
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-specific-password
FRONTEND_URL=your-frontend-url
```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. The server will be running at `http://localhost:5000`

## Deployment to Render

1. Push your code to a GitHub repository

2. Go to [Render Dashboard](https://dashboard.render.com/)

3. Click "New" and select "Web Service"

4. Connect your GitHub repository

5. Configure the service:
   - Name: sems-backend (or your preferred name)
   - Region: Choose the one closest to your users
   - Branch: main (or your main branch)
   - Build Command: `npm install`
   - Start Command: `node server.js`

6. Add the following environment variables in the Render dashboard:
   - `NODE_ENV`: production
   - `PORT`: 5000
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string
   - `GMAIL_USER`: Your Gmail address
   - `GMAIL_APP_PASSWORD`: Your Gmail app password
   - `FRONTEND_URL`: Your frontend URL (for CORS)

7. Click "Create Web Service"

## API Documentation

Once deployed, you can access the API documentation at:
- `https://sems-backend.onrender.com/api-docs` (if you have Swagger/OpenAPI set up)

## Health Check

A health check endpoint is available at:
- `GET /test-debug` - Returns server status and timestamp

## Support

For any issues or questions, please contact the development team.
