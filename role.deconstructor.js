var roleDeconstructor = {
    run:function(creep){
        var target = Game.getObjectById('57c2d267e8d9abcf6244e560')
        if (creep.dismantle(target) == ERR_NOT_IN_RANGE){
            creep.moveTo(target);
        }
        if (creep.carry.energy == creep.carryCapacity){
            creep.drop(RESOURCE_ENERGY);
        }
    }
    
    
}

module.exports = roleDeconstructor;