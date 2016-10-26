var roleTruck = {
    run: function(creep){
        
        //if(Memory.safety[creep.room.name]){
            
            
        if(creep.memory.curRoom != creep.room.name){
            creep.moveTo(new RoomPosition(25,25, creep.pos.roomName));
            creep.say('New room');
            creep.memory.curRoom = creep.room.name;
            
        }
        
        if(creep.memory.station == undefined){
            creep.memory.station = creep.room.name;
            
        }
        
        if(creep.memory.energy_delivered == undefined){
            creep.memory.energy_delivered = 0;
        }
        
        //if(creep.memory.P === undefined){
        //    roleTruck.find_path(creep)
        //}
        
        
        
        
        
        if(creep.memory.energy_pickedup == undefined){
            creep.memory.energy_pickedup = 0;
        }
        
        if(creep.memory.droplocation == undefined){
            creep.memory.droplocation = creep.room.name;
        }
        
        if(creep.memory.gathering == undefined){
            creep.memory.gathering = true;
        }
        
        if(_.sum(creep.carry) == 0){
            creep.memory.gathering = true;
        }
        
        //If you are currently gathering go get resources
        if(creep.memory.gathering){
            
            roleTruck.get_energy(creep);
            // If you are not in your station go to your station!
            
            // If full goto dropoff mode.
            if(_.sum(creep.carry) == creep.carryCapacity){
                creep.memory.gathering = false;
                creep.memory.pickupPoint = undefined;
                
                creep.memory.energy_pickedup += creep.carryCapacity;
            }
        }
        // If you are not picking up energy drop it off.
        else{
            
            // Do roadwork if applicable.
            roleTruck.maintain_roads(creep);
            
            // If not in the correct room for a dropoff return to said room.
            if(creep.memory.droplocation != creep.room.name){
                /*
                var targ = creep.pos.findClosestByRange(creep.room.findExitTo(creep.memory.droplocation))
                try{
                    if(!creep.memory.path) {
                        creep.memory.path = creep.pos.findPathTo(targ);
                    }
                    creep.moveByPath(creep.memory.path);
                }
                

                catch(Error){
                    creep.moveTo(targ);
                }
                */
                creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(creep.memory.droplocation)))
            }
            else{
                
                var drop_points = creep.room.find(FIND_STRUCTURES, { filter: (s) => {
                    return ([STRUCTURE_SPAWN,STRUCTURE_EXTENSION,STRUCTURE_TOWER].indexOf(s.structureType) != -1 && (s).energyCapacity > (s).energy)}});
                    
                var containers = creep.room.find(FIND_STRUCTURES, { filter: (s) => {
                    return ([STRUCTURE_CONTAINER].indexOf(s.structureType) != -1 && s.energyCapacity > s.store[RESOURCE_ENERGY])}});

                var ST = creep.room.find(FIND_STRUCTURES, { filter: s => (s.structureType == STRUCTURE_STORAGE ||  (s.structureType == STRUCTURE_LINK) && s.energy < s.energyCapacity)});
                //If 
                if (ST.length > 0){
                    var closest_dropoff = creep.pos.findClosestByRange(ST)
                    //creep.say('hi')
                    
                    if(creep.pos.inRangeTo(closest_dropoff.pos,1)){
                        for(var resourceType in creep.carry) {
                            creep.transfer(closest_dropoff, resourceType)
                        }
                        creep.memory.energy_delivered += creep.carryCapacity;
                    } else{
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
                        creep.memory.energy_delivered += creep.carryCapacity
                    }
                }
                // If such a place exists go and transfer to it.
                else if (containers.length > 0){
                    
                    var drop_struct = creep.pos.findClosestByPath(containers);
                    // Attempt to transfer to the container
                    var attempted_transfer = creep.transfer(drop_struct,RESOURCE_ENERGY);
                    // If to far away move closer
                    if (drop_struct == ERR_NOT_IN_RANGE){
                        creep.moveTo(drop_struct);
                    }
                    // If the harvester is now empty it should pickup more energy
                    else if(_.sum(creep.carry) == 0){
                        creep.memory.gathering = true;
                        creep.memory.energy_delivered += creep.carryCapacity
                    }
                }

                // If you have nothing to do AT all! Export to the homeland
                else{
                    var idle_flag = Game.flags[creep.memory.droplocation+'Idle'];
                    if(idle_flag == undefined){
                        var idle_flag = Game.flags['Idle']
                        console.log('you mispelled the idle flag in room ' +creep.memory.droplocation)
                    }
                    if(creep.pos.inRangeTo(idle_flag.pos,0)){
                        creep.drop(RESOURCE_ENERGY);
                        creep.memory.gathering = true;
                        creep.move(LEFT)
                    } else{
                        creep.moveTo(idle_flag)
                    }
                    
                }
            }
            
        }
        //}else{
        //    creep.moveTo(creep.memory.spawn)
        //}
        
        
    },
    get_energy:function(creep,idleFlag = true){
        if(creep.memory.station != creep.room.name){
            creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(creep.memory.station)));
        }
        
        else{
            
            var target = Game.getObjectById(creep.memory.pickupPoint);
            
            if(target == undefined){
                // Look for containers
                var containersWithEnergy = creep.room.find(FIND_STRUCTURES, {filter: (i) => i.structureType == STRUCTURE_CONTAINER && i.store[RESOURCE_ENERGY] > 0});
                if(idleFlag){
                    var dropped_e = creep.room.find(FIND_DROPPED_RESOURCES,{filter: d => d.pos.isEqualTo(Game.flags[creep.memory.droplocation+'Idle']) != true});
                }
                else{
                    var dropped_e = creep.room.find(FIND_DROPPED_RESOURCES);
                }
                
                if(dropped_e.length > 0){
                    //console.log(JSON.stringify(containersWithEnergy.concat(dropped_e)))
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
            }else{
                return 0
            }
        }
    },
    maintain_roads:function(creep){
        // If you have a work part build nearby roads.
        work_parts = _.filter(creep.body,p => p.type == 'work').length;
        
        //console.log(JSON.stringify(creep.body))
        if(work_parts > 0){
            //creep.say(work_parts)
            try{
                var nearby_road = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES,{filter: c=> c.structureType == STRUCTURE_ROAD || c.structureType == STRUCTURE_CONTAINER});
                
                if(nearby_road){
                    creep.build(nearby_road);
                }else{
                    var nearby_road_work = creep.pos.findClosestByPath(FIND_STRUCTURES,{filter: c => (c.structureType == STRUCTURE_ROAD && c.hits <= (3*c.hitsMax)/4) || (c.structureType == STRUCTURE_CONTAINER && c.hits <= (3*c.hitsMax)/4)})
                    //var nearby_road_work = creep.pos.findClosestByPath(FIND_STRUCTURES,{filter: c => c.structureType == STRUCTURE_ROAD && c.hits < 4000})
                    if(nearby_road_work){
                        creep.repair(nearby_road_work)
                    }
                }
            }catch(Error){
                creep.say('build issue')
                console.log(creep.name+' build issue error : '+Error.message)
            }
            
        }
    }
}
        
     

module.exports = roleTruck;