var claimer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // todo:: Add a if else wrapper to this that blocks pickup attempts if a unsafe flag appears.
        

        
        if(creep.room.name == creep.memory.station){
            
            if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                
                var moveAttempt = creep.moveTo(creep.room.controller);
                
                if(moveAttempt == -2){
                    creep.move(TOP_LEFT);
                }
            }
        }
            
        else {
            // Another soloution to the swamp issue. The normal person has them find closest by range.
            creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(creep.memory.station))); 
            /*
            if(creep.room.lookForAt(LOOK_TERRAIN,creep.pos) == 'swamp'){
                creep.memory.landInSwamp = true;
                creep.say('DAMN SWAMP')
            }
            
            if(creep.memory.landInSwamp){
                creep.move(TOP_RIGHT)
                creep.memory.landInSwamp = undefined
            }
            */
        }
        
        //console.log(creep.room.lookForAt(LOOK_TERRAIN,creep.pos))
    }
}

module.exports = claimer;