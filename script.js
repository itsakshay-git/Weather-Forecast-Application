const searchInput = document.querySelector("#search");
const locationButton = document.querySelector("#current_location");
const container = document.querySelector("#container");
const apiKey = '136afb528c2654dd1bc858af48342b0e';

searchInput.addEventListener("keydown", async function (event) {
    if(event.key === "Enter"){
        let cityName = event.target.value;  

        try {           
            if(cityName.length){
                console.log(cityName.length)
                const weatherData = await getWeather(cityName);
                const forecastData = await getForecast(cityName);
        
                if(weatherData.cod === 200 && forecastData.cod === "200"){

                    const {filteredWeatherData, filteredForecastData } = filterData(weatherData, forecastData);
                    console.log(filteredWeatherData, filteredForecastData)
                    const section = document.createElement("section");
                    section.classList.add("section_container");
                    section.innerHTML = `<p>${filteredWeatherData.country}</p>
                                         <p>${filteredWeatherData.date}</p>
                                         <p>${filteredWeatherData.humidity}</p>
                                         <p>${filteredWeatherData.icon}</p>
                                         <p>${filteredWeatherData.name}</p>
                                         <p>${filteredWeatherData.temp}</p>
                                         <p>${filteredWeatherData.weather}</p>
                                          <p>${filteredWeatherData.wind}</p>`;
                    container.appendChild(section);

                }else if(weatherData.cod === 401 || forecastData.cod === 401){

                    throw new Error(weatherData.message)

                }else if(weatherData.cod === "404" || forecastData.cod === "404"){

                    throw new Error(weatherData.message)
                }
            }else{
                throw new Error("enter valid city name.")
            }
        } catch (error) {
            console.log(error.message);
        }
    }
})

locationButton.addEventListener("click", async function () {
    console.log('button clicked!')
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(getGeoLocation)
    }else{
        throw new Error('geolocation is not supported in this browser');
    }
})

document.addEventListener("DOMContentLoaded", async function () {
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(getGeoLocation)
    }else{
        console.log('geolocation is not supported in this browser');
    }
})


async function getGeoLocation(geoPosition) {
    const latitude = geoPosition.coords.latitude;
    const longitude = geoPosition.coords.longitude;
    try {
        if(latitude && longitude){
            const weatherData = await getWeather({latitude, longitude});
            const forecastData = await getForecast({latitude, longitude});

            if(weatherData.cod === 200 && forecastData.cod === "200"){
                const {filteredWeatherData, filteredForecastData } = filterData(weatherData, forecastData);
                const section = document.createElement("section");
                section.classList.add("section_container");
                section.innerHTML = `<p>${filteredWeatherData.country}</p>
                                     <p>${filteredWeatherData.date}</p>
                                     <p>${filteredWeatherData.humidity}</p>
                                     <p>${filteredWeatherData.icon}</p>
                                     <p>${filteredWeatherData.name}</p>
                                     <p>${filteredWeatherData.temp}</p>
                                     <p>${filteredWeatherData.weather}</p>
                                      <p>${filteredWeatherData.wind}</p>`;
                container.appendChild(section);
            }else if(weatherData.cod === 401 || forecastData.cod === 401){
                throw new Error(weatherData.message)
            }else if(weatherData.cod === "404" || forecastData.cod === "404"){
                throw new Error(weatherData.message)
            }
        }
    } catch (error) {
        throw new Error(error.message);
    }
}

async function getWeather(city){
        const result = await dataFetcher("weather", city);
        console.log("getwether")
        return result;
}

async function getForecast(city) {
        const result = await dataFetcher("forecast", city);
        console.log("getforecast")
        return result;

}

async function dataFetcher(endpoint, city) {
    if(typeof city === "string"){
        try {          
            const weatherData = await fetch(`https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${apiKey}`);
            const response = await weatherData.json();
            const result = response;
            return result;
        } catch (error) {
            throw new Error(error.message);
        }
    }else {
        try {          
            const data = await fetch(`https://api.openweathermap.org/data/2.5/${endpoint}?lat=${city.latitude}&lon=${city.longitude}&appid=${apiKey}`);
            const response = await data.json();
            const result = response;
            return result
        } catch (error) {
            throw new Error(error.message);
        }
    }
}

function filterData(weatherData, forecastData) {
    const filteredWeatherData = {
        name: weatherData.name,
        country: weatherData.sys.country,
        temp: weatherData.main.temp,
        wind: weatherData.wind.speed,
        humidity : weatherData.main.humidity,
        weather: weatherData.weather[0].main,
        icon: weatherData.weather[0].icon,
        date: weatherData.dt,
    };

    const currentDate = new Date().toISOString().split('T')[0];

    const filteredData = forecastData.list.filter(item => !item.dt_txt.startsWith(currentDate));
    console.log(filteredData)

    const filteredForecastData = Object.values(
        filteredData.reduce((acc, item) => {
            const [date, time] = item.dt_txt.split(" ");
            if(!acc[date] || time == "18:00:00"){
                acc[date] = item
            }
            return acc;
        }, {})
    );

    return {filteredWeatherData, filteredForecastData};
}
