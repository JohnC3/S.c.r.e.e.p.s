var roleBuilder = {
    // Take from storeage to build instead of stupid.
    run: function(creep) {
/*
        if(Game.flags.buildHere != undefined && creep.room != Game.flags.buildHere.room){
            creep.moveTo(Game.flags.buildHere)
        } 
        else{
     */ 
     
        
        if(creep.room.find(FIND_CONSTRUCTION_SITES).length > 0){
            roleBuilder.build_Site(creep);
        }
        else{
            roleBuilder.fix(creep);
        }
    },
    build_Site:function(creep){
        var constructionSite = Game.getObjectById(creep.memory.build_priority);
        if (constructionSite == undefined || constructionSite == null){
            //var constructions = _.groupBy(creep.room.find(FIND_CONSTRUCTION_SITES),[_.structureType]);
            var constructions = _.sortBy(creep.room.find(FIND_CONSTRUCTION_SITES),function(o) {
  return {'tower':0,'spawn':1,'link':1,'extension':2,'storage':2,'container':4,'road':5,'wall':6,'rampart':6}[o.structureType];})
            
            if(constructions.length > 0){
                
                creep.memory.build_priority = constructions.shift().id;
            }else{
                creep.memory.build_priority = undefined;
                
            }
        }
        

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            }
    
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	        creep.say('building');
	    }
	    
	    if(creep.memory.building) {
            if(creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(constructionSite);
            }
	    }
	    else {
	        roleBuilder.getEnergy(creep);

	    }
	}, 
	fix:function(creep){
	    if(creep.memory.repairing == undefined){
	        creep.memory.repairing = false;
	    }
	    if(creep.carry.energy == 0) {
            creep.memory.repairing = false;
        }
	    
	    if(creep.memory.repairing){
    	    var repair_target = Game.getObjectById(creep.memory.repair_priority);
    	    
    	    if(repair_target == undefined || repair_target.hits == repair_target.hitsMax){
    	        var damagedStructures = creep.room.find(FIND_STRUCTURES,{filter: (structure) => structure.hits < structure.hitsMax})
                var mostDamagedStructure = _.sortBy(damagedStructures,'hits');
                
                creep.memory.repair_priority = mostDamagedStructure[0].id;

    	    } else{
                if(creep.repair(repair_target) == ERR_NOT_IN_RANGE){
                    creep.moveTo(repair_target);
        	    }   
            }	        
	    }
	    // If you are not working go pick up energy from a container.
	    else{
	        // Reset the priority.
	        creep.memory.repair_priority = undefined
	        
	        if(creep.energy == creep.energyCapacity){
	            creep.memory.repairing = true;
	        }
	        // Get energy
            roleBuilder.getEnergy(creep);
   	    }
    },
   	getEnergy:function(creep){
   	    
   	        var storedResource = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (resource) => 
                    (resource.structureType == STRUCTURE_CONTAINER && resource.store[RESOURCE_ENERGY] > 500) ||
                    (resource.structureType == STRUCTURE_LINK && resource.energy > 500) ||
                    (resource.structureType == STRUCTURE_STORAGE && resource.store[RESOURCE_ENERGY] > 1000)
                });	        

	        if (storedResource){
	            if (creep.withdraw(storedResource,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
	                creep.moveTo(storedResource)
	                
	            }
	        } else {
	            var dropped_e = creep.room.find(FIND_DROPPED_RESOURCES);
	            if (dropped_e.length > 0){
	                
	                if(creep.pickup(dropped_e[0]) == ERR_NOT_IN_RANGE){
	                    creep.moveTo(dropped_e[0]);
	                }
	            }
	        }
   	}
};

module.exports = roleBuilder;