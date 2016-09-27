var roleTruck = require('role.truck')

var roleBuilder = {
    // Take from storeage to build instead of stupid.
    run: function(creep) {
        if(creep.memory.station == undefined){
            creep.memory.station = creep.room.name;
        }
        
        if(creep.room.name != creep.memory.station){
            creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(creep.memory.station)));
        } 
        else{
            if(creep.room.find(FIND_CONSTRUCTION_SITES).length > 0){
                roleBuilder.build_Site(creep);
            }
            else if(creep.room.find(FIND_STRUCTURES,{filter: s => s.hits < s.hitsMax}).length > 0){
                roleBuilder.fix(creep);
            }
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
   	    
   	    
            var dropped_e = creep.room.find(FIND_DROPPED_RESOURCES);
            var storedResource = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (resource) => 
                    (resource.structureType == STRUCTURE_CONTAINER && resource.store[RESOURCE_ENERGY] > 0) ||
                    (resource.structureType == STRUCTURE_LINK && resource.energy > 0) ||
                    (resource.structureType == STRUCTURE_STORAGE && resource.store[RESOURCE_ENERGY] > 5000)
                    
                });	        

	        if (storedResource){
	            if (creep.withdraw(storedResource,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
	                creep.moveTo(storedResource)
	                
	            }
	        } else {
	            roleTruck.get_energy(creep)
	            
	            
	            /*if (dropped_e.length > 0){
	            var energy_pickup = creep.pos.findClosestByRange(dropped_e)
	                if(creep.pickup(energy_pickup) == ERR_NOT_IN_RANGE){
	                    creep.moveTo(energy_pickup);
	                }
	            }*/
	        }
   	}
};

module.exports = roleBuilder;