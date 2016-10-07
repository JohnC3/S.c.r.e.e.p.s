var roleTrooper = {
    
    run: function(creep){
        
        if(creep.memory.station == undefined){
            creep.memory.station = creep.room.name;
        } 
        if(creep.memory.rally_flag){
            if(Game.flags[creep.memory.rally_flag].room.name != creep.memory.station){
                creep.memory.station = Game.flags[creep.memory.rally_flag].room.name
            }            
        }

        
        // Temporary pending code that checks if the walls of a room are up.
        creep.room.memory.wallsup = true
        
        if(creep.memory.defender && creep.room.memory.wallsup){
            roleTrooper.man_rampart(creep)
        }
        else{
            // Move to the correct room.
            if(creep.room.name != creep.memory.station){
                creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(creep.memory.station)));
            }
            else{
                /*
                if (creep.memory.AttackStruct){
                    var tower = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: (structure) => structure.structureType == STRUCTURE_SPAWN});
                    if (tower != null){
                        //console.log(tower)
                        if (creep.attack(tower) == ERR_NOT_IN_RANGE){
                            creep.moveTo(tower);
                        }
                    }
                    
                    else{
                        if(creep.memory.rally_flag){
                            creep.moveTo(Game.flags[creep.memory.rally_flag]);
                        }
                        else{
                            creep.moveTo(Game.flags.rally);
                        }
                        
                    }
                } 
                */
                //else{
    
                    
                    var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                    

                    
                    if (target){
                        if(roleTrooper.melee(creep,target) == ERR_NOT_IN_RANGE){
                            creep.moveTo(target);
                        }
                        roleTrooper.ranged(creep,target);
                    }
                    else{
                        if(creep.memory.rally_flag){
                            creep.moveTo(Game.flags[creep.memory.rally_flag]);
                        }
                        else{
                            creep.moveTo(Game.flags.rally);
                        }
                        
                    }            
                //}
                //Seek out and attack any creeps other then mine.
            }
        }
    },
    // Go to a wall section and man said wall section.
    man_rampart:function(creep){
        var SpawnName = creep.pos.findClosestByRange(FIND_STRUCTURES,{filter:s => s.structureType == STRUCTURE_SPAWN}).name;
        
        var target_flag = Game.flags['WallPost'+SpawnName]
        
        if(creep.pos.getRangeTo(target_flag) > 0){
            creep.moveTo(target_flag)
        }
        
        var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        
        roleTrooper.melee(creep,target);
        roleTrooper.ranged(creep,target);
    },
    // Attack adjacent with melee creeps
    melee:function(creep,target){
        // For now just pick the nearist
        if(target){
            return creep.attack(target);
        }
    },
    // Attack ranged target.
    ranged:function(creep,target){
        // If defined
        if(target){
            return creep.rangedAttack(target);
        }
    },
    // Attack ranged target.
    ranged_mass:function(creep){
        var targets = creep.pos.findInRange(FIND_HOSTILE_CREEPS,3);
        // If defined
        if(targets){
            return creep.rangedMassAttack(targets);
        }
    }
}

module.exports = roleTrooper;