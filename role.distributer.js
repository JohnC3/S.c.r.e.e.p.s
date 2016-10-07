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
        
        if(Storage.store[RESOURCE_ENERGY] == 0){
            Storage = creep.pos.findClosestByRange(FIND_STRUCTURES,{filter:s => s.structureType == STRUCTURE_LINK});
        }

        if(creep.carry.energy == 0){
            creep.memory.gathering = true;
        }
        
        
        //If you are currently gathering go get resources
        if(creep.memory.gathering){
            // When full switch to dropoff mode.
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
        // When full begin dropping off energy.
        else{
            
            // Are there any empty towers?
            empty_towers = _.filter(creep.room.find(FIND_STRUCTURES,{filter: c=> c.structureType == STRUCTURE_TOWER}),{filter:s => s.Energy < 500})
            
            // If such a place exists go and transfer to it.
            if (drop_points.length > 0){
                
                var drop_struct = creep.pos.findClosestByPath(drop_points);

                if(creep.transfer(drop_struct,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(drop_struct);
                }
            }
            
            
            
            else if(creep.room.find(FIND_HOSTILE_CREEPS).length > 0 && empty_towers.length > 0){
                
                var tower = Game.getObjectById(creep.memory.priorityDrop)
                
                if(tower == undefined){
                    var tower = creep.pos.findClosestByPath(FIND_STRUCTURES, { filter: (s) => {
                        return ([STRUCTURE_TOWER].indexOf(s.structureType) != -1 && (s).energy < 500)}});
                    creep.memory.priorityDrop = tower.id;
                }
                
                if(creep.transfer(tower,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(drop_struct);
                }
            }
            
            
            else{
                if(creep.transfer(Storage,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(Storage);
                }
            }
        }

    }
}
        
     

module.exports = roleDistributer;