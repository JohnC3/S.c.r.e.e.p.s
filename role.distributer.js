var roleDistributer = {
    
    // The distributer takes energy from the storage and moves it to the tower spawn and extensions in that order!
    run: function(creep){
        if(creep.memory.assigned_storage == undefined){
            creep.memory.assigned_storage = creep.room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_STORAGE})[0].id;
            creep.memory.gathering = true;
            
        }
        var drop_points = creep.room.find(FIND_STRUCTURES, { filter: (s) => {
            return ([STRUCTURE_SPAWN,STRUCTURE_EXTENSION,STRUCTURE_TOWER].indexOf(s.structureType) != -1 && (s).energyCapacity > (s).energy)}});
            
        var Storage = Game.getObjectById(creep.memory.assigned_storage);

        var linkTo = Storage.pos.findInRange(FIND_MY_STRUCTURES, 3, 
                {filter: s => s.structureType == STRUCTURE_LINK})[0];
                
        //console.log(linkTo)
        //console.log(Storage)
        if(creep.carry.energy == 0){
            creep.memory.gathering = true;
        }
        //If you are currently gathering go get resources
        if(creep.memory.gathering){
            // If you are not in your station go to your station!
            if(creep.carry.energy == creep.carryCapacity){
                creep.memory.gathering = false;
            }
            
            if(linkTo){
                if(creep.withdraw(linkTo,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(linkTo);
                    }
                }
           else if(creep.withdraw(Storage,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(Storage);
                
            }          
        } else{
            // If such a place exists go and transfer to it.
            if (drop_points.length > 0){
                
                
                var drop_struct = creep.pos.findClosestByPath(drop_points);
                // If to far away move closer
                if (creep.transfer(drop_struct,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(drop_struct);
                }
                else{
                    creep.memory.gathering = false;
                }
            }
            
            else if(drop_points.length == 0){
                creep.say('more for the pile')
                if(creep.transfer(Storage,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(Storage);
                }
            }
        }
                
        
                
}
}
        
     

module.exports = roleDistributer;