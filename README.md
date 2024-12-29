# Weather Forecast Application

A simple weather forecast application built using **Tailwind CSS**, **HTML**, and **JavaScript**. The application allows users to search for a city and view current weather conditions, as well as a 5-day weather forecast.

## Github repo

[Weather Forecast Application](https://github.com/itsakshay-git/Weather-Forecast-Application?tab=readme-ov-file)

## Deployed Link

[Weather Forecast Application](https://weather-forecast-tailwind.netlify.app/)

---

## Screenshot

![Screenshot 2024-12-29 221010](https://github.com/user-attachments/assets/906b0256-dafa-41ff-bb8b-fc0b3ec0a07f)

![Screenshot 2024-12-29 220953](https://github.com/user-attachments/assets/493f9ad9-60b4-41ff-9f34-76e5debb2a64)

![Screenshot 2024-12-29 220810](https://github.com/user-attachments/assets/65380c14-3838-411f-bf8c-961b5ba9d206)

## Project Structure

weather-forecast-app/
│ ├── src/ # Source code files
│ ├── assets/ # Static assets (images, icons, etc.)
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
   git clone https://github.com/itsakshay-git/Weather-Forecast-Application.git
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
