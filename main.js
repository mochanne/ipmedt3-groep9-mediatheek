

const getDistance = (obj1, obj2) => {
    let wrld = new THREE.Vector3()
    let wrld2 = new THREE.Vector3()
    let out = obj1.object3D.getWorldPosition(wrld).distanceTo(obj2.object3D.getWorldPosition(wrld2))
    // console.log(obj1.object3D.getWorldPosition(wrld))
    // console.log(obj2.object3D.getWorldPosition(wrld))
    // console.log(out)
    // console.log('hi')
    return out
}

AFRAME.registerComponent("activitytracker", {
    init: function() {
        this.goals = {
            "Boekenkasten": false,
            "Printer": false,
            "Stilteruimtes": false,
            "Vitrines": false,
            "HLVinden computer": false,
            "Computers": false,
            "Balie": false,
            "Showtafels": false,
            "Zitplekken": false,
        }
        this.refresh = () => {
            let all_positive = true
            let out = ""
            for (key in this.goals) {
                let line = ""
                if (this.goals[key]) {
                    line += "+ "
                } else {
                    all_positive = false
                }
                line += key
                out += line + "\n"
                }
            if (all_positive) {
                this.el.setAttribute("text","color","#AAFF00")
            }  else {
                this.el.setAttribute("text","color","white")
            }
            this.el.setAttribute("text","value",out)
        }
        this.refresh()
    },
    events: {
        complete: function(event) {
            console.log(event)
            if (event.detail in this.goals) {
                this.goals[event.detail] = true
                this.refresh()
            }
        }
    }
})

AFRAME.registerComponent("lod-layer",{})

AFRAME.registerComponent("viewdistance",{
    // Objecten met dit component zullen verdwijnen als ze verden dan een bepaalde waarde van een ander object zijn
    // 
    // Args:
    // target: HTML ID van het object dat je wilt tracken
    // updaterate: hoe vaak de afstanden worden gecheckt. 1 = altijd, hoe hoger hoe minder vaak (Dit is om te zorgen dat niet alle objecten in dezelfde frame checken)
    // distance: Minimale afstand tussen de 2 objecten om dit object te weergeven 
    schema: {target: {type: "string", default:"main-camera"}, updaterate: {type: "int", default:7}, distance: {type: "int", default:15}},
    init: function() {
        this.currupdate = Math.round(Math.random()*this.data.updaterate)
    },
    tick: function() {
        this.currupdate += 1
        if (this.currupdate >= this.data.updaterate) {
        this.currupdate = 0
        let target = document.getElementById(this.data.target)
        let distance = getDistance(target, this.el)
        // console.log(distance)
        this.el.setAttribute("visible", distance < this.data.distance)
    }}
})




AFRAME.registerComponent("focus",{
    // Dit component werkt als een knop.
    // Als een bepaald event (default is click) ontvangen word, zal een gelinkt object weergeven worden
    // Het object word weer ontzichtbaar gemaakt als de camera (dus de gebruiker) een bepaalde aantal stappen weg loopt
    // 
    // args:
    // text_id: het HTML ID van het object dat je wil weergeven
    // on_event: Het event dat het gelinkte object zichtbaar maakt
    // invert: als dit op `true` staat, word het gelinkte object onzichtbaar gemaakt op event, in plaats van zichtbaar
    // lower: veranderd de scale van het gelinkte object als het op `True` staat naar "0 0 0", waardoor er raycasts door de opening kan worden gestuurt
    // hide_radius: de afstand die de gebruiker van DIT object moet zijn om het gelinkte object ontzichtbaar te maken
    multiple: true,
    schema: {text_id: {type:"string"}, on_event: {type:"string", default:"click"}, invert: {type: "boolean", default:false}, lower:{type:"boolean", default:false}, hide_radius: {type: "int", default: 8}},
    init: function () {

        this.target_scale = {...document.getElementById(this.data.text_id).getAttribute("scale")}
        this.lowered = false

        this.set_textvisible = (state) => {
            if (this.data.invert) { state = !state }

            console.log("changed ",this.data.text_id," visibility to ",state)

            let target = document.getElementById(this.data.text_id) 
            target.setAttribute("visible",state);
            if (this.data.lower) {
                if (state && this.lowered) {
                    console.log("unlower")
                    target.setAttribute("scale", this.target_scale)
                    this.lowered = false
                } else if (!state && !this.lowered) {
                    console.log("lower")
                    this.target_scale = {...target.getAttribute("scale")}
                    // console.log("saved scale as ",this.target_scale)
                    target.setAttribute("scale", {x:0, y:0, z:0})
                    this.lowered = true
                }
                console.log(" scale is now ",target.getAttribute("scale"))
                // console.log(" stored scale is now ",this.target_scale)
            }
        }
        this.check = false
        this.set_textvisible(false)
        this.el.addEventListener(this.data.on_event, (event) => {
            this.check = true
            this.set_textvisible(true)
        })},
    tick: function() {
        if (this.check) {
            // console.log("check")
            let cam = document.getElementById("main-camera").object3D.position
            let me = this.el.object3D.position
            let distance = cam.distanceTo(me)
            // console.log("distance to ",me,": ",distance)
            if (distance > this.data.hide_radius) {
                this.set_textvisible(false)
                this.check = false
            }
    }
    }
})

AFRAME.registerComponent('destination', {
    // Simpel component. Als de gebruiker naar dit object kijkt, speelt een animatie waarin de camera word veplaatst naar deze XZ coordinaten.
    // Y blijft onveranderd (dus niet geschikt voor hoogteverschillen)
    schema: {},
    events:{
        click: function() {
            let att = document.createAttribute("animation")
            let cam = document.getElementById("main-camera")
            mypos = this.el.getAttribute("position")
            att.value = "property: position; easing: linear; dur: 2000; to: " + mypos.x + " "+ cam.getAttribute("position").y +" " + mypos.z
            cam.setAttribute("animation", att.value)        }
    }

})

AFRAME.registerComponent("unique_trigger",{
    schema: {arrow_class: {type: "string", default:""}, event_target: {type: "string"}, event_name: {type: "string"}, event_data: {type: "string", default: ""}, listen_event:{type:"string", default:"click"}},
    init: function() {
        this.has_triggered = false
        this.el.addEventListener(this.data.listen_event, () => {
            console.log("debug: ",this.el.getAttribute("position"))
            if (this.has_triggered) {return}
            if (this.data.arrow_class != "") {
            for (ele of document.getElementsByClassName(this.data.arrow_class)) {
                ele.setAttribute("scale", {x:0, y:0, z:0})
            }}
            let target = document.getElementById(this.data.event_target)
            target.emit(this.data.event_name, this.data.event_data)
            console.log("emitted ",this.data.event_data," to ",target)
        })
    },
})

AFRAME.registerComponent("button", {
    // Simpel component. Als dit object een click event ontvangt, stuurt het een eigen event naar een gelint object
    // 
    // args:
    // object: het HTML ID van het object waar je een event naar toe stuurt
    // event: naam van het event dat je stuurt
    // trigger_on_load: stuur het event in init (waarschuwing: is niet betrouwbaar, vuurt soms niet)
    schema: {object: {type: "string"}, event: {type: "string"}, trigger_on_load: {type:"boolean", default:true}},
    init: function() {
        this.go = function() {document.getElementById(this.data.object).emit(this.data.event,null,true)}
        if (this.data.trigger_on_load) {
            this.go()
        }
    },
    events:{
        click: function() {
            this.go()
        }
    }
})


