var roleTruck = {
    run: function(creep){
        
        if(creep.memory.curRoom != creep.room.name){
            creep.moveTo(new RoomPosition(25,0, creep.pos.roomName));
            creep.say('New room');
            creep.memory.curRoom = creep.room.name;
            
        }
        
        if(creep.memory.station == undefined){
            creep.memory.station = creep.room.name;
            
        }
        
        if(creep.memory.droplocation == undefined){
            creep.memory.droplocation = creep.room.name;
        }
        
        if(creep.memory.gathering == undefined){
            creep.memory.gathering = true;
        }
        
        if(creep.carry.energy == 0){
            creep.memory.gathering = true;
        }
        
        //If you are currently gathering go get resources
        if(creep.memory.gathering){
            // If you are not in your station go to your station!
            if(creep.memory.station != creep.room.name){
                creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(creep.memory.station)));
            }
            else{
                if(creep.carry.energy > 0){
                    creep.memory.gathering = false;
                }
                
                
                // Look for full containers
                var containersWithEnergy = creep.room.find(FIND_STRUCTURES, {filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 0});
                // Choose the fullest.
                var constructions = _.sortBy(containersWithEnergy,function(c) {return [c.store[RESOURCE_ENERGY]];})

                if(creep.memory.collect_dropped) {
                    var dropped_e = creep.room.find(FIND_DROPPED_RESOURCES);
                    if(dropped_e.length > 0){
                        
                        if(creep.pickup(dropped_e[0]) == ERR_NOT_IN_RANGE){
                             creep.moveTo(dropped_e[0]);
                        }
                    }
                }

                else if (containersWithEnergy.length > 0 ){
                    if(creep.withdraw(constructions[0],RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                        creep.moveTo(constructions[0]);
                    }
                }
            }
        }
        // If you are not picking up energy drop it off.
        else{
            // If not in the correct room for a dropoff return to said room.
            if(creep.memory.droplocation != creep.room.name){
                creep.moveTo(creep.pos.findClosestByPath(creep.room.findExitTo(creep.memory.droplocation)));
            }
            else{
                
                var drop_points = creep.room.find(FIND_STRUCTURES, { filter: (s) => {
                    return ([STRUCTURE_SPAWN,STRUCTURE_EXTENSION,STRUCTURE_TOWER].indexOf(s.structureType) != -1 && (s).energyCapacity > (s).energy)}});

                var ST = creep.room.find(FIND_STRUCTURES, { filter: (s) => (s).structureType == STRUCTURE_STORAGE});
                if (ST.length > 0){
                    if (creep.transfer(ST[0],RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                        creep.moveTo(ST[0]);
                    }
                    
                }
                // If such a place exists go and transfer to it.
                else if (drop_points.length > 0){
                    
                    var drop_struct = creep.pos.findClosestByPath(drop_points);
                    // Attempt to transfer to the container
                    var attempted_transfer = creep.transfer(drop_struct,RESOURCE_ENERGY);
                    // If to far away move closer
                    if (attempted_transfer == ERR_NOT_IN_RANGE){
                        creep.moveTo(drop_struct);
                    }
                    // If the harvester is now empty it should pickup more energy
                    else if(creep.carry.energy == 0){
                        creep.memory.gathering = true;
                
                    }

            
                }
                
                else if(ST.length > 0){
                    if(creep.transfer(ST[0],RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                        creep.moveTo(ST[0]);
                        
                    }
                }
                // If you have nothing to do AT all! Export to the homeland
                else{
                    creep.moveTo(Game.flags[creep.room.name+'Idle'])
                    
                }
            }
            
        }
        
    }
}
        
     

module.exports = roleTruck;