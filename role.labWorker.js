
var roleCollector = require('role.collector')

var labWorker = {
    
    run: function(creep){
        
        if(creep.ticksToLive < 130 && _.sum(creep.carry) > 0){
            creep.suicide()
        }
        
        // Creep should move its resource too the lab marked with the resource flags.
        
        
        if(creep.memory.resource == undefined){
            creep.memory.resource = "O"
        }
        
        if(creep.memory.mineral_storage == undefined){
            labWorker.find_mineral_store(creep)
        }
        var mineral_storage = Game.getObjectById(creep.memory.mineral_storage)
        
        
        
        // Find the lab that takes the resource
        if(creep.memory.resource){
            
            var flag_of_lab = Game.flags[creep.memory.resource]
            
            var lab = flag_of_lab.pos.lookFor(LOOK_STRUCTURES,{filter: c => c.structureType == STRUCTURE_LAB})[0]
            
            if(lab){
                creep.memory.lab = lab.id
            }
            
            if(lab.mineralAmount > 0 && lab.mineralType != creep.memory.resource){
                console.log('lab mismatch error :(')
            }

            // Bring energy and minerals to the lab in volumes proportional to the ratio needed by the lab 
            
            // Get the amount of energy the lab still needs
            creep.memory.energy_needed = lab.energyCapacity - lab.energy

            // Get the amount of minerals needed to fill the lab.
            creep.memory.minerals_needed = lab.mineralCapacity - lab.mineralAmount
            
            var total = creep.memory.energy_needed + creep.memory.minerals_needed
            
            // If the total needed is greater then the creep can carry.
            if(total > creep.carryCapacity){
                
                var proportion = creep.memory.energy_needed/total
                
                creep.memory.energy_needed = Math.floor(proportion * creep.carryCapacity)
                
                creep.memory.minerals_needed = Math.floor((1 - proportion) * creep.carryCapacity)
            }
            
        }
        
        
        // If minerals/energy is needed do the move the minerals.
        
        if(creep.memory.gathering == undefined || _.sum(creep.carry) == 0){
            creep.memory.gathering = true;
        }
        
        else if(_.sum(creep.carry) ==  creep.memory.minerals_needed + creep.memory.energy_needed){
            creep.memory.gathering = false;
            
        }
        
        
        
        if(creep.memory.energy_needed > 0 || creep.memory.energy_needed > 0){
            
            if(creep.memory.gathering){
                // If the creep is more then 1 away from the storage move to the storage.
                
                if(creep.pos.inRangeTo(mineral_storage,1)){
                    
                    if(creep.carry.energy < creep.memory.energy_needed){
                        var e_err = creep.withdraw(mineral_storage,RESOURCE_ENERGY,creep.memory.energy_needed)
                        creep.say(e_err)
                    }
                    else{
                        var m_err = creep.withdraw(mineral_storage,creep.memory.resource,creep.memory.minerals_needed)
                        
                        if(m_err == ERR_NOT_ENOUGH_RESOURCES){
                            creep.memory.mineral_storage = undefined
                        }

                        if(m_err == OK){
                            creep.memory.gathering = false;
                        }
                        
                    }

                    
                }else{
                    creep.moveTo(mineral_storage)
                    
                }
            }
            
            else{
                
                if(creep.pos.inRangeTo(lab,1)){
                    var m_t_error = creep.transfer(lab,creep.memory.resource)
                    
                    var e_t_err = creep.transfer(lab,RESOURCE_ENERGY)
                }else{
                    creep.moveTo(lab)
                }
                
            }


            
        } else{
            // Drop the minerals in the nearist storage.
            roleCollector.store_carried(creep)
            
        }
        
        
    },
    
    // Find the storage containing the mineral in question.
    
    find_mineral_store:function(creep){
        
        var rt = creep.memory.resource
        
        // None found flag.
        
        var none_found = 0
        
        for(spawnName in Game.spawns){
            
            // Spawn object.
            var spawnObject = Game.spawns[spawnName];
            
            // If the room contains a storage see if it contains the resource you need.
            if(spawnObject.room.storage){
                
                var contense = spawnObject.room.storage.store
                
                //console.log(JSON.stringify(contense))
                
                if(Object.keys(contense).indexOf(rt) > -1){
                    creep.memory.mineral_storage = spawnObject.room.storage.id
                }
                
            }
            
        }
        if(none_found == 0){
            //
            console.log(creep.name+" can not find what the mineral "+creep.memory.resource +" and has opted to take its own life inexplicably.")
            creep.suicide()
        }
        
    },
    // dump into lab.
    
}
        
     

module.exports = labWorker;