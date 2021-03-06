var roleDistributer = {
    
    // The distributer takes energy from the storage and moves it to the tower spawn and extensions in that order!
    run: function(creep){
        try{
        if(creep.memory.assigned_storage == undefined){
            creep.memory.assigned_storage = creep.room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_STORAGE})[0].id;
            creep.memory.gathering = true;
            
        }
        var drop_points = creep.room.find(FIND_STRUCTURES, { filter: (s) => {
            return ([STRUCTURE_SPAWN,STRUCTURE_EXTENSION,STRUCTURE_TOWER].indexOf(s.structureType) != -1 && (s).energyCapacity > (s).energy)}});
            
        var Storage = Game.getObjectById(creep.memory.assigned_storage);
        
        if(Storage.store[RESOURCE_ENERGY] == 0){
            Storage = creep.pos.findClosestByRange(FIND_STRUCTURES,{filter:s => s.structureType == STRUCTURE_LINK});
        }

        if(creep.carry.energy == 0){
            creep.memory.gathering = true;
        }
        //If you are currently gathering go get resources
        if(creep.memory.gathering){
            // If you are not in your station go to your station!
            if(creep.carry.energy == creep.carryCapacity){
                creep.memory.gathering = false;
            }
            if(drop_points.length > 0){
                if(creep.withdraw(Storage,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(Storage);
                }
            } else{
                creep.moveTo(Storage);
            }
        } 
        else{
            // If such a place exists go and transfer to it.
            if (drop_points.length > 0){
                
                
                var drop_struct = creep.pos.findClosestByPath(drop_points);
                // If to far away move closer
                if (creep.transfer(drop_struct,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(drop_struct);
                    creep.transfer(drop_struct,RESOURCE_ENERGY)
                }
                else{
                    creep.memory.gathering = false;
                }
            }
            
            else{
                if(creep.transfer(Storage,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(Storage);
                }
            }
        }
                
        
        }catch(TypeError){
            
        }           
}
}
        
     

module.exports = roleDistributer;