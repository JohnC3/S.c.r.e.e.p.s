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
                
                var target = Game.getObjectById(creep.memory.pickupPoint);
                
                if(target == undefined){
                    // Look for containers
                    var containersWithEnergy = creep.room.find(FIND_STRUCTURES, {filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 0});
                    
                    var dropped_e = creep.room.find(FIND_DROPPED_RESOURCES,{filter: d => d.pos.isEqualTo(Game.flags['Idle']) != true});
                    
                    if(dropped_e.length > 0){
                        var target = creep.pos.findClosestByRange(containersWithEnergy.concat(dropped_e));
                    } else{
                        var target = creep.pos.findClosestByRange(containersWithEnergy);
                    }
                    
                    if(target){
                        creep.memory.pickupPoint = target.id;
                    }
                    
                }
                
                var target = Game.getObjectById(creep.memory.pickupPoint);
                
                if(target){
                    // Try to pickup the energy.
                    var outcome = creep.pickup(target);
                    if(outcome == ERR_NOT_IN_RANGE){
                        creep.moveTo(target);
                    } else if (outcome == 0){
                        creep.memory.pickupPoint = undefined;
                    }
                    else if(outcome == -7){
                        // If structure 
                        var struct_outcome = creep.withdraw(target,RESOURCE_ENERGY);
                        if(struct_outcome == -9){
                            creep.moveTo(target);
                        } else if(struct_outcome == 0){
                            creep.memory.pickupPoint = undefined;
                        }
                    }
                
                }
                
                

                


            }
            
            // If full goto dropoff mode.
            if(creep.carry.energy == creep.carryCapacity){
                creep.memory.gathering = false;
                creep.memory.pickupPoint = undefined;
            }
        }
        // If you are not picking up energy drop it off.
        else{
            // If not in the correct room for a dropoff return to said room.
            if(creep.memory.droplocation != creep.room.name){
                creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(creep.memory.droplocation)));
            }
            else{
                
                var drop_points = creep.room.find(FIND_STRUCTURES, { filter: (s) => {
                    return ([STRUCTURE_SPAWN,STRUCTURE_EXTENSION,STRUCTURE_TOWER].indexOf(s.structureType) != -1 && (s).energyCapacity > (s).energy)}});

                var ST = creep.room.find(FIND_STRUCTURES, { filter: s => (s.structureType == STRUCTURE_STORAGE ||  (s.structureType == STRUCTURE_LINK) && s.energy < s.energyCapacity)});
                //If 
                if (ST.length > 0){
                    var closest_dropoff = creep.pos.findClosestByRange(ST)
                    //creep.say('hi')
                    
                    if (creep.transfer(closest_dropoff,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                        creep.moveTo(closest_dropoff);
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

                // If you have nothing to do AT all! Export to the homeland
                else{
                    if(creep.pos.inRangeTo(Game.flags['Idle'].pos,0)){
                        creep.drop(RESOURCE_ENERGY);
                        creep.memory.gathering = true;
                        creep.move(LEFT)
                    } else{
                        creep.moveTo(Game.flags['Idle'])
                    }
                    
                }
            }
            
        }
        
    }
}
        
     

module.exports = roleTruck;