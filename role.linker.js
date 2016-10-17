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
        
        // If the links are set to go from storage to controller.
        if(creep.room.memory.invert){
            if(Link.energy < 400){
                roleLinker.transfer(creep,Link,Storage)
            } else if(Link.energy > 650){
                roleLinker.transfer(creep,Storage,Link)
            }
            
        }
        else{
            roleLinker.transfer(creep,Storage,Link)
            
        }
    },
    // Transfer from one to the other.
    transfer:function(creep,target,source){
        if(creep.carry.energy > 0){
            if(creep.transfer(target,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                creep.moveTo(target);
            }
        }
        else{
            if(creep.withdraw(source,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                creep.moveTo(source);
                }
            }
        }
}
        
     

module.exports = roleLinker;