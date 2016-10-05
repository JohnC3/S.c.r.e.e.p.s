var roleCollector = {

    /** Collects minerals and stores them, also loots dead creep energy drops **/
    run: function(creep) {
        
        if(creep.memory.dropoff == undefined){
            creep.memory.dropoff = false;
        }
        
        // How much is the creep carrying?
        var total = _.sum(creep.carry);
        
        if(creep.memory.dropoff){
            // Return everything you have to storeage!
            var storage = creep.room.storage;
            
            // If the creep is empty go pick up.
            if(total == 0){
                creep.memory.dropoff = false;
            }
            // otherwise continue and drop the goods off at the storage
            else{
                for(var resourceType in creep.carry) {
                	if(creep.transfer(storage, resourceType) == ERR_NOT_IN_RANGE){
                	    creep.moveTo(storage);
                	    break;
                	}
                }
            }
        }
        else{
            var extractor = creep.room.find(FIND_MINERALS)[0];
            if(creep.harvest(extractor) == ERR_NOT_IN_RANGE){
                creep.moveTo(extractor);
            }
        }
    }
}
module.exports = roleCollector;