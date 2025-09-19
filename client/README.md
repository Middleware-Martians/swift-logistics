# Swift Logistics Client Portal

A modern React-based client portal for Swift Logistics with authentication, dashboard, and order management features.

## Features

- **User Authentication**: Login and signup functionality with REST and SOAP support
- **Dashboard**: Clean, modern interface showing user orders
- **Order Management**: View existing orders and create new ones
- **API Mode Switching**: Toggle between REST (JSON) and SOAP (XML) communication
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Integrates with the FastAPI backend

## API Communication Modes

The client supports both REST and SOAP communication:

### REST Mode (Default)
- Uses JSON-based HTTP requests
- Endpoints: `/clients/login`, `/clients/`, `/orders`
- Content-Type: `application/json`

### SOAP Mode
- Uses XML-based SOAP requests with envelope structure
- Endpoints: `/soap/clients/login`, `/soap/clients`, `/soap/orders`
- Content-Type: `text/xml; charset=utf-8`
- Includes proper SOAP envelope parsing and error handling

You can switch between modes using the Settings button in the dashboard.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Swift Logistics backend server running on `http://localhost:8000`

### Installation

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## API Integration

The client connects to the Swift Logistics FastAPI backend running on `http://localhost:8000`. Make sure the backend server is running before using the client.

### Available Endpoints

**REST Mode:**
- `POST /clients/login` - User authentication
- `POST /clients/` - User registration  
- `GET /orders` - Get user orders
- `POST /orders` - Create new order

**SOAP Mode:**
- `POST /soap/clients/login` - SOAP-based authentication
- `POST /soap/clients` - SOAP-based registration
- `GET /soap/orders` - Get orders via SOAP
- `POST /soap/orders` - Create orders via SOAP

## Project Structure

```
client/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Login.js          # Login form component
│   │   ├── Signup.js         # Registration form component
│   │   ├── Dashboard.js      # Main dashboard component
│   │   ├── AddOrderModal.js  # Modal for creating orders
│   │   └── Settings.js       # API mode settings component
│   ├── services/
│   │   ├── apiService.js     # Unified API service with mode switching
│   │   ├── soapService.js    # SOAP-specific service functions
│   │   └── soapUtils.js      # XML/SOAP parsing utilities
│   ├── App.js               # Main app component with routing
│   ├── App.css              # Main stylesheet
│   ├── index.js             # React entry point
│   └── index.css            # Base styles
└── package.json

```

## Components

### Login Component
- User authentication form
- Form validation and error handling
- Redirects to dashboard on successful login

### Signup Component
- User registration form
- Password confirmation validation
- Automatic login after successful registration

### Dashboard Component
- Displays user orders in a responsive grid
- Shows order status with color-coded badges
- "Add New Order" button for creating orders
- Empty state when no orders exist

### AddOrderModal Component
- Modal dialog for creating new orders
- Form validation for weight and status
- Real-time order creation

## Styling

The application uses a modern design with:
- Gradient backgrounds and subtle shadows
- Responsive grid layouts
- Smooth animations and hover effects
- Color-coded status indicators
- Mobile-first responsive design

## Order Status Colors

- **On The Way**: Blue (#3498db)
- **Delivered**: Green (#27ae60)
- **Returned**: Red (#e74c3c)

## Development

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

### Environment Variables

Create a `.env` file in the client root directory if you need to change the API URL:

```
REACT_APP_API_URL=http://localhost:8000
```

## Production Build

To create a production build:

```bash
npm run build
```

The build folder will contain the optimized production files ready for deployment.

## Browser Support

This application supports all modern browsers including:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)