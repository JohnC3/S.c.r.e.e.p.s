var claimer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        // todo:: Add a if else wrapper to this that blocks pickup attempts if a unsafe flag appears.
        
        
        if(creep.room.name != creep.memory.station){
            creep.moveTo(creep.pos.findClosestByPath(creep.room.findExitTo(creep.memory.station)));
            }
            
        
        else if(creep.room.controller) {
            if(creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                
                creep.moveTo(creep.room.controller);
                }
        }
        

        
    }
}

module.exports = claimer;