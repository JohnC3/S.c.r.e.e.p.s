var roleLinker = {
    
    // The distributer takes energy from the storage and moves it to the tower spawn and extensions in that order!
    run: function(creep){
        
        if(creep.memory.assigned_storage == undefined){
            creep.memory.assigned_storage = creep.room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_STORAGE})[0].id;
        }
        var Storage = Game.getObjectById(creep.memory.assigned_storage);

        if(creep.memory.assigned_link == undefined){
            creep.memory.assigned_link = Storage.pos.findInRange(FIND_MY_STRUCTURES, 3, 
                {filter: s => s.structureType == STRUCTURE_LINK})[0].id;
        }
        var Link = Game.getObjectById(creep.memory.assigned_link);

        if(creep.carry.energy > 0){
                if(creep.transfer(Storage,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                    creep.moveTo(Storage);
                }
        }
        else{
            if(creep.withdraw(Link,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                creep.moveTo(Link);
                }
            }
        }
}
        
     

module.exports = roleLinker;