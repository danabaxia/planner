# Daily Activity Planner

[![CI/CD Pipeline](https://github.com/danab/planner/actions/workflows/ci.yml/badge.svg)](https://github.com/danab/planner/actions/workflows/ci.yml)
[![Dependency Updates](https://github.com/danab/planner/actions/workflows/dependency-update.yml/badge.svg)](https://github.com/danab/planner/actions/workflows/dependency-update.yml)
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/danab/planner)

Beautiful Notion-powered planning with Motion-inspired design. A modern web application that connects to your Notion database to create visual and intelligent planning for your daily activities.

## ✨ Features

- 🔗 **Notion Integration** - Seamlessly sync with your Notion databases
- 🎨 **Motion-Inspired UI** - Beautiful, fluid animations and modern design
- 📅 **Smart Scheduling** - AI-powered activity planning and optimization
- 📊 **Visual Analytics** - Insights into your productivity patterns
- 📱 **Responsive Design** - Works perfectly on all devices
- 🔒 **Secure Authentication** - Protected access to your personal data

## 🚀 Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **API Integration**: Notion API
- **Deployment**: Vercel
- **Testing**: Jest + React Testing Library

## 🏗️ Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/danab/planner.git
   cd planner
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage
- `npm run check-all` - Run all quality checks

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Notion Integration
NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_database_id

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Database
DATABASE_URL=your_database_url

# Optional: Analytics
ANALYTICS_ID=your_analytics_id
```

### Notion Setup

1. Create a new integration in your [Notion workspace](https://www.notion.so/my-integrations)
2. Copy the API key to your environment variables
3. Share your database with the integration
4. Copy the database ID to your environment variables

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in the Vercel dashboard
3. **Deploy** - Vercel will automatically deploy on every push to main

### Manual Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 🧪 Testing

The project includes comprehensive testing setup:

- **Unit Tests**: Component and utility function tests
- **Integration Tests**: API route and user flow tests
- **E2E Tests**: Full application workflow tests (coming soon)

Run tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📊 CI/CD Pipeline

The project includes a comprehensive CI/CD pipeline with:

- **Code Quality**: ESLint, Prettier, TypeScript checking
- **Testing**: Automated test execution with coverage reporting
- **Security**: Dependency auditing and vulnerability scanning
- **Performance**: Lighthouse audits on pull requests
- **Deployment**: Automatic deployment to Vercel
- **Dependency Management**: Automated dependency updates via Dependabot

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Notion](https://notion.so) for the amazing API
- [Motion](https://motion.dev) for design inspiration
- [Vercel](https://vercel.com) for hosting and deployment
- [Next.js](https://nextjs.org) team for the incredible framework

---

**Built with ❤️ using Next.js and TypeScript**
