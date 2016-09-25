var towerControl = {
    
    run:function(r){
        
        
        var towers = r.find(FIND_STRUCTURES,{filter: (structure) => (structure).structureType == STRUCTURE_TOWER});
        
        for(i in towers){
            var tower = towers[i];
        
        
            if(tower) {
                var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                if(closestHostile) {
                    tower.attack(closestHostile);
                }else if(tower.energy > 750){
                    var rampart = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => 
                        (structure).hits < 1000 && 
                        (structure).structureType == STRUCTURE_RAMPART
                        });
                    if(rampart) {
                       tower.repair(rampart);
                    } 
                    else{
                        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (structure) => (structure).hits < (structure).hitsMax && 
                            (structure).structureType != STRUCTURE_WALL && 
                            (structure).structureType != STRUCTURE_RAMPART
                            });
                        if(closestDamagedStructure) {
                           tower.repair(closestDamagedStructure);
                        }
                    }
                    
                }
            }
        }
    }
}

module.exports = towerControl;