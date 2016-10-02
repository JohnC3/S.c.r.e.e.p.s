var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        
        if(creep.memory.station == undefined){
            creep.memory.station = creep.room.name;
        }
        
        if(creep.memory.station != creep.room.name){
            creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(creep.memory.station)));
        }
        
        else{
            
        
        
        
        
            // todo:: Add a if else wrapper to this that blocks pickup attempts if a unsafe flag appears.
            if( creep.memory.action == 'dropoff'){
    
                // Find the room controller
                var room_controler = creep.room.controller
                
                if (creep.upgradeController(room_controler) == ERR_NOT_IN_RANGE){
                    creep.moveTo(room_controler);
                } 
                // If the harvester is now empty it should pickup more energy
                if(creep.carry.energy == 0){
                    creep.memory.action = 'pickup'
                }
            }
            else if (creep.memory.action == 'pickup'){
                // If you are full just
                if(creep.carry.energy == creep.carryCapacity){
                    creep.memory.action = 'dropoff'
                    creep.say('upgrade')
                }
                // Look for sources
                else{
                    
                    // If the room has a storage take exclusively from that. Otherwise get it from wherever else you can find.
                    var roomStorage = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {filter: structure => 
                            structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > 3000
                        });
                    if(roomStorage){
                        if(creep.withdraw(roomStorage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                            creep.moveTo(roomStorage);
                        }
                        
                    }
                    else{
                        var droppedResource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
           
                        var storedResource = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                            filter: (resource) => 
                                (resource.structureType == STRUCTURE_CONTAINER && resource.store[RESOURCE_ENERGY] > 150) //||
                                //(resource.structureType == STRUCTURE_LINK && resource.energy > 0)
                        });	 
    
                        if (droppedResource) {
                            if(creep.pickup(droppedResource) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(droppedResource);
                            }
                        } else if (storedResource) { 
                            if(creep.withdraw(storedResource, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(storedResource);
                            }
                        } else{
                            var target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                            if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(target);                
                                }
                            }
                }
                    }
                }
            else{
                creep.memory.action = 'dropoff'
            }
        }
    }
}
module.exports = roleUpgrader;