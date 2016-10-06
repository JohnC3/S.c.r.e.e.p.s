var intel = require('military.intelligence');

var towerControl = {
    
    run:function(spawn){
        
        var r = Game.spawns[spawn].room;
        
        
        var towers = r.find(FIND_STRUCTURES,{filter: (structure) => (structure).structureType == STRUCTURE_TOWER});
        
        for(i in towers){
            var tower = towers[i];
        
        
            if(tower) {
                var target = towerControl.pick_target(tower,numTowers = towers.length);
                
                if(target) {
                    tower.attack(target);
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
                        // Don't waste energy on walls containers or ramparts
                        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                            filter: (structure) => (structure).hits < (structure).hitsMax && 
                            (structure).structureType != STRUCTURE_WALL &&
                            //(structure).structureType != STRUCTURE_CONTAINER && 
                            (structure).structureType != STRUCTURE_RAMPART
                            });
                        if(closestDamagedStructure) {
                           tower.repair(closestDamagedStructure);
                        }
                    }
                    
                }
            }
        }
    },
    pick_target:function(tower,numTowers = 1){
        // Use the intel functions to choose from a list of creeps.
        try{
            
            // Find all hostiles in the room
            var allHostiles = tower.pos.find(FIND_HOSTILE_CREEPS);
            
            // Find the most damage you can inflict, dont shoot at creeps that can out heal your damage!
            
            var inflict = 0;
            
            var target = undefined;
            
            for(i in allHostiles){
                var hostile = allHostiles[i];
                
                var damage_to_target = intel.tower_DPS(tower,hostile);
                
                var target_selfheal = intel.heal_DPS(hostile);
                
                if(inflict < damage_to_target - target_selfheal){
                    inflict = damage_to_target - target_selfheal;
                    target = creep;
                }
                
            }
            
            return target;
            

        }catch(Error){
            // If it breaks just choose the closest
            var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            
            return target;
        }
        
    }
}

module.exports = towerControl;