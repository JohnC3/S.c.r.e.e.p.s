//dedicated, coordinated drop miners

var transitAI = require('transit.AI')

var roleMiner = {

    run: function(creep) {
        if(Memory.safety[creep.memory.station]){
            
            
            // Store how much energy you have gathered in your life.
            if(creep.memory.energy_harvested == undefined){
                
                creep.memory.energy_harvested = 0;
                
            }
            
            if(creep.room.name != creep.memory.station){
                var moveAttempt = creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(creep.memory.station)));
                if(moveAttempt == -2){

                    if(creep.pos.x == 49){
                        creep.move(LEFT);
                    } else if(creep.pos.x == 0){
                        creep.move(RIGHT);
                    }
                    
                }
                
            }
            
            // Move to a source with less then the required number of miners!
            
            else{
                
                var Work_parts = _.filter(creep.body,p => p.type == WORK).length;
                var required_miners = Math.ceil(5/Work_parts);
                
                // Check if you are mining in a core base or mining remotely.
                if(creep.memory.remote == undefined){
                    if(creep.room.find(FIND_MY_STRUCTURES,{filter: s => s.structureType == STRUCTURE_LINK}).length > 1){
                        creep.memory.remote = false;
                    }else{
                        creep.memory.remote = true;
                    }
                }
                
                // Choose source if you have not already.
                
                if(creep.memory.currSource == undefined){
            
                    var sources = creep.room.find(FIND_SOURCES);
            
                    for(i in sources){
                        
                        // Look at each source
                        var CS = sources[i].id;
                        
                        // How many open spots are their to mine from?
                        
                        if(Memory.adjacentPositions == undefined){
                            Memory.adjacentPositions = {};
                        }
                        
                        if(Memory.adjacentPositions[CS] == undefined){
                            
                            var X = sources[i].pos.x;
                            var Y = sources[i].pos.y;
                            
                            var surrArea = sources[i].room.lookForAtArea(LOOK_TERRAIN, Y - 1, X - 1, Y + 1, X + 1, true);
                            
                            var allPositions = _.reject(surrArea, {'terrain': 'wall'}).length;
                            
                            Memory.adjacentPositions[CS] = allPositions;
                            
                        }
                        else{
                            var allPositions = Memory.adjacentPositions[CS];
                        }
                        var current_miners = _.filter(Memory.population['miner']['creeps'],c => c.memory.currSource == CS);
                        //var current_miners = _.filter(Game.creeps,c => c.memory.role == 'miner' && c.memory.currSource == CS);
                        
                        if (current_miners.length < Math.min(required_miners,allPositions)){
                            creep.memory.currSource = CS;
                        }
                    }
                }
                else{
                    var target = Game.getObjectById(creep.memory.currSource);
        
                    if (creep.harvest(target) == ERR_NOT_IN_RANGE) {
                        
                        creep.moveTo(target);
                    }
                    
                    if (creep.carry.energy == creep.carryCapacity) {
                        
                        
                        
                        transitAI.establish_roads(creep)
                        
                        
                        
                        
                        // Every time you fill up count how much energy is harvested.
                        creep.memory.energy_harvested += creep.carryCapacity;
        
                        // Creeps set to remote mode (ie creeps mining in other rooms.)
                        if(creep.memory.remote){
                            roleMiner.remote(creep);
                            
                        } else{
                            //THIS IS SUPER CPU INTENSIVE!
                            var link = creep.pos.findInRange(FIND_STRUCTURES, 1, { 
                                filter: (structure) => structure.structureType == STRUCTURE_LINK && structure.energy < structure.energyCapacity
                                });
                                
                            var adjacent_containers = creep.pos.findInRange(FIND_STRUCTURES, 1, { 
                                filter: (structure) => structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] < 2000
                                });
                    	       
                	        if (link.length > 0) {
            	                var j = creep.transfer(link[0], RESOURCE_ENERGY);
            	                creep.say(j)
            	            } else if(adjacent_containers.length > 0){
            	                creep.say('transfer')
            	                creep.transfer(adjacent_containers[0], RESOURCE_ENERGY);
            	            }
            	            
            	            else {
            	                creep.drop(RESOURCE_ENERGY);
            	            }
                        }
                    }
                }
  
            }
        }
        else{
            
            creep.moveTo(creep.memory.spawn)
        }
    }, 
    // If a miner is in a remote location it should build a container under its feet!
    remote:function(creep){
        creep.drop(RESOURCE_ENERGY,25);
        creep.memory.energy_harvested += creep.carryCapacity;
        
        var x = creep.pos.x
        
        var y = creep.pos.y
        
        var look = creep.room.lookAt(creep);
        look.forEach(function(lookObject) {
            if(lookObject.type == LOOK_CONSTRUCTION_SITES) {
                creep.build(lookObject.constructionSite);
                creep.say('building')
                
            }
            else if(lookObject.type == LOOK_STRUCTURES){
                creep.repair(lookObject.structure);
                creep.say('fixing')
            }
        });

        creep.room.createConstructionSite(creep.pos,STRUCTURE_CONTAINER);
        
    }

};

module.exports = roleMiner;