const searchInput = document.querySelector("#search");
const locationButton = document.querySelector("#current_location");
const listContainer = document.querySelector("#list_container");
const toast = document.getElementById('toast');
const apiKey = "136afb528c2654dd1bc858af48342b0e";

searchInput.addEventListener("keydown", async function (event) {
    searchCity(event.target.value);
  if (event.key === "Enter") {
    let cityName = event.target.value;
    updateCityList(cityName)
    listContainer.style.display = "none"
    
    try {
        if (cityName.length) {
        const weatherData = await getWeather(cityName);
        const forecastData = await getForecast(cityName);

        if (weatherData.cod === 200 && forecastData.cod === "200") {
          const { filteredWeatherData, filteredForecastData } = filterData(
            weatherData,
            forecastData
          );

          if(filteredWeatherData && filteredForecastData){
            sessionStorage.setItem("city_name", cityName);
            sessionStorage.setItem("current_location", false)
          }

          weatherRender(filteredWeatherData, filteredForecastData);

        } else if (weatherData.cod === 401 || forecastData.cod === 401) {
          showToast(weatherData.message, "error")
        } else if (weatherData.cod === "404" || forecastData.cod === "404") {
          showToast(weatherData.message, "error")
        }
      } else {
        showToast("enter valid city name.", "error")
      }
    } catch (error) {
      showToast(error.message, "error")
    }
  }
});



locationButton.addEventListener("click", async function () {
  sessionStorage.setItem("current_location", true);
  sessionStorage.setItem("city_name", false);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(getGeoLocation);
  } else {
    showToast("geolocation is not supported in this browser", "error")
  }
});




// document.addEventListener("DOMContentLoaded", async function () {
//     const getRecentCity = sessionStorage.getItem("city_name");
//     const getCurrentLocation = JSON.parse(sessionStorage.getItem("current_location"));


//     if(typeof getRecentCity === "string" && getCurrentLocation === false){
//         searchInput.value = getRecentCity;
//         const weatherData = await getWeather(getRecentCity);
//         const forecastData = await getForecast(getRecentCity);

//         if (weatherData.cod === 200 && forecastData.cod === "200") {
//             const { filteredWeatherData, filteredForecastData } = filterData(
//               weatherData,
//               forecastData
//             );
  
//             weatherRender(filteredWeatherData, filteredForecastData);
  
//           } else if (weatherData.cod === 401 || forecastData.cod === 401) {
//             showToast(weatherData.message, "error")
//           } else if (weatherData.cod === "404" || forecastData.cod === "404") {
//             showToast(weatherData.message, "error")
//           }
//     }else{
//         if(navigator.geolocation){
//             navigator.geolocation.getCurrentPosition(getGeoLocation)
//         }else{
//         showToast("geolocation is not supported in this browser", "error")
//         }
//     }

// })



async function getGeoLocation(geoPosition) {
  const latitude = geoPosition.coords.latitude;
  const longitude = geoPosition.coords.longitude;
  searchInput.value = null;

  try {
    if (latitude && longitude) {
      const weatherData = await getWeather({ latitude, longitude });
      const forecastData = await getForecast({ latitude, longitude });

      if (weatherData.cod === 200 && forecastData.cod === "200") {
        const { filteredWeatherData, filteredForecastData } = filterData(
          weatherData,
          forecastData
        );

        weatherRender(filteredWeatherData, filteredForecastData);

      } else if (weatherData.cod === 401 || forecastData.cod === 401) {
        showToast(weatherData.message, "error");
      } else if (weatherData.cod === "404" || forecastData.cod === "404") {
        showToast(weatherData.message, "error");
      }
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
    console.log(typeof city)
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



function filterData(weatherData, forecastData) {

    // weather filter
  const filteredWeatherData = {
    name: weatherData.name,
    country: weatherData.sys.country,
    temp: weatherData.main.temp,
    wind: weatherData.wind.speed,
    humidity: weatherData.main.humidity,
    weather: weatherData.weather[0].main,
    icon: weatherData.weather[0].icon,
    date: weatherData.dt,
  };

  const weather = ["clouds", "rain", "Clear", "Haze", "Mist", "Snow"]

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
    const sectionContainer = document.querySelector('.section_container');
    if(sectionContainer){
        sectionContainer.remove();
    }
    const section = document.createElement("section");
    section.classList.add("section_container");

    for(const key in weather){
        console.log(weather[key])
        if(weather.hasOwnProperty(key)){
            const paragraph = document.createElement("p");
            paragraph.textContent = weather[key];
            section.appendChild(paragraph)
        }
    }
    container.appendChild(section);

    // forecast render
    forecast.forEach((element, index) => {
        const eachForecast = document.querySelectorAll(".forecast");
        eachForecast[index].innerHTML = `
        <p>${element.dt_txt}</p>
        <p>${element.weather[0].main}</p>
        <p>${element.main.temp}</p>
        <p>${element.main.humidity}</p>
        <p>${element.wind.speed}</p>
        `;  
    });

  }

  function showToast(message, type) {
    toast.textContent = message;
    toast.className = `toast${type}`;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function searchCity(event) {
    listContainer.innerHTML = "";

    let cityList = JSON.parse(sessionStorage.getItem('cityList'));
    if (!cityList) return;
    const filterCityName = event.trim().toLowerCase();
    const filteredCities = filterCityName ?  cityList.filter(city => city.toLowerCase().includes(filterCityName)) : [];

    filteredCities.forEach(city => {
        const list = document.createElement('li');
        list.textContent = city;
        list.className = "dropdown_list";
        list.style.cursor = "pointer";
        list.addEventListener("click", () => {
            searchInput.value = city;
            listContainer.style.display = "none"
        });
        listContainer.appendChild(list);
    });

    listContainer.style.display = filteredCities.length > 0 ? "block" : "none";
}

function updateCityList(params) {
    let cityList = JSON.parse(sessionStorage.getItem('cityList')) || [];
    if(!cityList.includes(params)){
        cityList.push(params)
    }
    console.log(cityList)
    sessionStorage.setItem("cityList", JSON.stringify(cityList));
}
