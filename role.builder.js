var roleTruck = require('role.truck')
var roleHarvester = require('role.harvester')
var common = require('commonfunctions')


var roleBuilder = {
    // Take from storeage to build instead of stupid.
    
    
    
    run: function(creep) {
        
        if(Game.flags.Flag3){
            
            var target = Game.flags.Flag3.room.lookForAt(LOOK_STRUCTURES,Game.flags.Flag3)[0]
            
            if(creep.dismantle(target) == ERR_NOT_IN_RANGE){
                return creep.moveTo(target)
            }
        }
        
        if(creep.memory.station == undefined){
            creep.memory.station = creep.room.name;
            
        }
        
        
        common.moveToStation(creep)
        
        if(creep.room.name == creep.memory.station){
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
                    return {'tower':0,'spawn':1,'link':1,'storage':2,'extension':3,'container':4,'road':5,'wall':7,'rampart':6}[o.structureType];})
            
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
	// Gets energy.
   	getEnergy:function(creep){
   	    if(roleTruck.get_energy(creep) == 0){
            roleHarvester.get_energy(creep)
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
    }
};

module.exports = roleBuilder;


