// planeten.js
// voor de planeet in de virtine
// 
// Origineel voor individuele opdracht 2




const readify = (number) => {
    number = Number(number)
    if (number > 1000000000) {
        return String(number/1000000000)+"b"
    }
    if (number > 1000000) {
        return String(number/1000000)+"m"
    }
    if (number > 1000) {
        return String(number/1000)+"k"
    }

    return number
}

const capi = (word) => {
    return word[0].toUpperCase() + word.substr(1);
}

// https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
const str2clr = (str) => {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    var colour = '#';
    for (var i = 0; i < 3; i++) {
      var value = (hash >> (i * 8)) & 0xFF;
      colour += ('00' + value.toString(16)).substr(-2);
    }
    return colour;
  }

const swapi = (urladdition="", callback) => {
    fetch("http://swapi.dev/api/"+urladdition).then((response) => {if (response.status == 200) {response.json().then(callback)} })
}

const randswapi = (urladdition="", callback) => {
    // Kan sneller, maar door 2 queries te doen blijft dit future-proof
        swapi(urladdition, (thing) => {
            swapi(urladdition+"/"+String(randint(thing.count)), callback)
        })
}

const goodify = (value, fallback) => {
    if (value != "unknown" && value != "0") {
        return value
    }
    return fallback
}
const ngoodify = (value, fallback) => {
    return Number(goodify(value, fallback))
}

const randint = (max) => {
    return Math.floor(Math.random() * max)+1;
  }


AFRAME.registerComponent("planet_display", {
    schema: {text: {type: "string", default:"planet-title"}},
    init: function() {
        this.fillCreds = function() {

            randswapi("planets", (planet) => {
                    console.log(planet)
                    let dia = ngoodify(planet.diameter, 10000)
                    let rad = Math.min((dia/6)/4500, 0.2+(randint(10)/10))*0.5

                    let rot = ngoodify(planet.rotation_period, 10)*100

                    let nrep = String(Math.ceil(dia/1000))

                    console.log("set radius to ",rad)
                    console.log("set rot to ",String(rot))
                    console.log("set nrep to ",nrep)
                    this.el.setAttribute("material","normalTextureRepeat",nrep)
                    this.el.setAttribute("geometry","radius",rad)
                    this.el.setAttribute("animation","dur",rot)
                    console.log(this.el.getAttribute("animation"))

                    this.el.setAttribute("material","color",str2clr(planet.name))
                    
                    // let poptext = goodify(planet.population, "unknown")
                    // if (poptext != "unknown") {
                    //     poptext = readify(planet.population)
                    // }
                    let text = ""
                    text += planet.name
                    // text += "Diameter: " + goodify(planet.diameter,"unknown") +"\n" 
                    // text += "Rotation period: " + goodify(planet.rotation_period, "unknown") +"\n" 
                    // text += "Population: " + poptext +"\n" 
                    // text += "Climate: " + goodify(planet.climate, "unknown") +"\n" 
                    document.getElementById(this.data.text).setAttribute("text","value",text)
            })
        }
        this.fillCreds()
    },
    events: {
        click: function() {
            console.log("gi")
            this.fillCreds()
        }
    }
})