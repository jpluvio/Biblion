# Biblion

Biblion is a simple, elegant, and fully-featured personal home library manager. Keep track of the books you own, what you've read, where they are physically stored, and who you've lent them to. 

With built-in statistics and a gamified experience, Biblion makes organizing your reading life enjoyable and effortless.

![Biblion Dashboard Preview](./public/icon.png) <!-- Update with actual preview image if needed -->

## 🌟 Core Features in Detail

### 📚 Comprehensive Book Management
Biblion acts as the single source of truth for your private collection:
- **Smart Add**: Enter an ISBN, and Biblion automatically fetches the book's cover, author, page count, and publication details via Google Books and Open Library APIs.
- **Manual Entry**: Missing an ISBN? You can manually input all details, including custom cover images.
- **Reading Status Engine**: Keep your library actionable. Mark books as *To Read*, *Reading*, *Read*, *To Study*, *Studying*, *Paused*, or *Dropped*. The dashboard instantly reflects your active reading list.

### 🗂️ Infinite Hierarchical Organization
Say goodbye to flat tags. Biblion introduces a robust, nested organization system:
- **Categories**: Create infinite trees of categories (e.g., *Non-Fiction > Technology > Programming > Web Development*). Assign custom colors and icons (using Lucide) to make your shelves visually distinct.
- **Physical Locations**: Map your real-world home. Create locations like *Living Room > Left Bookcase > Shelf 3*. You will always know exactly where a physical book is stored.
- **Navigation & Filtering**: The library view features a powerful breadcrumb navigation system, allowing you to drill down into specific sub-categories or physical shelves instantly.

### 🤝 Advanced Loan Tracking
Lending books shouldn't mean losing them.
- **Active Loans Dashboard**: See a dedicated view of every book currently lent out.
- **Borrower Profiles**: Record exactly who has the book and when they took it.
- **Due Dates & Returns**: Set expected return dates. When a book is returned, Biblion safely restores its previous library status (e.g., back to *Read* or *To Read*).

### 📊 Deep Analytics & Gamification
Reading is better when you can see your progress.
- **Interactive Charts Grid**: Visualize your reading habits by year. See the breakdown of books read, pages consumed, and your preferred genres.
- **Experience Points (XP) & Leveling**: Every action grants XP. Adding books, finishing a read, or organizing your shelves levels up your profile.
- **Unlockable Badges**: Earn specific achievements for milestones (e.g., "Page Turner" for reading a 500+ page book, or "Scholar" for hitting reading targets).

### ⚡ Power-User Bulk Actions
Managing a library of 1,000+ books is effortless:
- Enter "Selection Mode" to select multiple books at once.
- Using the floating bulk-action bar, you can instantly assign 50 books to a new physical shelf, change their reading status to *Read*, or move them to a different category in a single click.

### 🎨 Premium UI/UX Design
Biblion is designed to feel like a premium, native application:
- **Warm Aesthetics**: A carefully curated color palette of Stone, Orange, and Amber creates a cozy, library-like atmosphere.
- **Responsive Layout**: Whether you are adding a book from your smartphone while standing at the bookstore, or managing your shelves from a desktop Mac, the interface adapts perfectly.
- **Glassmorphism & Micro-animations**: Smooth transitions, blurred backdrops, and interactive hover states make using Biblion a joy.

---

## 🚀 Getting Started

Biblion is designed to be run locally or on a local network as a personal web application.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18 or newer) and `npm` installed on your machine.

### Installation

1. **Clone or download** this repository to your local machine:
   ```bash
   git clone https://github.com/yourusername/biblion.git
   cd biblion
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Initialize the database**:
   Run the following command to create your local SQLite database:
   ```bash
   npx prisma db push
   ```

### First Launch & Admin Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

3. **Welcome Onboarding**: Since your database is pristine, Biblion will redirect you to the **Welcome** flow.
   - Click through the feature presentation.
   - On the final slide, create your **Admin Account** by entering your name, email, and a secure password.
   - Upon creation, Biblion will automatically scaffold your library with default Categories and Gamification Badges, setting the stage for your collection.

### 🍏 macOS Quick Launcher

If you are using macOS, skip the terminal entirely for daily use.

A script named `Biblion.command` is included in the project root.
1. Make it executable one time only by running: `chmod +x Biblion.command` in the terminal.
2. For daily use, simply **double-click `Biblion.command`** from Finder (or drag it to your Dock). It automatically boots the background server and opens the application in your default web browser.

---

## 📖 Quick Usage Guide

1. **Populate Your Shelves**: Start by defining your physical locations in the Admin Settings.
2. **Scan & Add**: Grab a stack of books and use the "Add Book" button. Try using the ISBN feature for rapid data entry.
3. **Curate**: Use Selection Mode to group books and assign them to your newly created locations and categories.
4. **Read & Track**: Update a book's status to *Reading*. When finished, mark it *Read* to watch your XP grow and your stats dashboard light up.
5. **Protect Your Collection**: Before handing a book to a friend, hit the "Lend Book" button to ensure you never forget who has your favorite novel.

## 🔒 Security & Data Ownership
Biblion is strictly local-first.
- **Absolute Privacy**: Your credentials, reading habits, and private notes are stored entirely on your local machine within the `prisma/dev.db` SQLite database.
- **No Telemetry**: No behavioral data is sent to external servers. External network requests are strictly limited to fetching public book metadata (e.g., from Google APIs) when you explicitly search for an ISBN.

---

*Happy Reading! 📖*
