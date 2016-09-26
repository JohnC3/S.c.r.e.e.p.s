var roleTrooper = {
    
    run: function(creep){
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
}

module.exports = roleTrooper;