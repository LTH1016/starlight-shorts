# 🎬 Short Drama Platform

A modern, responsive short drama platform built with React, TypeScript, and Tailwind CSS. Features a sleek dark theme design with comprehensive drama browsing, categorization, and user management capabilities.

## ✨ Features

### 🎯 Core Features
- **Drama Browsing**: Browse and discover short dramas with detailed information
- **Category System**: Organized drama categories (修仙玄幻, 浪漫言情, 校园青春, etc.)
- **Search Functionality**: Real-time search with filters and suggestions
- **User Favorites**: Save and manage favorite dramas
- **Ranking System**: View trending and top-rated content
- **User Profiles**: Personal user accounts and preferences

### 🎨 Design & UX
- **Responsive Design**: Mobile-first approach with seamless desktop experience
- **Dark Theme**: Modern dark UI with pink accent colors
- **Smooth Animations**: Polished transitions and hover effects
- **Intuitive Navigation**: Clean top navigation with easy access to all features
- **Card-based Layout**: Beautiful drama cards with cover images and metadata

### 🛠️ Technical Features
- **TypeScript**: Full type safety and better development experience
- **Component Architecture**: Modular, reusable React components
- **State Management**: React hooks and context for efficient state handling
- **Error Boundaries**: Graceful error handling and user feedback
- **Performance Optimized**: Lazy loading and optimized rendering

## 🚀 Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui component library
- **Icons**: Lucide React icons
- **State Management**: React Context + Hooks
- **Routing**: React-based navigation system

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/LTH1016/short-drama-platform.git
   cd short-drama-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Layout components
│   ├── DramaCard.tsx   # Drama display card
│   ├── CategoryFilter.tsx
│   └── TopNavigation.tsx
├── pages/              # Page components
│   ├── HomePage.tsx
│   ├── CategoryPage.tsx
│   ├── FavoritePage.tsx
│   └── ProfilePage.tsx
├── hooks/              # Custom React hooks
│   ├── useDramas.ts
│   └── useAuth.ts
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── types/              # TypeScript type definitions
│   ├── drama.ts
│   └── user.ts
└── lib/                # Utility functions
    └── utils.ts
```

## 🎮 Usage

### Navigation
- **Top Navigation**: Access categories, rankings, favorites, and user profile
- **Search**: Use the search bar to find specific dramas
- **Categories**: Browse dramas by genre and type

### Drama Interaction
- **View Details**: Click on any drama card to see detailed information
- **Add to Favorites**: Heart icon to save dramas to your favorites
- **Rating System**: View and interact with drama ratings

### User Features
- **Profile Management**: Access user settings and preferences
- **Favorites**: Manage your saved dramas
- **Viewing History**: Track your drama watching progress

## 🎨 Customization

### Theme Colors
The platform uses a custom color scheme defined in `tailwind.config.js`:
- **Primary**: Pink accent colors for highlights and interactions
- **Background**: Dark theme with multiple gray shades
- **Text**: High contrast white and gray text for readability

### Adding New Categories
To add new drama categories, update the categories data in `src/hooks/useDramas.ts`:

```typescript
const categories = [
  { id: 'new-category', name: '新分类', color: '#your-color' },
  // ... existing categories
];
```

## 🚀 Building for Production

```bash
npm run build
# or
pnpm build
# or
yarn build
```

The built files will be in the `dist/` directory, ready for deployment.

## 📱 Mobile Support

The platform is fully responsive and optimized for:
- **Mobile phones** (320px and up)
- **Tablets** (768px and up)
- **Desktop** (1024px and up)
- **Large screens** (1440px and up)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the comprehensive icon set
- **Vite** for the lightning-fast build tool

---

**Built with ❤️ by LTH1016**
