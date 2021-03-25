const KEY = "073dfd9227c6474136cdf93e299ca5f9"


let updateButtons = document.querySelectorAll("button.update-btn")

function init() {
    initUpdateButtons()
    let promises = []
    for (let i = 0; i < localStorage.length; i++) {
        promises.push(addFavoriteCity(localStorage.getItem(i.toString())))
    }
    Promise.all(promises).then(() => {
        initCloseButtons()
    })
}

function initCloseButtons() {
    let closeButtons = document.querySelectorAll("button.close-btn")
    closeButtons.forEach(function (btn, i) {
        let newBtn = btn.cloneNode(true)
        btn.replaceWith(newBtn)
        newBtn.addEventListener('click', function () {
            this.parentElement.parentElement.remove()
            for (let j = i; j < localStorage.length; j++) {
                localStorage.setItem(j.toString(), localStorage.getItem((j + 1).toString()))
            }
            localStorage.removeItem((localStorage.length - 1).toString())
            initCloseButtons()
        })
    })
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
    addFavoriteCity(string).then((result) => {
        if (result === 0) {
            localStorage.setItem((localStorage.length).toString(), string)
            console.log(localStorage)
            initCloseButtons()
        }
    })
}

async function addFavoriteCity(string) {
    let container = document.createElement("li")
    container.className = "favorite"
    loading(container)
    let parent = document.getElementById("favorite-cities")
    parent.appendChild(container)

    let data = await getDataByCityName(string)
    if (data === -1) {
        alert("Беды во время загрузки")
        container.remove()
        return 1
    }
    if (data === undefined) {
        alert("City not found or server is not available")
        container.remove()
        return 1
    }
    let city = createFavoriteCity(data)

    container.innerHTML = ""
    resetStyles(container)
    container.append(city)
    return 0
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
    updateUserCity(data)
}

function loading(doc) {
    doc.innerHTML = ""
    doc.style.display = "flex"
    doc.style.justifyContent = "center"
    doc.style.alignItems = "center"
    let t = document.querySelector('#loading')
    let clone = document.importNode(t.content, true)
    doc.append(clone)
}

function getDataByCoords(pos) {
    const crd = pos.coords;
    let link = `https://api.openweathermap.org/data/2.5/weather?lat=${crd.latitude}&lon=${crd.longitude}&appid=${KEY}&units=metric&mode=xml`
    return sendRequest(link)
}

function getDataByCityName(city) {
    let link = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${KEY}&units=metric&mode=xml`
    return sendRequest(link)
}

function sendRequest(link) {
    return fetch(link).then((response) => {
        if (response.status !== 200) {
            return undefined
        } else {
            return response.text()
                .then((data) => {
                    return new DOMParser().parseFromString(data, "application/xml")
                })
        }
    }).catch(() => {
        return -1
    })
}

document.getElementById("add-form").addEventListener('submit', function (event) {
    addNewCity(document.getElementById("add-favorite-input").value)
    document.getElementById("add-favorite-input").value = ""
    event.preventDefault()
})
init()
navigator.geolocation.getCurrentPosition(success, error)