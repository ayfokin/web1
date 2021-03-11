function success(pos) {
    const crd = pos.coords;
    console.log(crd)
    fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${crd.latitude}&lon=${crd.longitude}&appid=073dfd9227c6474136cdf93e299ca5f9&units=metric`).then((response) => {
        return response.json();
    }).then((data) => {
        console.log(data)
        let weather = document.createElement('img')
        weather.className = "user-weather"
        let icon = data.weather[0].icon
        weather.src = `img/${icon}.svg`
        let degree = document.createElement('span')
        degree.className = "user-degree"
        degree.innerHTML = `${Math.round(data.main.temp)}&degC`
        document.getElementById("user-weather-container").append(weather)
        document.getElementById("user-weather-container").append(degree)
    })
}

navigator.geolocation.getCurrentPosition(success)