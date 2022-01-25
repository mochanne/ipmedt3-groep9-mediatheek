const getDistance = (obj1, obj2) => {
    return obj1.object3D.position.distanceTo(obj2.object3D.position)
}


AFRAME.registerComponent("viewdistance",{
    schema: {target: {type: "string", default:"main-camera"}, updaterate: {type: "int", default:"15"}, distance: {type: "int", default:"14"}},
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
    schema: {text_id: {type:"string"}, on_event: {type:"string", default:"click"}, invert: {type: "boolean", default:false}, lower:{type:"boolean", default:false}, hide_radius: {type: "int", default: 8}},
    init: function () {

        this.target_scale = {...document.getElementById(this.data.text_id).getAttribute("scale")}
        this.lowered = false

        this.set_textvisible = (state) => {
            if (this.data.invert) { state = !state }

            // console.log("changed ",this.data.text_id," visibility to ",state)

            let target = document.getElementById(this.data.text_id) 
            target.setAttribute("visible",state);
            if (this.data.lower) {
                if (state && this.lowered) {
                    // console.log("unlower")
                    target.setAttribute("scale", this.target_scale)
                    this.lowered = false
                } else if (!state && !this.lowered) {
                    // console.log("lower")
                    this.target_scale = {...target.getAttribute("scale")}
                    // console.log("saved scale as ",this.target_scale)
                    target.setAttribute("scale", {x:0, y:0, z:0})
                    this.lowered = true
                }
                // console.log(" scale is now ",target.getAttribute("scale"))
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

AFRAME.registerComponent("button", {
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


