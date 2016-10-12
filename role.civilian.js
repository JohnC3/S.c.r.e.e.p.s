/*
 * The code for civilian creeps goes here, this code covers functions and attributes common to all civilian roles.
 * Civilian creeps are unable to fight and should flee from combat whenever possable.
 * Have the ability to recycle and refresh themselves.
 */



console.log('hello my id is: '+this.id);


var civilian = {
    // Civilians have a few common properties the most important is moveing to assigned rooms.
    
    // For the sake of polymorphism we need a run function.
    run:function(creep){
        civilian.simple_goto(creep)  
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
            // All rooms I am aware of.
            var observed_room = Object.keys(Game.rooms)
            
            // By going to a retreat flag found in the nearest room, if that room is also unsafe goto that rooms safeflag and so on.
            if(Game.flags.station){
                creep.moveTo(Game.flags[creep.memory.station])    
            }
            
            
        }
        

    }
    

    
    
    
}

module.exports = civilian;