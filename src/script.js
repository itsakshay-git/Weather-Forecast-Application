const searchInput = document.querySelector("#search");
const locationButton = document.querySelector("#current_location");
const listContainer = document.querySelector("#list_container");
const toast = document.getElementById("toast");
const apiKey = "136afb528c2654dd1bc858af48342b0e";

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

locationButton.addEventListener("click", async function () {
  sessionStorage.setItem("current_location", true);
  sessionStorage.setItem("city_name", false);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getGeoLocation);
  } else {
    showToast("geolocation is not supported in this browser", "error");
  }
});

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

async function getWeather(city) {
  const result = await dataFetcher("weather", city);
  return result;
}

async function getForecast(city) {
  const result = await dataFetcher("forecast", city);
  return result;
}

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

function filterData(weatherData, forecastData) {
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

function weatherRender(weather, forecast) {
  // weather render
  const container = document.querySelector("#container");
  const weatherState = document.querySelector("#weather_states");

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
    icon.innerHTML = `
  <div class="flex justify-center items-center">
    <dotlottie-player src="https://lottie.host/96940977-001d-484b-9f22-a8b553a1ccb6/krufmMIABE.lottie" background="transparent" speed="1" style="width: 220px; height: 220px" loop autoplay></dotlottie-player>
</div>`;
  } else if (weather.weather === "Clear") {
    const icon = document.querySelector(".icon");
    icon.innerHTML = `<div class="flex justify-center items-center">
    <dotlottie-player src="https://lottie.host/960a3800-51f5-456b-b845-b48d53e2bbb6/kxTNUx0w16.lottie" background="transparent" speed="1" style="width: 220px; height: 220px" loop autoplay></dotlottie-player>
  </div>`;
  } else if (weather.weather === "Rain") {
    const icon = document.querySelector(".icon");
    icon.innerHTML = `<dotlottie-player src="https://lottie.host/8b0bba31-5bf9-4a53-98c1-9575e5e70d56/hiMJPW4QTL.lottie" background="transparent" speed="1" style="width: 220px; height: 220px" loop autoplay></dotlottie-player>`;
  } else if (weather.weather === "Fog") {
    const icon = document.querySelector(".icon");
    icon.innerHTML = `<dotlottie-player src="https://lottie.host/f2c74939-410d-40ea-b753-bb51a72223de/25Ven1fMl0.lottie" background="transparent" speed="1" style="width: 220px; height: 220px" loop autoplay></dotlottie-player>`;
  } else if (weather.weather === "Snow") {
    const icon = document.querySelector(".icon");
    icon.innerHTML = `<dotlottie-player src="https://lottie.host/9fca6880-4797-4a54-a051-a18832f0b6f0/jxlxA3MTYQ.lottie" background="transparent" speed="1" style="width: 220px; height: 220px" loop autoplay></dotlottie-player>`;
  } else if (weather.weather === "Mist") {
    const icon = document.querySelector(".icon");
    icon.innerHTML = `<img src="../assets/mist-and-cloud.png" style="width: 220px; height: 220px" />`;
  } else if (weather.weather === "Haze") {
    const icon = document.querySelector(".icon");
    icon.innerHTML = `<dotlottie-player src="https://lottie.host/87629050-b236-4bf1-bd80-6a275018e08c/yvLxzTtJ40.lottie" background="transparent" speed="1" style="width: 220px; height: 220px" loop autoplay></dotlottie-player>`;
  } else if (weather.weather === "Smoke") {
    const icon = document.querySelector(".icon");
    icon.innerHTML = `<img src="../assets/smockcloud.png" style="width: 220px; height: 220px" />`;
  }

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
      wetherForecastIcon = "../assets/Cloud.png";
    } else if (element.weather[0].main === "Clear") {
      wetherForecastIcon = "../assets/Sun.png";
    } else if (element.weather[0].main === "Rain") {
      wetherForecastIcon = "../assets/Light Rain.png";
    } else if (element.weather[0].main === "Fog") {
      wetherForecastIcon = "../assets/Fog1.png";
    } else if (element.weather[0].main === "Snow") {
      wetherForecastIcon = "../assets/Snow.png";
    } else if (element.weather[0].main === "Mist") {
      wetherForecastIcon = "../assets/Fog.png";
    } else if (element.weather[0].main === "Haze") {
      wetherForecastIcon = "../assets/Haze.png";
    } else if (element.weather[0].main === "Smoke") {
      wetherForecastIcon = "../assets/smockcloud.png";
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

function showToast(message, type) {
  toast.textContent = message;
  toast.className = `toast${type}`;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 3000);
}

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

function updateCityList(params) {
  let cityList = JSON.parse(sessionStorage.getItem("cityList")) || [];
  if (!cityList.includes(params)) {
    cityList.push(params);
  }
  sessionStorage.setItem("cityList", JSON.stringify(cityList));
}
