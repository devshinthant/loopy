# Mediasoup WebRTC Project

A real-time video conferencing application built with React, TypeScript, Node.js, and Mediasoup for WebRTC communication.

## 🚀 Features

- Real-time video and audio communication
- Screen sharing capabilities
- Chat functionality
- Participant management
- Device settings and testing
- Responsive UI with modern design
- Authentication system

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (recommended) or npm
- **Git**

## 🛠️ Environment Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd mediasoup-webrtc
```

### 2. Install Dependencies

Install dependencies for both client and server:

```bash
# Install client dependencies
cd client
pnpm install

# Install server dependencies
cd ../server
pnpm install
```

### 3. Environment Configuration

#### Server Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd server
touch .env
```

Add the following environment variables to `server/.env`:

```env
# Server Configuration
PORT=3001

# Network Configuration
LISTEN_IP=0.0.0.0
ANNOUNCED_IP=127.0.0.1

# For production, replace with your actual IP address
# ANNOUNCED_IP=your-public-ip-address
```

#### Client Environment Variables

Create a `.env` file in the `client` directory:

```bash
cd client
touch .env
```

Add the following environment variables to `client/.env`:

```env
# Server URL (adjust port if different)
VITE_SERVER_URL=http://localhost:3001
```

### 4. SSL Certificates (Optional)

For HTTPS support, generate self-signed certificates:

```bash
cd server
chmod +x generate-certs.sh
./generate-certs.sh
```

This will create SSL certificates in `server/src/certs/`.

## 🏃‍♂️ Running the Application

### Development Mode

#### Start the Server

```bash
cd server
pnpm dev
```

The server will start on `http://localhost:3001` (or the port specified in your `.env`).

#### Start the Client

In a new terminal:

```bash
cd client
pnpm dev
```

The client will start on `http://localhost:5173` (Vite default port).

### Production Build

#### Build the Client

```bash
cd client
pnpm build
```

#### Start the Server in Production

```bash
cd server
pnpm build
pnpm start
```

## 📁 Project Structure

```
mediasoup-webrtc/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility functions
│   │   ├── store/         # State management (Zustand)
│   │   └── types/         # TypeScript type definitions
│   ├── public/            # Static assets
│   └── package.json
├── server/                # Node.js backend application
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── room/          # Room management
│   │   ├── transports/    # WebRTC transport handling
│   │   ├── worker/        # Mediasoup worker management
│   │   └── utils/         # Utility functions
│   ├── generate-certs.sh  # SSL certificate generation script
│   └── package.json
└── README.md
```

## 🔧 Available Scripts

### Client Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

### Server Scripts

- `pnpm dev` - Start development server with nodemon
- `pnpm build` - Build TypeScript to JavaScript
- `pnpm start` - Start production server

## 🌐 Network Configuration

### Development

For local development, the default configuration should work:

- `LISTEN_IP=0.0.0.0`
- `ANNOUNCED_IP=127.0.0.1`

### Production

For production deployment:

1. Set `ANNOUNCED_IP` to your server's public IP address
2. Ensure your firewall allows traffic on the specified port
3. Configure your reverse proxy (nginx, etc.) if needed

## 🔐 Authentication

This project uses Clerk for authentication. You'll need to:

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Set up your application in Clerk dashboard
3. Add your Clerk environment variables to the client `.env` file

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**: Change the `PORT` in server `.env`
2. **WebRTC connection issues**: Check your network configuration and firewall settings
3. **SSL certificate errors**: Generate new certificates or use HTTP for development
4. **Dependencies not found**: Run `pnpm install` in both client and server directories

### Debug Mode

Enable debug logging by setting environment variables:

```env
DEBUG=mediasoup:*
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed information about your problem

## 🔗 Useful Links

- [Mediasoup Documentation](https://mediasoup.org/documentation/)
- [WebRTC Documentation](https://webrtc.org/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Socket.IO Documentation](https://socket.io/docs/)

