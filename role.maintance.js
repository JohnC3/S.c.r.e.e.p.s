var roleBuilder = require('role.builder');

var roleMainance = {
    run:function(creep){
        if(creep.memory.station == undefined){
            creep.memory.station = creep.room.name;
        }
        
        if(creep.room.name != creep.memory.station){
            creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(creep.memory.station)));
        } 
        
        roleBuilder.fix(creep);
        
    }
}

module.exports = roleMainance;