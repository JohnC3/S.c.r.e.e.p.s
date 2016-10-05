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
    }
}

module.exports = intel;