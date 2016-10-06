var roleTrooper = {
    
    run: function(creep){
        // Temporary pending code that checks if the walls of a room are up.
        creep.room.memory.wallsup = true
        
        if(creep.memory.defender && creep.room.memory.wallsup){
            roleTrooper.man_rampart(creep)
        }
        else{
        
            if(Game.flags[creep.memory.rally_flag].room != creep.room){
                creep.moveTo(Game.flags[creep.memory.rally_flag]);
            }
            else{
                
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
                
                else{
    
                    
                    var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                    if (target){
                        if(creep.attack(target) == ERR_NOT_IN_RANGE){
                            creep.moveTo(target);
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
        roleTrooper.melee(creep);
        roleTrooper.ranged(creep);
    },
    // Attack adjacent with melee creeps
    melee:function(creep){
        // For now just pick the nearist
        var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        // If defined
        if(target){
            return creep.attack(target);
        }
    },
    // Attack ranged target.
    ranged:function(creep){
        var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
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