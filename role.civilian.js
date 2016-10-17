/*
 * The code for civilian creeps goes here, this code covers functions and attributes common to all civilian roles.
 * Civilian creeps are unable to fight and should flee from combat whenever possable.
 * Have the ability to recycle and refresh themselves.
 */

var civilian = {
    // Civilians have a few common properties the most important is moveing to assigned rooms.
    
    
    
    
    
    // For the sake of polymorphism we need a run function.
    run:function(creep){
        civilian.simple_goto(creep)
        
        if(!creep.memory.path) {
            creep.memory.path = creep.pos.findPathTo(Game.flags.Idle);
        }
        var move_err = creep.moveByPath(creep.memory.path)
        
        creep.say(move_err);
        
        if(move_err == -5){
            creep.memory.path = undefined
        }
    },

    
    // The current implementation of my creeps. 
    simple_goto:function(creep){
        
        if(creep.memory.station == undefined){
            creep.memory.station = creep.room.name;
        }
        
        // Memory.safety is a dict of room names that hash to the safety.
        
        if(creep.room.name != creep.memory.station){
            creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(creep.memory.station)));
        }
        
    },
    
    // When the room a civilian is stationed in becomes unsafe civilians should flee. 
    preform_function:function(creep){
        
        if(creep.memory.station == undefined){
            creep.memory.station = creep.room.name;
        }
        
        // Memory.safety is a dict of room names that hash to the safety.
        if(Memory.safety[creep.memory.station]){
            if(creep.room.name != creep.memory.station){
                creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(creep.memory.station)));
            } 
        } 
        // If the room is not safe they should withdraw
        else{
            
            if(Game.flags.station){
                creep.moveTo(Game.flags.station)
            }
            
            else{
                // Look at all rooms you consider under your control.
                var observed_room = Memory.myDomain;
                
                // Filter out rooms in danger
                var safe_rooms = _.filter(observed_room, function(r){ return Memory.safety[r]})
                
                // Find the nearest safe room to the station.
                var nearist_safe_room = _.min(observed_room,function(r){return Game.map.getRoomLinearDistance(creep.memory.station,r)})
                
                // Create a flag for the nearist safe room
                console.log(Game.rooms[nearist_safe_room].createFlag(x = 25, y = 25,name = creep.memory.station));
            }
        }
    }
}

module.exports = civilian;