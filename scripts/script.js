let updateButtons = document.querySelectorAll("button.update-btn")
let closeButtons

let imgFail = document.createElement("img")
imgFail.className = "failure"
imgFail.src = "/img/failure.jpg"

let imgLoad = document.createElement("img")
imgLoad.className = "loader"
imgLoad.src = "/img/loading.svg"


async function init() {
    initUpdateButtons()
    let cities = await getFavoriteCities()
    if (cities) {
        cities = await cities.json()
        let promises = []
        console.log(cities.length)
        for (let i = 0; i < cities.length; i++) {
            promises.push(addFavoriteCity(cities, false))
        }
        Promise.all(promises).then(() => {
            initCloseButtons()
        })
    }
}

function initCloseButtons() {
    closeButtons = document.querySelectorAll("button.close-btn")
    closeButtons.forEach(function (btn, i) {
        let newBtn = btn.cloneNode(true)
        btn.replaceWith(newBtn)
        newBtn.addEventListener('click', function () {
            deleting(newBtn)
            deleteCity(i).then((response) => {
                if (response) {
                    if (response.status === 202) {
                        this.parentElement.parentElement.remove()
                        initCloseButtons()
                    }
                }
                undeleting(newBtn)
            }).catch((e) => {
                console.log(e.message)
                alert("Что-то пошло не так")
            })
        })
    })
}

function deleting(btn) {
    btn.hidden = true
    let load = imgLoad.cloneNode(true)
    load.className = "delete-load"
    btn.parentElement.prepend(load)
    let div = document.createElement("div")
    div.className = "crutch"
    div.style.visibility = "visible"
    document.getElementById("favorite-cities").append(div)
}

function undeleting(btn) {
    let div = document.querySelector(".crutch")
    div.style.visibility = "hidden"
    div.remove()
    btn.parentElement.children[0].remove()
    btn.hidden = false
}

function initUpdateButtons() {
    updateButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            navigator.geolocation.getCurrentPosition(success, error)
        })
    })
}

function createFavoriteCity(data) {
    let t = document.querySelector("#favorite-city")
    fillCityInformation(t, data)
    return document.importNode(t.content, true)
}

function updateUserCity(data) {
    let t = document.querySelector('#user-city-information-template')
    fillCityInformation(t, data)

    let clone = document.importNode(t.content, true)
    let parent = document.getElementById("user-city-information")
    parent.innerHTML = ''
    resetStyles(parent)
    parent.append(clone)
}

function resetStyles(obj) {
    obj.style = ""
}

function fillCityInformation(t, data) {
    // city
    t.content.querySelectorAll("h3")[0].innerHTML = data.getElementsByTagName("city")[0].getAttribute("name")
    // image
    t.content.querySelectorAll("img")[0].src = `img/${data.getElementsByTagName("weather")[0].getAttribute("icon")}.svg`
    // degree
    t.content.querySelectorAll("span")[0].innerHTML = `${Math.round(data.getElementsByTagName("temperature")[0].getAttribute("value"))}&degC`
    let list = t.content.querySelectorAll(".info-data")
    // wind
    list[0].innerHTML = `${data.getElementsByTagName("speed")[0].getAttribute("name")}, ${Math.round(data.getElementsByTagName("speed")[0].getAttribute("value"))} ${data.getElementsByTagName("speed")[0].getAttribute("unit")}, ${data.getElementsByTagName("direction")[0].getAttribute("name")}`
    // cloudiness
    list[1].innerHTML = `${data.getElementsByTagName("clouds")[0].getAttribute("name")}`
    // pressure
    list[2].innerHTML = `${data.getElementsByTagName("pressure")[0].getAttribute("value")} ${data.getElementsByTagName("pressure")[0].getAttribute("unit")}`
    // humidity
    list[3].innerHTML = `${data.getElementsByTagName("humidity")[0].getAttribute("value")} ${data.getElementsByTagName("humidity")[0].getAttribute("unit")}`
    // coords
    list[4].innerHTML = `[${data.getElementsByTagName("coord")[0].getAttribute("lon")}, ${data.getElementsByTagName("coord")[0].getAttribute("lat")}]`
}

function addNewCity(string) {
    addFavoriteCity(string, true).then(() => {
        initCloseButtons()
    })
}

async function addFavoriteCity(string, add) {
    let container = document.createElement("li")
    container.className = "favorite"
    loading(container)
    let parent = document.getElementById("favorite-cities")
    parent.appendChild(container)

    let data = await getDataByCityName(string)

    if (data) {
        if (add) {
            addFavoriteCityToDB(string).catch((e) => {
                alert("Возникла проблема при добавлении города в БД")
                console.log(e.message)
                container.remove()
                return false
            })
        }
        let city = createFavoriteCity(data)

        container.innerHTML = ""
        resetStyles(container)
        container.append(city)
        return true
    }
    container.remove()
    return false
}

function success(pos) {
    main(true, pos).then()
}

function error() {
    main(false).then()
}

async function main(success, pos) {
    loading(document.getElementById('user-city-information'))
    let data
    if (success) {
        data = await getDataByCoords(pos)
    } else {
        data = await getDataByCityName("saint petersburg")
    }
    if (data) {
        updateUserCity(data)
    } else {
        let parent = document.getElementById("user-city-information")
        parent.innerHTML = ''
        parent.appendChild(imgFail)
    }
}

function loading(doc) {
    doc.innerHTML = ""
    doc.style.display = "flex"
    doc.style.justifyContent = "center"
    doc.style.alignItems = "center"

    let div = document.createElement("div")
    div.className = "load"

    let span = document.createElement("span")
    span.innerText = "Данные загружаются"

    let img = imgLoad.cloneNode(true)

    div.appendChild(img)
    div.appendChild(span)
    doc.append(div)
}

function getDataByCoords(pos) {
    const crd = pos.coords;
    let link = `http://localhost:3000/weather/coordinates?lat=${crd.latitude}&lon=${crd.longitude}`
    return getData(link)
}

function getDataByCityName(city) {
    let link = `http://localhost:3000/weather/city?q=${city}`
    return getData(link)
}

function addFavoriteCityToDB(city) {
    let link = `http://localhost:3000/favorites?city=${city}`
    return sendRequest(link, "POST")
}

function getFavoriteCities() {
    let link = `http://localhost:3000/favorites`
    return sendRequest(link, "GET")
}


function deleteCity(id) {
    let link = `http://localhost:3000/favorites?id=${id}`
    return sendRequest(link, "DELETE")
}

function getData(link) {
    return sendRequest(link, "GET").then(async (response) => {
        if (response) {
            if (response.status === 200) {
                return new DOMParser().parseFromString(await response.text(), "application/xml")
            }
            alert("Город не найден")
        }
        return false
    })
}


function sendRequest(link, type) {
    return fetch(link, {
        "method": type
    }).then((response) => {
        return response
    }).catch((e) => {
        console.log(e)
        alert("Сервер недоступен или отсутствует подключение к интернету")
        return false
    })
}

document.getElementById("add-form").addEventListener('submit', function (event) {
    addNewCity(document.getElementById("add-favorite-input").value)
    document.getElementById("add-favorite-input").value = ""
    event.preventDefault()
})

init()
navigator.geolocation.getCurrentPosition(success, error)