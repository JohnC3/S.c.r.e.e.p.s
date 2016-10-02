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
                // If such a place exists go and transfer to it.
                if (drop_points.length > 0){
                    
                    var drop_struct = creep.pos.findClosestByPath(drop_points);
                    
                    var Tattempt = creep.transfer(drop_struct,RESOURCE_ENERGY);
                    
                    if(Tattempt == ERR_NOT_IN_RANGE){
                        creep.moveTo(drop_struct);
                    }
                    
                    if(Tattempt == OK){
                        var X = creep.pos.x;
                        var Y = creep.pos.y;
                        
                        var surrounding_structures = sources[i].room.lookForAtArea(LOOK_STRUCTURES, Y - 1, X - 1, Y + 1, X + 1, true);
                        console.log(surrounding_structures)
                        
                        console.log(surrounding_structures[0])
                        
                        var allPositions = _.reject(surrounding_structures, {'terrain': 'wall'}).length;
                    }
                    else{
                        creep.memory.gathering = false;
                    }
                    // If to far away move closer
                    //if (creep.transfer(drop_struct,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    //    creep.moveTo(drop_struct,reusePath = 2);
                    //    creep.transfer(drop_struct,RESOURCE_ENERGY)
                    //}
                    
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