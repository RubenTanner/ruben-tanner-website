# Ruben Tanner - Personal Portfolio Website

A modern, interactive portfolio website showcasing my work as a software engineering student and developer. Built with vanilla HTML, CSS, and JavaScript, featuring a custom blog system, GitHub integration, and other funky elements.

🌐 **Live Site**: [ruben-tanner.uk](https://ruben-tanner.uk)

## ✨ Features

### 🎨 Core Website

- **Responsive Design**: Fully optimised for desktop, tablet, and mobile devices
- **Dark/Light Mode**: Automatic system preference detection with manual toggle
- **Modern UI**: Clean, professional design with smooth animations and transitions
- **Custom Cursor**: Interactive cursor effects for enhanced user experience
- **Accessibility**: Built with semantic HTML and ARIA labels for screen readers

### 📝 Blog System

- **Full CMS**: Complete content management system with admin panel
- **Markdown Support**: Write posts in Markdown with live preview
- **Syntax Highlighting**: Code blocks with automatic language detection
- **Tag System**: Organise posts with custom tags
- **View Tracking**: Automatic post view counting
- **SEO Optimized**: Meta tags and structured data for better search visibility

### 🚀 Interactive Features

- **GitHub Integration**: Live GitHub activity, repository stats, and language breakdown
- **Particle System**: Real-time physics simulation with mouse interaction
- **Chess Game**: Playable chess with computer opponent (random moves) TODO: add stockfish or something
- **Contact Form**: Integrated with Formspree for message handling

### 🔧 Technical Features

- **Express.js Backend**: Custom server for blog functionality and static file serving
- **API Endpoints**: RESTful API for blog operations
- **Error Handling**: fallbacks for external API failures
- **Performance Optimised**: Efficient loading and rendering

## 🛠️ Tech Stack

### Frontend

- **HTML5**: Semantic markup with modern standards
- **CSS3**: Custom properties, Grid, Flexbox, animations
- **Vanilla JavaScript**: ES6+ features, async/await, modules
- **Font Awesome**: Icon library for UI elements
- **Google Fonts**: Inter, Space Grotesk, and Fira Code typography

### Backend

- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **express-session**: Session management for admin auth
- **marked**: Markdown parsing with syntax highlighting
- **front-matter**: YAML frontmatter parsing for blog posts
- **fs-extra**: Enhanced file system operations

### External APIs

- **GitHub API**: Repository data and activity feeds
- **Formspree**: Contact form handling
- **Ko-fi**: Donation widget integration

### Chess Integration

- **Chess.js**: Chess game logic and validation
- **Chessboard2**: Interactive chess board UI

## 📁 Project Structure

```
ruben-tanner-website/
├── public/ # Static files served by Express
│ ├── assets/ # CSS, JS, and other assets
│ │ ├── main.css # Main stylesheet with CSS variables
│ │ ├── script.js # Core JavaScript functionality
│ │ ├── blog.js # Blog-specific JavaScript
│ │ ├── chess.js # Chess game implementation
│ │ ├── particles.js # Particle system with physics
│ │ └── images/ # Favicons and profile images
│ ├── admin/ # Admin panel for blog management
│ │ ├── index.html # Admin login page
│ │ └── blog.html # Blog management interface
│ ├── blog/ # Blog pages
│ │ ├── index.html # Blog listing page
│ │ └── post-template.html # Individual post template
│ ├── index.html # Main homepage
│ └── 404.html # Custom 404 error page
├── blog-content/ # Markdown files for blog posts
├── blog-posts.json # Blog post metadata database
├── server.js # Express server with API routes
├── package.json # Dependencies and scripts
├── .env # Environment variables (not in repo)
├── .gitignore # Git ignore rules
└── README.md # This file
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or later)
- **npm** (comes with Node.js)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/RubenTanner/ruben-tanner-website.git
   cd ruben-tanner-website
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env

   # Edit .env with your admin credentials

   ```

4. **Start the development server**

   ```bash
   npm start

   # or

   node server.js
   ```

5. **Access the website**
   - Main site: `http://localhost:3000`
   - Admin panel: `http://localhost:3000/admin`

## 🔐 Admin Panel

The blog system includes a secure admin panel for content management:

- **Login**: `/admin` - Secure authentication required
- **Create Posts**: Markdown editor with live preview
- **Manage Content**: Edit, delete, and organize blog posts
- **View Analytics**: Track post views and engagement

### Admin Setup

1. Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` in your `.env` file
2. Access `/admin` and log in with your credentials
3. Start creating and managing blog content

## 🎮 Interactive Features

### Particle System

- Real-time physics simulation with 150+ particles
- Mouse interaction (attraction/repulsion)
- Customizable parameters (particle count, interaction radius)
- Performance optimized with adaptive quality

### Chess Game

- Full chess implementation with legal move validation
- Interactive board with drag-and-drop or click-to-move
- Computer opponent (currently random moves)
- PGN notation display

### GitHub Integration

- Live repository statistics
- Recent activity feed with clickable links
- Programming language breakdown with visual charts
- Automatic fallback for API rate limits

## 🎨 Customization

### Themes

The site supports both light and dark themes with CSS custom properties:

```css
:root {
--bg: #f8f9fa;
--text-primary: #1a1a2e;
--accent: #4169e1;
/_ ... more variables _/
}
```

### Adding Blog Posts

1. Use the admin panel at `/admin`
2. Write in Markdown with frontmatter support
3. Add tags and metadata
4. Publish instantly

## 📊 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimised for LCP, FID, and CLS
- **Accessibility**: WCAG 2.1 AA compliant
- **SEO**: Structured data and meta tags

## 🤝 Contributing

Contributions are welcome! Please feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Contact

- **Website**: [ruben-tanner.uk](https://ruben-tanner.uk)
- **GitHub**: [@RubenTanner](https://github.com/RubenTanner)
- **LinkedIn**: [Ruben Tanner](https://www.linkedin.com/in/ruben-tanner-75a03321a/)
