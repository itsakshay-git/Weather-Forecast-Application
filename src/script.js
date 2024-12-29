const searchInput = document.querySelector("#search");
const locationButton = document.querySelector("#current_location");
const listContainer = document.querySelector("#list_container");
const toast = document.getElementById("toast");
const apiKey = "136afb528c2654dd1bc858af48342b0e";


/*
  Adds an event listener to the search input field to handle the "keydown" event.
  This function performs the following actions:
  1. Calls the `searchCity` function to perform a live city search as the user types.
  2. Listens for the "Enter" key press:
     - Retrieves the entered city name.
     - Updates the city list with the entered city name.
     - Hides the city list container.
     - Checks if the entered city name is valid:
       - If valid, initializes weather data retrieval using `weatherInitializer`.
       - If invalid, displays an error message using `showToast`.
  3. Handles any errors during the process and displays an appropriate error message using `showToast`.
*/
searchInput.addEventListener("keydown", async function (event) {
  searchCity(event.target.value);
  if (event.key === "Enter") {
    let cityName = event.target.value;
    updateCityList(cityName);
    listContainer.style.display = "none";

    try {
      if (cityName.length) {
        weatherInitializer(cityName, false);
      } else {
        showToast("enter valid city name.", "error");
      }
    } catch (error) {
      showToast(error.message, "error");
    }
  }
});


/*
  Adds an event listener to the location button to handle the "click" event.
  This function performs the following actions:
  1. Stores session data to indicate that the current location should be used:
     - Sets "current_location" to true in session storage.
     - Sets "city_name" to false in session storage.
  2. Checks if geolocation is supported by the browser:
     - If supported, retrieves the user's current location using `navigator.geolocation.getCurrentPosition`
       and passes the position data to the `getGeoLocation` function.
     - If not supported, displays an error message using `showToast` indicating that geolocation is not available.
*/
locationButton.addEventListener("click", async function () {
  sessionStorage.setItem("current_location", true);
  sessionStorage.setItem("city_name", false);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getGeoLocation);
  } else {
    showToast("geolocation is not supported in this browser", "error");
  }
});


/*
  Listens for the "DOMContentLoaded" event to initialize the app:
  1. Retrieves the recent city and current location status from session storage.
  2. If a recent city is stored and current location is not selected:
     - Sets the search input to the recent city.
     - Initializes weather data for the city.
  3. Otherwise, checks geolocation support:
     - Retrieves the user's location if supported.
     - Shows an error if geolocation is unavailable.
*/
document.addEventListener("DOMContentLoaded", async function () {
  const getRecentCity = sessionStorage.getItem("city_name");
  const getCurrentLocation = JSON.parse(
    sessionStorage.getItem("current_location")
  );

  if (typeof getRecentCity === "string" && getCurrentLocation === false) {
    searchInput.value = getRecentCity;
    weatherInitializer(getRecentCity, true);
  } else {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(getGeoLocation);
    } else {
      showToast("geolocation is not supported in this browser", "error");
    }
  }
});


/*
  Handles geolocation data and initializes weather retrieval:
  1. Extracts latitude and longitude from the geolocation position object.
  2. Clears the search input field.
  3. If valid coordinates are provided, initializes weather data using `weatherInitializer`.
  4. Handles errors during the process and displays an error message using `showToast`.
*/
async function getGeoLocation(geoPosition) {
  const latitude = geoPosition.coords.latitude;
  const longitude = geoPosition.coords.longitude;
  searchInput.value = null;

  try {
    if (latitude && longitude) {
      weatherInitializer({ latitude, longitude }, true);
    }
  } catch (error) {
    showToast(error.message, "error");
  }
}


/*
  Handles geolocation data and initializes weather retrieval:
  1. Fetch weather data by calling dataFetcher with valid data and city name passed to get weather data.
  2. returns the fetched data.
*/
async function getWeather(city) {
  const result = await dataFetcher("weather", city);
  return result;
}

/*
  Handles geolocation data and initializes weather retrieval:
  1. Fetch forecast data by calling dataFetcher with valid data and city name passed to get forecast data.
  2. returns the fetched data.
*/
async function getForecast(city) {
  const result = await dataFetcher("forecast", city);
  return result;
}



/**
  Fetches data from the OpenWeather API based on the endpoint and city information.

  @param {string} endpoint - The specific API endpoint to call (e.g., "weather", "forecast").
  @param {string|Object} city - Can be either:
    - A city name (string) for a search by city name.
    - An object with `latitude` and `longitude` properties for a search by coordinates.

  1. If the city is a string, makes a request to the API using the city name.
  2. If the city is an object with latitude and longitude, makes a request using these coordinates.
  3. Parses the JSON response and returns the result.
  4. Handles any errors and displays an error message using `showToast`.
*/
async function dataFetcher(endpoint, city) {
  if (typeof city === "string") {
    try {
      const weatherData = await fetch(
        `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${apiKey}`
      );
      const response = await weatherData.json();
      const result = response;
      return result;
    } catch (error) {
      showToast(error.message, "error");
    }
  } else {
    try {
      const data = await fetch(
        `https://api.openweathermap.org/data/2.5/${endpoint}?lat=${city.latitude}&lon=${city.longitude}&appid=${apiKey}`
      );
      const response = await data.json();
      const result = response;
      return result;
    } catch (error) {
      showToast(error.message, "error");
    }
  }
}


/**
  Initializes weather data and handles rendering based on the city and geolocation status.

  @param {string|Object} city - The city name (string) or an object with latitude and longitude for geolocation.
  @param {boolean} geolocation - A flag indicating whether the weather data is based on the current location (true/false).

  1. Fetches weather and forecast data for the given city.
  2. If the API response is successful (cod 200 for both weather and forecast):
     - Filters the data.
     - If geolocation is not used, stores the city name and sets session storage for city selection.
     - Calls `weatherRender` to display the filtered weather and forecast data.
  3. Handles error cases (e.g., invalid API keys or city not found) by showing an appropriate error message.
*/
async function weatherInitializer(city, geolocation) {
  const weatherData = await getWeather(city);
  const forecastData = await getForecast(city);

  if (weatherData.cod === 200 && forecastData.cod === "200") {
    const { filteredWeatherData, filteredForecastData } = filterData(
      weatherData,
      forecastData
    );
    if (!geolocation) {
      if (filteredWeatherData && filteredForecastData) {
        sessionStorage.setItem("city_name", city);
        sessionStorage.setItem("current_location", false);
      }
    }

    weatherRender(filteredWeatherData, filteredForecastData);
  } else if (weatherData.cod === 401 || forecastData.cod === 401) {
    showToast(weatherData.message, "error");
  } else if (weatherData.cod === "404" || forecastData.cod === "404") {
    showToast(weatherData.message, "error");
  }
}


/**
  Filters the weather and forecast data to extract relevant information.

  @param {Object} weatherData - The weather data object retrieved from the weather API.
  @param {Object} forecastData - The forecast data object retrieved from the forecast API.

  1. Filters the weather data to include:
     - City name, country, temperature, wind speed, humidity, weather condition, description, icon, and date.
  2. Filters the forecast data to exclude entries for the current date.
  3. Reduces the forecast data to get the latest forecast for each day at 18:00.
  4. Returns an object containing the filtered weather data and the filtered forecast data.
*/
function filterData(weatherData, forecastData) {
  console.log(weatherData)
  // weather filter
  const filteredWeatherData = {
    name: weatherData.name,
    country: weatherData.sys.country,
    temp: weatherData.main.temp,
    wind: weatherData.wind.speed,
    humidity: weatherData.main.humidity,
    weather: weatherData.weather[0].main,
    description: weatherData.weather[0].description,
    icon: weatherData.weather[0].icon,
    date: weatherData.dt,
  };

  //   forecast filter
  const currentDate = new Date().toISOString().split("T")[0];
  const filteredData = forecastData.list.filter(
    (item) => !item.dt_txt.startsWith(currentDate)
  );

  const filteredForecastData = Object.values(
    filteredData.reduce((acc, item) => {
      const [date, time] = item.dt_txt.split(" ");
      if (!acc[date] || time == "18:00:00") {
        acc[date] = item;
      }
      return acc;
    }, {})
  );

  return { filteredWeatherData, filteredForecastData };
}


/**
  Renders the weather and forecast data to from extract information.

  @param {Object} weather - The weather data object retrieved from the weather API.
  @param {Object} forecast - The forecast data object retrieved from the forecast API.

  1. Get all the elements to insert dynamic data.
  2. converts weather date to local date string.
  3. converts weather temperature from kelvin to celsius.
  4. Checks for weather type and accordingly insert the weather icon.
  5. Insert all the dynamic HTML to respective parent element
*/
function weatherRender(weather, forecast) {
  // weather render
  const container = document.querySelector("#container");
  const weatherState = document.querySelector("#weather_states");
  const phoneScreen = document.querySelector(".phone");
  const phoneWeather = document.querySelector(".phone_weather_states");
  
  // convert date in readable form.
  let timestamp = weather.date;
  const date = new Date(timestamp * 1000);
  const option = { weekday: "long", day: "numeric", year: "numeric" };
  const formattedDate = date.toLocaleDateString("en-US", option);
  
  // convert the temp to celsius.
  const kelvin = weather.temp;
  const celsius = kelvin - 273.15;
  //2 decimal places
  const formattedCelsius = celsius.toFixed(1);
  
  if (weather.weather === "Clouds") {
    const icon = document.querySelector(".icon");
    const weatherIcon = document.querySelector(".weather_i");
    console.log(weatherIcon)
    icon.innerHTML = `
      <div class="flex justify-center items-center">
        <dotlottie-player src="https://lottie.host/96940977-001d-484b-9f22-a8b553a1ccb6/krufmMIABE.lottie" background="transparent" speed="1" style="width: 220px; height: 220px" loop autoplay></dotlottie-player>
      </div>`;
    weatherIcon.innerHTML = `<dotlottie-player src="https://lottie.host/96940977-001d-484b-9f22-a8b553a1ccb6/krufmMIABE.lottie" background="transparent" speed="1" style="width: 180px; height: 180px" loop autoplay></dotlottie-player>`

  } else if (weather.weather === "Clear" && weather.icon === "01d") {
    const icon = document.querySelector(".icon");
    const weatherIcon = document.querySelector(".weather_i");
    icon.innerHTML = `<div class="flex justify-center items-center">
    <dotlottie-player src="https://lottie.host/960a3800-51f5-456b-b845-b48d53e2bbb6/kxTNUx0w16.lottie" background="transparent" speed="1" style="width: 220px; height: 220px" loop autoplay></dotlottie-player>
    </div>`;
    weatherIcon.innerHTML = `<dotlottie-player src="https://lottie.host/960a3800-51f5-456b-b845-b48d53e2bbb6/kxTNUx0w16.lottie" background="transparent" speed="1" style="width: 180px; height: 180px" loop autoplay></dotlottie-player>`;

  } else if (weather.weather === "Clear" && weather.icon === "01n") {
    const icon = document.querySelector(".icon");
    const weatherIcon = document.querySelector(".weather_i");
    icon.innerHTML = `<img src="../assets/moonlight.png" style="width: 200px; height: 200px" />`;
    weatherIcon.innerHTML = `<img src="../assets/moonlight.png" style="width: 170px; height: 170px" />`;

  } else if (weather.weather === "Rain") {
    const icon = document.querySelector(".icon");
    const weatherIcon = document.querySelector(".weather_i");
    icon.innerHTML = `<dotlottie-player src="https://lottie.host/8b0bba31-5bf9-4a53-98c1-9575e5e70d56/hiMJPW4QTL.lottie" background="transparent" speed="1" style="width: 220px; height: 220px" loop autoplay></dotlottie-player>`;
    weatherIcon.innerHTML = `<dotlottie-player src="https://lottie.host/8b0bba31-5bf9-4a53-98c1-9575e5e70d56/hiMJPW4QTL.lottie" background="transparent" speed="1" style="width: 180px; height: 180px" loop autoplay></dotlottie-player>`;

  } else if (weather.weather === "Fog") {
    const icon = document.querySelector(".icon");
    const weatherIcon = document.querySelector(".weather_i");
    icon.innerHTML = `<dotlottie-player src="https://lottie.host/f2c74939-410d-40ea-b753-bb51a72223de/25Ven1fMl0.lottie" background="transparent" speed="1" style="width: 220px; height: 220px" loop autoplay></dotlottie-player>`;
    weatherIcon.innerHTML = `<dotlottie-player src="https://lottie.host/f2c74939-410d-40ea-b753-bb51a72223de/25Ven1fMl0.lottie" background="transparent" speed="1" style="width: 180px; height: 180px" loop autoplay></dotlottie-player>`;

  } else if (weather.weather === "Snow") {
    const icon = document.querySelector(".icon");
    const weatherIcon = document.querySelector(".weather_i");
    icon.innerHTML = `<dotlottie-player src="https://lottie.host/9fca6880-4797-4a54-a051-a18832f0b6f0/jxlxA3MTYQ.lottie" background="transparent" speed="1" style="width: 220px; height: 220px" loop autoplay></dotlottie-player>`;
    weatherIcon.innerHTML = `<dotlottie-player src="https://lottie.host/9fca6880-4797-4a54-a051-a18832f0b6f0/jxlxA3MTYQ.lottie" background="transparent" speed="1" style="width: 180px; height: 180px" loop autoplay></dotlottie-player>`;

  } else if (weather.weather === "Mist") {
    const icon = document.querySelector(".icon");
    const weatherIcon = document.querySelector(".weather_i");
    icon.innerHTML = `<img src="../assets/mist-and-cloud.png" style="width: 220px; height: 220px" />`;
    weatherIcon.innerHTML = `<img src="../assets/mist-and-cloud.png" style="width: 180px; height: 180px" />`;

  } else if (weather.weather === "Haze") {
    const icon = document.querySelector(".icon");
    const weatherIcon = document.querySelector(".weather_i");
    icon.innerHTML = `<dotlottie-player src="https://lottie.host/87629050-b236-4bf1-bd80-6a275018e08c/yvLxzTtJ40.lottie" background="transparent" speed="1" style="width: 220px; height: 220px" loop autoplay></dotlottie-player>`;
    weatherIcon.innerHTML = `<dotlottie-player src="https://lottie.host/87629050-b236-4bf1-bd80-6a275018e08c/yvLxzTtJ40.lottie" background="transparent" speed="1" style="width: 180px; height: 180px" loop autoplay></dotlottie-player>`;

  } else if (weather.weather === "Smoke") {
    const icon = document.querySelector(".icon");
    const weatherIcon = document.querySelector(".weather_i");
    icon.innerHTML = `<img src="../assets/smockcloud.png" style="width: 220px; height: 220px" />`;
    weatherIcon.innerHTML = `<img src="../assets/smockcloud.png" style="width: 180px; height: 180px" />`;
  }

  phoneScreen.innerHTML =`
    <div class="text-center mt-3 mb-3">
      <span class="text-center mt-auto bg-custom-light-gray p-2 rounded-lg text-xs">${weather.description}</span>
  </div>
  <div class="flex text-white items-center justify-center self-end mb-3">
      <p class="text-4xl">${formattedCelsius}</</p> 
      <span class="text-2xl ml-1 mr-10 custom-360-414:mr-5"><sup>°C</sup></span>
      <p class="text-4xl">${weather.name}</p>
  </div>
      <p class="text-gray-400 pl-1 text-center">${formattedDate}</p>
  `;

  phoneWeather.innerHTML = `<div class="flex gap-2 rounded-xl bg-custom-light-gray p-1 justify-center items-center">
  <div class="states flex p-2">
      <div class="mr-1 mt-1">
          <img src="../assets/Temperature.png" height="20" width="20" alt="temperature_icon">
      </div>
      <div>
          <p class="text-[12px]">Temperature</p>
          <p class="text-[12px]">${formattedCelsius}</p>
      </div>
  </div>
      <span class="border border-gray-400 has-[100%]: h-14"></span>
  <div class="states flex p-4">
      <div class="mr-2 mt-1">
          <img src="../assets/Wind.png" height="19" width="19" alt="wind_icon">
      </div>
      <div>
          <p class="text-[12px]">Wind</p>
          <p class="text-[12px]">${weather.wind}ms</p>
      </div>
  </div>
      <span class="border border-gray-400 has-[100%]: h-14"></span>
  <div class="states flex p-4">
      <div class="mr-2 mt-1">
          <img src="../assets/Humidity.png" height="20" width="20" alt="humidity_icon">
      </div>
      <div>
          <p class="text-[12px]">Humidity</p>
          <p class="text-[12px]">${weather.humidity}</p>
      </div>
  </div>
  </div>`

  container.innerHTML = `
  <section id="container" class="text-white hidden sm:block portrait:hidden">
    <div class="flex text-white items-center self-end">
        <p class="2xl:text-9xl xl:text-9xl md:text-8xl sm:text-6xl">${formattedCelsius}</p> 
        <span class="text-5xl ml-1 mr-10"><sup>°C</sup></span>
        <p class="text-end mt-auto bg-custom-light-gray p-2 rounded-lg text-xl">${weather.description}</p>
    </div>
    <div>
        <p class="2xl:text-6xl xl:text-6xl mb-2 md:text-4xl sm:text-3xl">${weather.name}</p>
        <p class="text-gray-400 pl-1">${formattedDate}</p>
    </div>
</section>`;

  weatherState.innerHTML = `
  <div class="states flex p-4">
      <div class="mr-2 mt-1">
          <img src="../assets/Temperature.png" height="20" width="20" alt="temperature_icon">
      </div>
      <div>
          <p>Temperature</p>
          <p>${formattedCelsius}</p>
      </div>
  </div>
      <span class="border border-gray-400 has-[100%]: h-14"></span>
  <div class="states flex p-4">
      <div class="mr-2 mt-1">
          <img src="../assets/Wind.png" height="19" width="19" alt="wind_icon">
      </div>
      <div>
          <p>Wind</p>
          <p>${weather.wind} ms</p>
      </div>
  </div>
      <span class="border border-gray-400 has-[100%]: h-14"></span>
  <div class="states flex p-4">
      <div class="mr-2 mt-1">
          <img src="../assets/Humidity.png" height="20" width="20" alt="humidity_icon">
      </div>
      <div>
          <p>Humidity</p>
          <p>${weather.humidity}</p>
      </div>
  </div>`;

  // forecast render
  forecast.forEach((element, index) => {
    const date = element.dt_txt.split(" ")[0];
    const newDate = new Date(date);
    const option = { weekday: "long", day: "numeric", year: "numeric" };
    const formattedDate = newDate.toLocaleDateString("en-US", option);
    let wetherForecastIcon;

    if (element.weather[0].main === "Clouds") {
      wetherForecastIcon = "./assets/Cloud.png";
    } else if (element.weather[0].main === "Clear") {
      wetherForecastIcon = "./assets/Sun.png";
    } else if (element.weather[0].main === "Rain") {
      wetherForecastIcon = "./assets/Light Rain.png";
    } else if (element.weather[0].main === "Fog") {
      wetherForecastIcon = "./assets/Fog1.png";
    } else if (element.weather[0].main === "Snow") {
      wetherForecastIcon = "./assets/Snow.png";
    } else if (element.weather[0].main === "Mist") {
      wetherForecastIcon = "./assets/Fog.png";
    } else if (element.weather[0].main === "Haze") {
      wetherForecastIcon = "./assets/Haze.png";
    } else if (element.weather[0].main === "Smoke") {
      wetherForecastIcon = "./assets/smockcloud.png";
    }

    const eachForecast = document.querySelectorAll(".forecast");
    eachForecast[index].innerHTML = `
      <p class="text-center">${formattedDate}</p>
      <div class="flex justify-center items-center mt-3 mb-3">
          <img src="${wetherForecastIcon}" height="50" width="50" alt="forecast_icon">
      </div>
      <div class="flex gap-8">
          <div class="flex flex-col justify-center items-center gap-2">                   
              <img src="../assets/Temperature.png" height="20" width="20" alt="temperature_icon">
              <p class="text-[12px]">${element.main.temp}</p>
          </div>
              <span class="border border-gray-600 has-[100%]: h-14"></span>
          <div class="flex flex-col justify-center items-center gap-2">                   
              <img src="../assets/Wind.png" height="20" width="20" alt="wind_icon">
              <p class="text-[12px]">${element.wind.speed}ms</p>
          </div>
              <span class="border border-gray-600 has-[100%]: h-14"></span>
          <div class="flex flex-col justify-center items-center gap-2">                   
              <img src="../assets/Humidity.png" height="20" width="20" alt="humidity_icon">
              <p class="text-[12px]">${element.main.humidity}</p>
          </div>
      </div>
        `;
  });
}


/**
 * 
 * @param {string} message 
 * @param {string} type 
 * 
 * 1. Dynamically add the `message` to toast element.
 * 2. Adds classname to toast element.
 * 3. Make the display of toast block form none
 * 4. Runs the timer `setTimeout()` for 3000ms after 3000ms it display will be none.
 */
function showToast(message, type) {
  toast.textContent = message;
  toast.className = `toast${type}`;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}


/**
  Searches and filters a list of cities based on the user's input, displaying matching cities in a dropdown.

  @param {string} event - The user's input from the search field, used to filter the city list.

  1. Clears the current list in the dropdown container.
  2. Retrieves the city list stored in session storage.
  3. Filters the city list based on the input, ignoring case.
  4. Creates and displays list items (`<li>`) for each matching city.
  5. Each list item is clickable and will populate the search input with the selected city and hide the dropdown.
  6. Calls `weatherInitializer` to initialize weather data for the selected city.
  7. Hides the dropdown if no cities match the input.
*/
function searchCity(event) {
  listContainer.innerHTML = "";

  let cityList = JSON.parse(sessionStorage.getItem("cityList"));
  if (!cityList) return;
  const filterCityName = event.trim().toLowerCase();
  const filteredCities = filterCityName
    ? cityList.filter((city) => city.toLowerCase().includes(filterCityName))
    : [];

  filteredCities.forEach((city) => {
    const list = document.createElement("li");
    list.textContent = city;
    list.className = "dropdown_list";
    list.classList.add("P-2");
    list.style.cursor = "pointer";
    list.style.zIndex = "20px";
    list.addEventListener("click", async () => {
      searchInput.value = city;
      listContainer.style.display = "none";
      weatherInitializer(city, false);
    });
    listContainer.appendChild(list);
  });

  listContainer.style.display = filteredCities.length > 0 ? "block" : "none";
}


/**
  Updates the list of cities in session storage by adding a new city if it's not already in the list.

  @param {string} params - The name of the city to be added to the list.

  1. Retrieves the current list of cities from session storage, or initializes it as an empty array if not found.
  2. Checks if the city (`params`) is already in the list.
  3. If not, adds the city to the list.
  4. Saves the updated city list back to session storage.
*/
function updateCityList(params) {
  let cityList = JSON.parse(sessionStorage.getItem("cityList")) || [];
  if (!cityList.includes(params)) {
    cityList.push(params);
  }
  sessionStorage.setItem("cityList", JSON.stringify(cityList));
}
