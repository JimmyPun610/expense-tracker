# Expense Tracker Pro 💰

A modern, responsive, and offline-capable (PWA) web application built with Angular to help users track their personal finances, analyze spending habits, and scan receipts using local OCR.

## ✨ Key Features

* **Track Income & Expenses:** Easily log your daily financial transactions with categories, dates, and remarks.
* **📸 Smart Receipt Scanning:** Upload a photo of your receipt and the app will automatically extract the amount, date, and category. Powered by **Tesseract.js**, the OCR runs 100% locally in your browser, ensuring your financial data never leaves your device.
* **📊 Dashboard & Reports:** Visualize your spending with interactive charts, category breakdowns, and daily trends. Compare your current month's spending against the previous month.
* **🧮 Built-in Calculator:** Crunch numbers directly within the transaction form without switching apps.
* **🌍 Multi-language Support:** Built with i18n support (defaulting to English) using JSON resource files for easy translation updates.
* **📱 Responsive & PWA Ready:** Designed to work flawlessly on desktop, tablet, and mobile devices. Supports offline mode as a Progressive Web App.
* **🔒 Privacy-First Storage:** All transaction data is stored securely in your browser's `localStorage`. No cloud databases, no tracking.

## 🛠️ Tech Stack

* **Framework:** Angular
* **Styling:** Tailwind CSS
* **Icons:** FontAwesome
* **OCR Engine:** Tesseract.js (Client-side)
* **CI/CD:** GitHub Actions

## 🚀 Getting Started

### Prerequisites
* Node.js (v18 or higher recommended)
* npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd YOUR_REPO_NAME
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000` (or the port specified in your terminal).

## 🔄 CI/CD Pipeline

This project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that automatically:
* Installs dependencies
* Runs the Angular linter to ensure code quality
* Builds the application for production
* Uploads the build artifacts

The pipeline runs automatically on pushes and pull requests to the `main` or `master` branch.

## 📝 License

This project is open-source and available under the MIT License.
