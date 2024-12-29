# Weather Forecast Application

A simple weather forecast application built using **Tailwind CSS**, **HTML**, and **JavaScript**. The application allows users to search for a city and view current weather conditions, as well as a 5-day weather forecast.

---

## Project Structure

weather-forecast-app/
│ ├── assets/ # Static assets (images, icons, etc.)
│ ├── src/ # Source code files
│ ├── index.html # Main HTML file
│ ├── input.css # Tailwind CSS configuration file (input)
│ ├── output.css # Compiled CSS file (output)
│ ├── script.js # JavaScript file for app functionality
│ ├── package-lock.json # Auto-generated package lock file
│ ├── package.json # Node.js package configuration
│ ├── tailwind.config.js # Tailwind CSS configuration file

---

## Features

- Search for any city and view the current weather.
- View a 5-day weather forecast with detailed data (temperature, wind speed, humidity, etc.).
- City search is enhanced with a dropdown list of recent cities.
- City list is saved in session storage to persist across sessions.
- Tailwind CSS for responsive and minimal styling.

---

## Installation

1. Clone the repository:
   git clone https://github.com/your-username/weather-forecast-app.git
   cd weather-forecast-app

2. Install the necessary dependencies:
   npm install

3. Build the CSS with Tailwind:
   npx tailwindcss -i ./src/input.css -o ./src/output.css --watch

4. Open index.html in your browser to use the weather application.

---

## Technologies Used

Tailwind CSS: A utility-first CSS framework for creating responsive and modern user interfaces.
JavaScript: To handle the application's logic, fetching weather data, and handling user interactions.
HTML: For the basic structure of the web page.

---

## Author

Developed by Akshay Dhongade.
