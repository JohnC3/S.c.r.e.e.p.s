var roleTrooper = {
    
    run: function(creep){
        if (Game.flags.retreat != undefined){
            creep.moveTo(Game.flags.retreat);
        }
        else{
            
            if (Game.flags.AttackWall != undefined){
                if (creep.room != Game.flags.AttackWall.room){
                    creep.moveTo(Game.flags.AttackWall);
                }
                else{
                    var walls = creep.pos.findClosestByPath(FIND_STRUCTURES, {filter: (s) => (s).structureType != STRUCTURE_ROAD && (s).structureType != STRUCTURE_WALL});
                    if (creep.attack(walls) == ERR_NOT_IN_RANGE){
                        creep.moveTo(walls);
                    }
                }
            }
            
            else if (Game.flags.AttackStruct != undefined){
                 
                if (creep.room != Game.flags.AttackStruct.room){
                    creep.moveTo(Game.flags.AttackStruct);
                }
                else{
                    var tower = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter: (structure) => structure.structureType != STRUCTURE_CONTROLLER});
                    if (tower == null){
                        var tower = creep.pos.findClosestByRange(FIND_STRUCTURES, {filter: (structure) => structure.structureType == STRUCTURE_CONTAINER});
                    }
                    //console.log(tower)
                    if (creep.attack(tower) == ERR_NOT_IN_RANGE){
                        creep.moveTo(tower);
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