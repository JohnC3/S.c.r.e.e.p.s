var roleCollector = {

    /** Collects minerals and stores them, also loots dead creep energy drops **/
    run: function(creep) {
        
        if(creep.memory.gathering == undefined){
            creep.memory.gathering = true;
        }
        
        // How much is the creep carrying?
        var total = _.sum(creep.carry);
        
        if(creep.memory.gathering){
            // Return everything you have to storeage!
            
            // If the creep is full go drop off.
            if(total == creep.carryCapacity){
                creep.memory.gathering = false;
            }
            // otherwise continue and drop the goods off at the storage
            else{
                var extractor = creep.room.find(FIND_MINERALS)[0];
                if(creep.harvest(extractor) == ERR_NOT_IN_RANGE){
                    creep.moveTo(extractor);
                }
            }
        }
        else{
            if(total == 0){
                creep.memory.gathering = true;
            }
            
            
            if(creep.pos.inRangeTo(creep.room.storage.pos,1)){
                for(var resourceType in creep.carry) {
                    creep.transfer(creep.room.storage, resourceType)
                }
                
            } else {
                creep.moveTo(creep.room.storage);
            }
        }
    }
}
module.exports = roleCollector;