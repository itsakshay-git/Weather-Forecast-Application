const searchInput = document.querySelector("#search");
const locationButton = document.querySelector("#current_location");
const apiKey = '136afb528c2654dd1bc858af48342b0e';

console.log(searchInput)

searchInput.addEventListener("keydown", async function (event) {
    if(event.key === "Enter"){
        console.log(event.target.value)
        let cityName = event.target.value;
        const weatherData = await getWeather(cityName);
        const forecastData = await getForecast(cityName);
        console.log(weatherData)
        console.log(forecastData);
        try {          
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
        console.log('geolocation is not supported in this browser');
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
        const weatherData = await getWeather({latitude, longitude});
        const forecastData = await getForecast({latitude, longitude});
    } catch (error) {
        console.log(error.message);
    }
}

async function getWeather(cityname){

    if(typeof cityname === "string"){
        console.log(true);
        const data = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityname}&appid=${apiKey}`);
        const response = await data.json();
        const result = response;
        console.log('weather', result);
        return result;
    }else{
        console.log(false);
        const data = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${cityname.latitude}&lon=${cityname.longitude}&appid=${apiKey}`);
        const response = await data.json();
        const result = response;
        console.log('weather', result);
        return result
    }
}

async function getForecast(cityname) {

    if(typeof cityname === "string"){
        const data = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityname}&appid=${apiKey}`);
        const response = await data.json();
        const result = response;
        console.log('forecast', result)
        return result;
    }else{
        console.log(false);
        const data = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${cityname.latitude}&lon=${cityname.longitude}&appid=${apiKey}`);
        const response = await data.json();
        const result = response;
        console.log('forecast', result)
        return result
    }

}
