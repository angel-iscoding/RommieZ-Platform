# RoomieZ Platform

A modern web application for room rental and roommate finding, built with vanilla JavaScript, HTML, and CSS.

## 🏠 About

RommieZ is a comprehensive platform that connects students and tenants with available rooms and potential roommates. The application provides an intuitive interface for browsing room listings, managing user accounts, and facilitating connections between room seekers and property owners.

## ✨ Features

### Core Functionality
- **Room Listings**: Browse available rooms with detailed information
- **User Authentication**: Secure login system with email verification
- **Search & Filter**: Find rooms by location, price, and availability
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Dynamic content loading

### User Management
- **Student & Landlord Roles**: Different user types with specific permissions
- **Profile Management**: User profiles with personal information
- **Contact System**: Built-in messaging between users
- **Settings Panel**: User preferences and account configuration

### Room Management
- **Detailed Listings**: Comprehensive room information with images
- **Price Filtering**: Sort by price (low to high, high to low)
- **Availability Status**: Real-time availability tracking
- **Location-based Search**: Find rooms in specific areas

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js (for development)
- A local server (for API functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/angel-iscoding/RommieZ.git
   cd RommieZ-Platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the application**
   - Open `index.html` in your web browser
   - Or serve the files using a local server:
     ```bash
     # Using Node.js
     npx serve .
     ```

4. **Access the application**
   - Navigate to `http://localhost:8000` (or your chosen port)

## 📁 Project Structure

```
RommieZ-Platform/
├── index.html              # Main application entry point
├── index.js                # Core application logic
├── index.css               # Main stylesheet
├── db.json                 # API documentation and data structure
├── package.json            # Project dependencies and metadata
├── pages/                  # Application pages
│   ├── config/            # Settings and configuration
│   │   ├── config.html
│   │   ├── config.js
│   │   └── config.css
│   └── details/           # Room detail pages
│       ├── details.html
│       ├── details.js
│       ├── details.css
│       └── details-auth.js
└── scripts/               # Utility scripts
    ├── auth.js            # Authentication logic
    └── utils/             # Helper functions
        ├── fetch.js       # API communication
        ├── localStorage.js # Local storage management
        ├── redirect.js    # Navigation utilities
        ├── sort.js        # Data sorting functions
        ├── generateHash.js # Password hashing
        ├── isEmail.js     # Email validation
        └── isEmpty.js     # Input validation
```

## 🔧 Configuration

### API Configuration
The application is configured to work with a local API server running on port 3010:

```javascript
const API_CONFIG = {
    BASE_URL: 'http://localhost:3010/api/V1',
    ENDPOINTS: {
        USERS: '/users',
        CHECK_EMAIL: '/users/check-email',
        ROOMZ: '/roomz',
        USER_CONTACTS: '/users/:id/contacts'
    }
};
```

### Environment Setup
To run the application with full functionality:

1. **Start the API server** (separate from this frontend)
2. **Configure CORS** if running on different ports

## 🎨 User Interface

### Design Features
- **Modern UI**: Clean, intuitive interface design
- **Responsive Layout**: Adapts to different screen sizes
- **Loading States**: Smooth user experience with loading indicators
- **Modal Dialogs**: Interactive forms and confirmations
- **Dropdown Menus**: Organized navigation and filtering

### Color Scheme
- Primary colors optimized for readability
- Consistent visual hierarchy
- Accessible contrast ratios

## 🔐 Security Features

- **Email Validation**: Secure email verification process
- **Password Hashing**: Encrypted password storage
- **Session Management**: Secure user sessions
- **Input Validation**: Protection against malicious input

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Built with vanilla JavaScript for optimal performance
- Responsive design principles
- Modern web development best practices

---

**RommieZ Platform** - Making room finding easier, one connection at a time! 🏠✨
