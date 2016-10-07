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
            var allHostiles = tower.room.find(FIND_HOSTILE_CREEPS);
            
            // If you can finish off a creep this turn do it.
            
            var one_shotable = _.reject(allHostiles,function(c){intel.tower_DPS(tower,c) > c.hits})
            
            // If a creep can heal target it && the tower can out DPS it, make it a priority target.
            
            var healers = _.reject(allHostiles,
                function(c){
                    return ((intel.heal_DPS(c) > 0) &&  (intel.tower_DPS(tower,c) > intel.heal_DPS(c)))
                });
            
            // If you will damage a creeps functional parts target it.
            
            var crippling_blow = _.reject(allHostiles,
                function(c){
                    return intel.functional_damage(c) > 0
                })
            
            // Run the priorities
            // can we get a kill?
            if(one_shotable.length > 0){
                var targets = one_shotable;
            // Are there any healers?
            } else if(healers.length > 0){
                var targets = healers;

                
                
            // Can we disable one of them?    
            } else if(crippling_blow.length > 0){
                var targets = crippling_blow;
            } else{
                // Dont bother with creeps that cannot be out healed
                
                var other_tower = _.reject(tower.room.find(FIND_STRUCTURES,{filter: s => s.structureType == STRUCTURE_TOWER}),function(c){c.id == tower.id})
                
                
                
                var targets = _.reject(allHostiles,function(c){intel.tower_DPS(tower,c) + intel.tower_DPS(other_tower,c) < intel.heal_DPS(c)});
            }
            
            if(targets.length > 0){
                var xxx = _.sortBy(targets,function(c){return intel.tower_DPS(c)})[0]
                console.log(intel.tower_DPS(xxx))
                console.log(intel.heal_DPS(xxx))
                return xxx
                
                
            }
            
            

        }catch(Error){
            
            console.log('tower error!')
            // If it breaks just choose the closest
            var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            
            return target;
        }
        
    }
}

module.exports = towerControl;