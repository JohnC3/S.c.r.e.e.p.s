var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        

        
        // todo:: Add a if else wrapper to this that blocks pickup attempts if a unsafe flag appears.
        
        if( creep.memory.action == 'dropoff'){
            // Looks for every container in the room that needs energy
            var drop_points = creep.room.find(FIND_STRUCTURES, { filter: (s) => {
                //return ([STRUCTURE_SPAWN,STRUCTURE_EXTENSION,STRUCTURE_TOWER].indexOf(s.structureType) != -1 && (s).energyCapacity > (s).energy)}});
                return ([STRUCTURE_SPAWN,STRUCTURE_EXTENSION,STRUCTURE_TOWER,STRUCTURE_CONTAINER].indexOf(s.structureType) != -1 && (s).energyCapacity > (s).energy)}});
            
            // If such a place exists go and transfer to it.
            if (drop_points.length > 0){
                
                var drop_struct = creep.pos.findClosestByPath(drop_points);
                // Attempt to transfer to the container
                var attempted_transfer = creep.transfer(drop_struct,RESOURCE_ENERGY);
                // If to far away move closer
                if (attempted_transfer == ERR_NOT_IN_RANGE){
                    creep.moveTo(drop_struct);
                }
                // If the harvester is now empty it should pickup more energy
                else if(creep.carry.energy == 0){
                    creep.memory.action = 'pickup'
                    // chose where to pickup!
                    
                }
                
            }
            // If no such place exists fucking go sulk at Idle
            else if (drop_points.length == 0){
                creep.moveTo(Game.flags.Idle);
            }
        }
        else if (creep.memory.action == 'pickup'){
            // If you are full just
            if(creep.carry.energy == creep.carryCapacity){
                creep.memory.action = 'dropoff';
                creep.say('dropoff');
            }
            else{
                var target = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                if(target) {
                    if(creep.harvest(target) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target);
                    }
                }
            }

            
        }
        else{
            creep.memory.action = 'dropoff'
        }
        
    }
}
module.exports = roleHarvester;