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
            
            // Total stuff found in a box.
            var storeage_total = _.sum(creep.room.storage.store);
            
            if(storeage_total < creep.room.storage.storeCapacity){
                
                roleCollector.store_carried(creep)
            }else{
                creep.say('market')
                if(creep.pos.inRangeTo(creep.room.terminal.pos,1)){
                    for(var resourceType in creep.carry) {
                        creep.transfer(creep.room.terminal, resourceType)
                    }
                    
                } else {
                    creep.moveTo(creep.room.terminal);
                }
            }
        }
    },
    // Place entire inventory into the rooms storage if posable
    store_carried:function(creep){
        
        if(creep.room.storage){
            if(creep.pos.inRangeTo(creep.room.storage.pos,1)){
                for(var resourceType in creep.carry) {
                    creep.transfer(creep.room.storage, resourceType)
                }
                
            } else {
                creep.moveTo(creep.room.storage);
            }
            
        }
        

    }
    // Function to deliver raw resources to links 
}
module.exports = roleCollector;