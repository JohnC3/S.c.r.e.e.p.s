var claimer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // todo:: Add a if else wrapper to this that blocks pickup attempts if a unsafe flag appears.
        

        
        if(creep.room.name != creep.memory.station){
            creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(creep.memory.station))); 
        }
            
        else {
            
            if(creep.memory.claimmode){
                var attempt = creep.claimController(creep.room.controller)
            }else{
                var attempt = creep.reserveController(creep.room.controller)
            }
            if(attempt == ERR_NOT_IN_RANGE) {

                var moveAttempt = creep.moveTo(creep.room.controller);
                
                if(moveAttempt == -2){
                    creep.move(TOP_LEFT);
                }
            }
        }
        
        //console.log(creep.room.lookForAt(LOOK_TERRAIN,creep.pos))
    }
}

module.exports = claimer;