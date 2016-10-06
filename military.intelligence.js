var bodyBuilder = require('bodyBuilder');

/*
 * This package contains functions that examine enemy creeps and calculates various meta attributes about them.
 * For example
 * The melee DPS (or DPT) takes a creep and returns the damage done every tick by said creep.
 * The heal, ranged and deconstruct DPS functions do the same.
 * In the future add functions like who would win a function that determines which of two creeps will be 
 */

var intel = {
    
    // DPS of a creep.
    creep_DPS:function(creep){
        
        var DPS = {'melee':{'DPS':0,'boosted':0},
                'ranged':{'DPS':0,'boosted':0},
                'heal':{'DPS':0,'boosted':0}};

        for (i in creep.body){
            var part = creep.body[i];
            
            if(part.type == ATTACK){
                if(part.boost){
                    
                    DPS['melee']['DPS'] += 30*BOOSTS[part.type][part.boost];
                    DPS['melee']['boosted'] += part.boost;
                }
                else{
                    DPS['melee']['DPS'] += 30;
                }
            }
            else if(part.type == RANGED_ATTACK){
                if(part.boost){
                    DPS['ranged']['DPS'] += 10*BOOSTS[part.type][part.boost]['rangedAttack'];
                    DPS['ranged']['boosted'] += part.boost;
                }
                else{
                    DPS['ranged']['DPS'] += 10;
                }
            }
            else if(part.type == HEAL){
                if(part.boost){
                    DPS['heal']['DPS'] += 12*BOOSTS[part.type][part.boost]['heal'];
                    DPS['heal']['boosted'] += part.boost;
                }
                else{
                    DPS['heal']['DPS'] += 12;
                }
            }
        }
    },
    // Getter functions
    melee_DPS:function(creep){
        return intel.creep_DPS(creep)['melee']['DPS'];
    },
    ranged_DPS:function(creep){
        return intel.creep_DPS(creep)['ranged']['DPS'];
    },
    heal_DPS:function(creep){
        return intel.creep_DPS(creep)['heal']['DPS'];
    },
    // Find how much damage a tower object will do to a creep object
    tower_DPS:function(tower,creep){
        // When range is less then 5 a tower does 600 damage dropping to 150 damage at a range of 20 or more.
        var distance = tower.pos.getRangeTo(creep);
        
        var damage = 0;
        
        if (distance <= 5){
            damage = 600;
        } else if( distance >= 20){
            damage = 150;
        }else{
            damage = 600 - 30*(distance - 5);
        }
        return damage
    },
    // How much does the body of this creep cost? Can our spawns build a copy?
    superior_enemy:function(creep,x){

        if(typeOf(x) == "string"){
            var spawn = Game.spawns[x];
        }
        
        var val = bodyBuilder.bodyCost(creep) - spawn.energyCapacityAvailable
        
        if (val > 0){
            return true
        } else {
            return false
        }
    },
    // Get the closest rampart to a enemy creep.
    rampart_to_man:function(creep){
        
        // Name of spawn in room.
        var SpawnName = creep.pos.findClosestByRange(FIND_STRUCTURES,{filter:s => s.structureType == STRUCTURE_SPAWN}).name;
        
        var nearby_rampart = creep.pos.findClosestByRange(FIND_STRUCTURES,{filter:s => s.structureType == STRUCTURE_RAMPART});
        
        if(nearby_rampart.pos.createFlag('WallPost'+SpawnName) == ERR_NAME_EXISTS){
            Game.flags['WallPost'+SpawnName].setPosition(nearby_rampart.pos);
        }
    }
    
    
    
    
    
    
    
    
    
}

module.exports = intel;