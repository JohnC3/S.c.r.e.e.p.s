var bodyBuilder = require('bodyBuilder');

/*
 * This package contains functions that examine enemy creeps and calculates various meta attributes about them.
 * For example
 * The melee DPS (or DPT) takes a creep and returns the damage done every tick by said creep.
 * The heal, ranged and deconstruct DPS functions do the same.
 * In the future add functions like who would win a function that determines which of two creeps will be 
 */

var intel = {
    
    // Defend my rooms from invaders and so on
    defense:function(){
        
        // Get the idle troops
        idle_troops = intel.find_available_troops();
        
        // Total enemy creeps.
        var total_enemy_creeps = 0
        
        // how many rooms are currently under attack?
        
        var attacks_in_progress = 0;
        
        for(var r in Game.rooms){
            
            current_room = Game.rooms[r]
            
            var enemy_creeps = current_room.find(FIND_HOSTILE_CREEPS);
            
            if(enemy_creeps.length > 0 && Memory.myDomain.indexOf(r) > 0){
                
                //  If a room has enemy creeps it is not safe.
                Memory.safety[current_room] = false;
                
                total_enemy_creeps += enemy_creeps.length;
                
                attacks_in_progress += 1;
                
                // Defenders assigned to defend that room
                
                var assigned_defenders = Memory.population['trooper']['station'][current_room.name] || 0;
                
                // Assign new defenders to the room by proximity to the room but only from the pool of creeps whos room is safe (but not undefined)
                
                if(assigned_defenders < Math.max(enemy_creeps.length,2)){
                    
                    var closest = _.sortBy(idle_troops,{function(c){ return Game.map.getRoomLinearDistance(current_room.name,c.room.name)}})
                    
                    console.log(closest)
                    
                    // Get the closest idle trooper
                    var idler = closest.shift()
                    
                    // Original assignment
                    if(idler){
                        console.log(idler.name +' leaving room '+current_room.name+' to defend '+idler.memory.station)
                    
                        idler.memory.station = current_room.name;
                    }else{
                        console.log('no idlers')
                    }
                    

                }
                else{
                    console.log('assigned_defenders '+assigned_defenders)
                }
                
                Game.flags.troops.setPosition( new RoomPosition(25,25, r))
                
                intel.safeModeTest(current_room);

            }
            // Set safety to true if the room has no enemies.
            if(enemy_creeps == 0){
                Memory.safety[current_room] = true;
            }
            
        }

        if(attacks_in_progress > 0){
            console.log('attacks_in_progress '+attacks_in_progress)
        }
        
        
        // Maintain a garrison of at least two but otherwise equal size to that of the enemy.
        Memory.troops_needed = Math.max(total_enemy_creeps,2)
        
    },
    
    // Find every available trooper.
    find_available_troops:function(){
        
        // Array of idle defenders.
        
        var idle_defenders = new Array();
        
        var troops = _.filter(Game.creeps,c => c.memory.role == 'trooper' && c.memory['defender'] != true)
        
        for(i in troops){
            var trooper = troops[i];
            
            // If a trooper is in a room with enemy creeps it is not idle
            var hostiles = trooper.room.find(FIND_HOSTILE_CREEPS);
            // If a trooper is stationed in a room with enemy creeps it is not idle. (true when value >0 or value is undefined)
            var hostiles_Station = Game.rooms[trooper.memory['station']]
            
            // If not undefined get hostiles.
            if(hostiles_Station != undefined){
                var hostiles_Station = hostiles_Station.find(FIND_HOSTILE_CREEPS).length;
            } else{
                hostiles_Station = 2;
            }
            
            if(hostiles.length == 0 && (hostiles_Station == 0 && hostiles_Station != undefined)){
                idle_defenders.push(trooper)
            }
        }
        //console.log('idle_defenders '+idle_defenders.length)
        return idle_defenders
        
    },    
    
    
    // Activate safe mode if needed.
    safeModeTest:function(curRoom){
        
        if(Game.rooms.curRoom){
            // If this is a owned room
            if(curRoom.controller.owner){
                // See if any of the functional parts (towers,spawns,extensions,etc) basically eveything but roads, walls, ramparts and containers
                var damaged_important_structures = curRoom.find(FIND_MY_STRUCTURES,{filter: s => 
                    (s.hits < s.hitsMax) &&
                    (s.structureType != STRUCTURE_CONTAINER ||
                    s.structureType != STRUCTURE_WALL ||
                    s.structureType != STRUCTURE_ROAD ||
                    s.structureType != STRUCTURE_RAMPART)
                })
                if(damaged_important_structures.length > 0){
                    curRoom.controller.activateSafeMode();
                }
            }
        }
        

    },
    

    
    
    
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
        // Return the various DPSs of the creep
        return DPS
        
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
    },
    
    // How much damage a hit will do to functional parts (Everything but tough)
    functional_damage:function(creep,incomeing_damage){
        // while the attack has some power left keep removing body parts and reduceing attack strength.
        var damage_left = incomeing_damage;
        
        // Local array to store the body of the creep to work on.
        var body = creep.body;
        
        // Functional damage total
        var functional_damage = 0;
        
        while(damage_left > 0){
            // Take the first part.
            var part = body.shift()
            // How many hits does it have?
            if(part.type == TOUGH){
                if (part.boost){
                    damage_left = damage_left - 50/BOOSTS['tough'][part.boost];
                }
            }
            else{
                damage_left = damage_left - 50;
                
                functional_damage += part.hits;
            }
        }

        // If damage left goes negative reduce the functional damage to compensate.
        if(damage_left < 0 && functional_damage > 0){
            functional_damage = functional_damage + damage_left;
        }
        return functional_damage;
    }

    
    
    
    
    
}

module.exports = intel;