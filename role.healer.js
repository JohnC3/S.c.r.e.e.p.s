var roleHealer = {
    
    run: function(creep){
        if (Game.flags.retreat != undefined){
            creep.moveTo(Game.flags.retreat);
        }
        
        else{

                
                
            var target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
                filter: function(object) {
                    return object.hits < object.hitsMax;
                }
            });
            
            if (target){
                creep.say('healing '+target.name)
                if(creep.heal(target) == ERR_NOT_IN_RANGE){
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
            
            //Seek out and attack any creeps other then mine.
        }
    }
}

module.exports = roleHealer;