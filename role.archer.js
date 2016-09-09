var roleArcher = {
    
    run: function(creep){
        if (Game.flags.retreat != undefined){
            creep.moveTo(Game.flags.retreat);
        }
        else{
            var tower = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {filter : (s) =>  (s).structureType != STRUCTURE_RAMPART }); // (s).structureType == STRUCTURE_TOWER ||)
            if (tower == null){
                creep.moveTo(Game.flags[creep.memory.rally_flag]);
            }
            else if(tower != null) {
                if (creep.rangedAttack(tower) == ERR_NOT_IN_RANGE){
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
            
            //Seek out and attack any creeps other then mine.
        }
    }
}

module.exports = roleArcher;