

AFRAME.registerComponent("focus",{
    schema: {text_id: {type:"string"}, on_event: {type:"string", default:"click"},  hide_radius: {type: "int", default: 3}},
    init: function () {
        this.set_textvisible = (state) => {
            this.is_shown = state
            this.getElementById(this.data.text_id).setAttribute("visible",state);
        }
        this.is_shown = false
        this.set_textvisible(false)
        this.el.addEventListener(this.data.on_event, (event) => {
            
        })},
    tick: function() {
        if (this.is_shown) {
            let cam = document.getElementById("main-camera").object3D.position
            let me = this.object3D.position
            let distance = cam.distanceTo(me)
            if (distance > this.data.hide_radius) {
                this.set_textvisible(false)
            }
    }
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


