const atr = ['Ветер', 'Облачность', 'Давление', 'Влажность', 'Координаты'];
var closeBtns = document.querySelectorAll("button.close-btn")

init()

async function init() {
    console.log(localStorage)
    // localStorage.clear()
    for (let i = 0; i < localStorage.length; i++) {
        try {
            await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${localStorage.getItem(i.toString())}&appid=b55cb6a60addb3d56b8affed8e202b01&units=metric&mode=xml`).then((response) => {
                return response.text();
            }).then((data) => {
                data = new DOMParser().parseFromString(data, "application/xml")
                var city = createFavoriteCity(data)
                document.getElementById("favorite-cities").append(city)
            })
        }
        catch (Exception) {
            alert(Exception.message)
        }
    }
    closeBtns = document.querySelectorAll("button.close-btn")
    console.log(closeBtns)
    closeBtns.forEach(function (btn, i) {
        btn.addEventListener('click', function() {
            this.parentElement.parentElement.remove()
            console.log(i)
            for (let j = i; j < localStorage.length; j++) {
                localStorage.setItem(j.toString(), localStorage.getItem((j + 1).toString()))
            }
            localStorage.removeItem((localStorage.length - 1).toString())
            location.reload()
        })
    })

}

async function qwe(q) {
    var cityName = q.message.value;
    await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=b55cb6a60addb3d56b8affed8e202b01&units=metric&mode=xml`).then((response) => {
        if (response.status !== 200) {
            alert("Ошибка")
            location.reload()
        }
        return response.text();
    }).then((data) => {
        data = new DOMParser().parseFromString(data, "application/xml")
        var city = createFavoriteCity(data)
        document.getElementById("favorite-cities").append(city)
    })
    location.reload()
    localStorage.setItem(localStorage.length.toString(), cityName)
}

document.forms.add.onsubmit = function() {
    qwe(this)
    return false
}

function createFavoriteCity(data) {
    let li = document.createElement('li')
    li.className = "favorite"
    let div = document.createElement('div')
    div.className = "city-information"
    let button = document.createElement('button')
    button.className = "close-btn"
    button.innerHTML =  `<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                              x="0px" y="0px"
                              viewBox="0 0 22.88 22.88" style="enable-background:new 0 0 22.88 22.88;" xml:space="preserve">
<path d="M0.324,1.909c-0.429-0.429-0.429-1.143,0-1.587c0.444-0.429,1.143-0.429,1.587,0l9.523,9.539
	l9.539-9.539c0.429-0.429,1.143-0.429,1.571,0c0.444,0.444,0.444,1.159,0,1.587l-9.523,9.524l9.523,9.539
	c0.444,0.429,0.444,1.143,0,1.587c-0.429,0.429-1.143,0.429-1.571,0l-9.539-9.539l-9.523,9.539c-0.444,0.429-1.143,0.429-1.587,0
	c-0.429-0.444-0.429-1.159,0-1.587l9.523-9.539L0.324,1.909z"/>
</svg>`
    let img = document.createElement('img')
    img.className = "weather"
    let icon = data.getElementsByTagName("weather")[0].getAttribute("icon")
    img.src = `img/${icon}.svg`
    let span = document.createElement('span')
    span.className = "degree"
    span.className = "degree"
    span.innerHTML = `${Math.round(data.getElementsByTagName("temperature")[0].getAttribute("value"))}&degC`
    let h3 = document.createElement('h3')
    h3.className = "city"
    h3.innerHTML = data.getElementsByTagName("city")[0].getAttribute("name");
    li.append(div)
    div.append(button)
    div.append(img)
    div.append(span)
    div.append(h3)
    let ul = createList(data)
    li.append(ul)
    return li
}

async function success(pos) {
    img = document.createElement('img')
    img.src = "img/loading.svg"
    img.id = "user-loader"
    document.getElementById("user-city-information").innerHTML = ''
    document.getElementById("user-city-information").style.justifyContent = "Center"
    document.getElementById("user-city-information").append(img)
    const crd = pos.coords;
    await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${crd.latitude}&lon=${crd.longitude}&appid=b55cb6a60addb3d56b8affed8e202b01&units=metric&mode=xml`).then((response) => {
        return response.text();
    }).then((data) => {
        data = new DOMParser().parseFromString(data, "application/xml")
        updateUserCity(data)
    })
    document.getElementById("user-city-information").style.justifyContent = "space-between"
    document.getElementById("user-loader").remove()
}

async function error(pos) {
    img = document.createElement('img')
    img.src = "img/loading.svg"
    img.id = "user-loader"
    document.getElementById("user-city-information").innerHTML = ''
    document.getElementById("user-city-information").style.justifyContent = "Center"
    document.getElementById("user-city-information").append(img)
    await fetch(`https://api.openweathermap.org/data/2.5/weather?q=saint petersburg&appid=b55cb6a60addb3d56b8affed8e202b01&units=metric&mode=xml`).then((response) => {
        return response.text();
    }).then((data) => {
        data = new DOMParser().parseFromString(data, "application/xml")
        updateUserCity(data)
    })
    document.getElementById("user-city-information").style.justifyContent = "space-between"
    document.getElementById("user-loader").remove()
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
    let ul = createList(data)
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

function createList(data) {
    let ul = document.createElement('ul')
    for (let i = 0; i < 5; i++) {
        let li = document.createElement('li')
        li.className = "info"
        let span = document.createElement('span')
        span.innerHTML = atr[i]
        li.appendChild(span)
        ul.appendChild(li)
    }
    ul.className = "list"
    let wind = document.createElement('span')
    wind.innerHTML = `${data.getElementsByTagName("speed")[0].getAttribute("name")}, ${Math.round(data.getElementsByTagName("speed")[0].getAttribute("value"))} ${data.getElementsByTagName("speed")[0].getAttribute("unit")}, ${data.getElementsByTagName("direction")[0].getAttribute("name")}`
    let cloudiness = document.createElement('span')
    cloudiness.innerHTML = `${data.getElementsByTagName("clouds")[0].getAttribute("name")}`
    let pressure = document.createElement('span')
    pressure.innerHTML = `${data.getElementsByTagName("pressure")[0].getAttribute("value")} ${data.getElementsByTagName("pressure")[0].getAttribute("unit")}`
    let humidity = document.createElement('span')
    humidity.innerHTML = `${data.getElementsByTagName("humidity")[0].getAttribute("value")} ${data.getElementsByTagName("humidity")[0].getAttribute("unit")}`
    let coords = document.createElement('span')
    coords.innerHTML = `[${data.getElementsByTagName("coord")[0].getAttribute("lon")}, ${data.getElementsByTagName("coord")[0].getAttribute("lat")}]`
    ul.childNodes[0].append(wind)
    ul.childNodes[1].append(cloudiness)
    ul.childNodes[2].append(pressure)
    ul.childNodes[3].append(humidity)
    ul.childNodes[4].append(coords)
    return ul
}

let updateBtns = document.querySelectorAll("button.update-btn")
updateBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
        navigator.geolocation.getCurrentPosition(success, error)
    })
})

navigator.geolocation.getCurrentPosition(success, error)