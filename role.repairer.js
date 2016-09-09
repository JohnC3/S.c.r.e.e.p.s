var roleRepairer = {
    
    run:function(creep){
        
        if(creep.memory.working == undefined){
            creep.memory.working = false;
        }
        

        if(creep.memory.working && creep.carry.energy == 0){
            //switch state
            creep.memory.working = false;
        }
        else if (!creep.memory.working && creep.carry.energy == creep.carryCapacity){
            // switch state
            creep.memory.working = true;
        }
        
        
        if (creep.memory.working){
            
            var closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (structure) => structure.hits < structure.hitsMax});
            if (closestDamagedStructure){
                if(creep.repair(closestDamagedStructure) == ERR_NOT_IN_RANGE){
                    creep.moveTo(closestDamagedStructure);
                }
            }                      
        }
            
        else{
	        var pickup_points = creep.room.find(FIND_STRUCTURES, { filter: (s) => {
                return ([STRUCTURE_CONTAINER].indexOf(s.structureType) != -1 && (s).energy) > 0}});
            if (pickup_points.length > 0){
            
                var target = creep.pos.findClosestByPath(pickup_points);
                var attempted_pickup = creep.withdraw(target,RESOURCE_ENERGY)
                if(attempted_pickup == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target);                
                }
                else if(attempted_pickup == OK){
                    creep.memory.building = true;
                }
            }
            else{
                creep.moveTo(Game.flags.Idle);
            }
	    }
	    
	  
	    
        // if creep is supposed to harvest energy from source
    }
}
module.exports = roleRepairer;