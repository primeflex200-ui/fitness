# PrimeFlex - Fitness & Wellness App

A comprehensive fitness and wellness application built with modern web technologies.

## Features

- AI-powered diet plan generator
- Workout tracking and scheduling
- Progress tracking and analytics
- Water intake reminders
- Supplement advisor chatbot
- Nutrition tracking
- Body fat calculator
- Step tracker
- Community features
- Trainer video uploads

## Technologies Used

- **Frontend**: React, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn-ui
- **Backend**: Supabase (Database, Authentication, Storage)
- **Mobile**: Capacitor (Android/iOS)
- **AI Integration**: OpenAI API

## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Supabase account for backend services
- OpenAI API key for AI features

### Installation

```sh
# Clone the repository
git clone https://github.com/primeflex200-ui/fitness.git

# Navigate to the project directory
cd fitness

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

## Building for Production

### Web Build
```sh
npm run build
```

### Android APK Build
```sh
npm run build
npx cap sync android
npx cap open android
```

Then build the APK from Android Studio.

## Project Structure

- `/src` - Source code
  - `/components` - Reusable React components
  - `/pages` - Application pages/routes
  - `/services` - API and service integrations
  - `/hooks` - Custom React hooks
  - `/contexts` - React context providers
- `/android` - Android native project
- `/supabase` - Database migrations and functions
- `/public` - Static assets

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.
