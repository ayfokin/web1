const KEY = "073dfd9227c6474136cdf93e299ca5f9"
const atr = ['Ветер', 'Облачность', 'Давление', 'Влажность', 'Координаты'];

let closeBtns;
let updateBtns = document.querySelectorAll("button.update-btn")

async function init() {
    console.log(localStorage)
    // localStorage.clear()
    initUpdateBtns()
    for (let i = 0; i < localStorage.length; i++) {
        let li = document.createElement('li')
        li.className = "favorite"

        let img = document.createElement('img')
        img.src = "img/loading.svg"
        img.id = "user-loader"
        li.append(img)

        document.getElementById("favorite-cities").append(li)

        try {
            await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${localStorage.getItem(i.toString())}&appid=${KEY}&units=metric&mode=xml`).then((response) => {
                return response.text();
            }).then((data) => {
                data = new DOMParser().parseFromString(data, "application/xml")
                var city = createFavoriteCity(data)
                document.getElementById("favorite-cities").lastChild.remove()
                document.getElementById("favorite-cities").append(city)
            })
        } catch (Exception) {
            alert(Exception.message)
        }
    }
    initCloseBtns()
}

function initCloseBtns() {
    closeBtns = document.querySelectorAll("button.close-btn")
    closeBtns.forEach(function (btn, i) {
        btn.addEventListener('click', function () {
            this.parentElement.parentElement.remove()
            for (let j = i; j < localStorage.length; j++) {
                localStorage.setItem(j.toString(), localStorage.getItem((j + 1).toString()))
            }
            localStorage.removeItem((localStorage.length - 1).toString())
            location.reload()
        })
    })
}

function initUpdateBtns() {
    updateBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            navigator.geolocation.getCurrentPosition(success, error)
        })
    })
}

function createFavoriteCity(data) {
    let li = document.createElement('li')
    li.className = "favorite"

    let div = document.createElement('div')
    div.className = "city-information"
    li.append(div)

    let button = document.createElement('button')
    button.className = "close-btn"
    button.innerHTML = `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                              x="0px" y="0px"
                              viewBox="0 0 22.88 22.88" style="enable-background:new 0 0 22.88 22.88;" xml:space="preserve">
<path d="M0.324,1.909c-0.429-0.429-0.429-1.143,0-1.587c0.444-0.429,1.143-0.429,1.587,0l9.523,9.539
	l9.539-9.539c0.429-0.429,1.143-0.429,1.571,0c0.444,0.444,0.444,1.159,0,1.587l-9.523,9.524l9.523,9.539
	c0.444,0.429,0.444,1.143,0,1.587c-0.429,0.429-1.143,0.429-1.571,0l-9.539-9.539l-9.523,9.539c-0.444,0.429-1.143,0.429-1.587,0
	c-0.429-0.444-0.429-1.159,0-1.587l9.523-9.539L0.324,1.909z"/>
</svg>`
    div.append(button)

    let img = document.createElement('img')
    let icon = data.getElementsByTagName("weather")[0].getAttribute("icon")
    img.className = "weather"
    img.src = `img/${icon}.svg`
    div.append(img)

    let span = document.createElement('span')
    span.className = "degree"
    span.innerHTML = `${Math.round(data.getElementsByTagName("temperature")[0].getAttribute("value"))}&degC`
    div.append(span)

    let h3 = document.createElement('h3')
    h3.className = "city"
    h3.innerHTML = data.getElementsByTagName("city")[0].getAttribute("name");
    div.append(h3)

    let ul = createListOfParameters(data)
    li.append(ul)

    return li
}

function createListOfParameters(data) {
    let ul = document.createElement('ul')
    ul.className = "list"

    for (let i = 0; i < 5; i++) {
        let li = document.createElement('li')
        li.className = "info"
        ul.appendChild(li)

        let span = document.createElement('span')
        span.innerHTML = atr[i]
        li.appendChild(span)
    }

    let wind = document.createElement('span')
    wind.innerHTML = `${data.getElementsByTagName("speed")[0].getAttribute("name")}, ${Math.round(data.getElementsByTagName("speed")[0].getAttribute("value"))} ${data.getElementsByTagName("speed")[0].getAttribute("unit")}, ${data.getElementsByTagName("direction")[0].getAttribute("name")}`
    ul.childNodes[0].append(wind)

    let cloudiness = document.createElement('span')
    cloudiness.innerHTML = `${data.getElementsByTagName("clouds")[0].getAttribute("name")}`
    ul.childNodes[1].append(cloudiness)

    let pressure = document.createElement('span')
    pressure.innerHTML = `${data.getElementsByTagName("pressure")[0].getAttribute("value")} ${data.getElementsByTagName("pressure")[0].getAttribute("unit")}`
    ul.childNodes[2].append(pressure)

    let humidity = document.createElement('span')
    humidity.innerHTML = `${data.getElementsByTagName("humidity")[0].getAttribute("value")} ${data.getElementsByTagName("humidity")[0].getAttribute("unit")}`
    ul.childNodes[3].append(humidity)

    let coords = document.createElement('span')
    coords.innerHTML = `[${data.getElementsByTagName("coord")[0].getAttribute("lon")}, ${data.getElementsByTagName("coord")[0].getAttribute("lat")}]`
    ul.childNodes[4].append(coords)

    return ul
}

function updateUserCity(data) {
    let city = document.createElement('h3')
    city.className = "user-city"
    city.innerHTML = data.getElementsByTagName("city")[0].getAttribute("name");

    let weather = document.createElement('img')
    weather.className = "user-weather"

    let icon = data.getElementsByTagName("weather")[0].getAttribute("icon")
    weather.src = `img/${icon}.svg`

    let degree = document.createElement('span')
    degree.className = "user-degree"
    degree.innerHTML = `${Math.round(data.getElementsByTagName("temperature")[0].getAttribute("value"))}&degC`

    let ul = createListOfParameters(data)
    let div1 = document.createElement('div')
    div1.className = "list"
    div1.id = "user-information-container"
    let div2 = document.createElement('div')
    div2.id = "user-weather-container"

    div2.append(weather)
    div2.append(degree)

    div1.append(city)
    div1.append(div2)

    document.getElementById("user-city-information").append(div1)
    document.getElementById("user-city-information").append(ul)
}

async function addNewFavoriteCity(string) {
    let cityName = string.message.value;
    await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${KEY}&units=metric&mode=xml`).then((response) => {
        if (response.status !== 200) {
            alert(response.statusText)
            location.reload()
        }
        return response.text();
    }).then((data) => {
        data = new DOMParser().parseFromString(data, "application/xml")
        let city = createFavoriteCity(data)
        document.getElementById("favorite-cities").append(city)
    })
    localStorage.setItem(localStorage.length.toString(), cityName)
    location.reload()
}


async function success(pos) {
    let img = document.createElement('img')
    img.src = "img/loading.svg"
    img.id = "user-loader"
    document.getElementById("user-city-information").innerHTML = ''
    document.getElementById("user-city-information").style.justifyContent = "Center"
    document.getElementById("user-city-information").append(img)
    const crd = pos.coords;
    await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${crd.latitude}&lon=${crd.longitude}&appid=${KEY}&units=metric&mode=xml`).then((response) => {
        return response.text();
    }).then((data) => {
        data = new DOMParser().parseFromString(data, "application/xml")
        updateUserCity(data)
    })
    document.getElementById("user-city-information").style.justifyContent = "space-between"
    document.getElementById("user-loader").remove()
}

async function error() {
    let img = document.createElement('img')
    img.src = "img/loading.svg"
    img.id = "user-loader"
    document.getElementById("user-city-information").innerHTML = ''
    document.getElementById("user-city-information").style.justifyContent = "Center"
    document.getElementById("user-city-information").append(img)
    await fetch(`https://api.openweathermap.org/data/2.5/weather?q=saint petersburg&appid=${KEY}&units=metric&mode=xml`).then((response) => {
        return response.text();
    }).then((data) => {
        data = new DOMParser().parseFromString(data, "application/xml")
        updateUserCity(data)
    })
    document.getElementById("user-city-information").style.justifyContent = "space-between"
    document.getElementById("user-loader").remove()
}


document.getElementById("add-form").addEventListener('submit', function (event) {
    addNewFavoriteCity(this)
    event.preventDefault()
})

init()
navigator.geolocation.getCurrentPosition(success, error)