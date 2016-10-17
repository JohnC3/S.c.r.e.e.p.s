ecoAI = require('eco.AI')

intel = require('military.intelligence')

bodyBuilder = require('bodyBuilder')

spawnCommands = require('spawn.commands')

var spawnControl = {
    
    run:function(spawn){
        
        var currentSpawn = Game.spawns[spawn];

        var cur_room = currentSpawn.room;
        
        var enemy_creeps = cur_room.find(FIND_HOSTILE_CREEPS);
        
        //Memory.creeps_needed[cur_room.name] = {};
        if(enemy_creeps.length > 0){
            spawnControl.military(spawn,enemy_creeps);
        }
        
        //try{
        spawnControl.economic(spawn);
        /*}catch(Error){
            console.log('Error in new economic code')
            spawnControl.economic(spawn);
        }*/
        
        
    },

    
    military:function(spawn,current_hostiles){
        var currentSpawn = Game.spawns[spawn];
        
        var cur_room = currentSpawn.room;
        
        var militia_size = Memory.population['trooper']['station'][cur_room.name] || 0;
        
        console.log(currentSpawn.name+' is under threat current milita '+militia_size);
        
        if (militia_size < 1){
            var militia_body = bodyBuilder.largest_milita(currentSpawn)
            var name = currentSpawn.createCreep(militia_body,"Militia"+Memory.N,{'role':'trooper','station':currentSpawn.room.name,'defender':true});
            console.log('spawning militia ' + name)
        }
        for(h in current_hostiles){
            var enemy = current_hostiles[h];
            intel.rampart_to_man(enemy);
        }
        
    },
    
 
    
    economic:function(spawn){
        
        /*
        if(spawn == 'Spawn1'){
            if(_.filter(Game.creeps,c => c.memory.role == 'civilian').length < 2){
                var name = Game.spawns.Spawn1.createCreep([MOVE],'civ tester'+Memory.N,{'role':'civilian'})

            }
        }
        */
        

        var currentSpawn = Game.spawns[spawn];

        var cur_room = currentSpawn.room;
        
        // Add a room that contains my spawn to my domain or rooms that are part of my nominal terratory.
        if(Memory.myDomain.indexOf(cur_room.name) == -1){
            Memory.myDomain.push(cur_room.name)
        }
        
        // SR is the name of the room
        var SR = currentSpawn.room.name;
        
        
        var num_sources = currentSpawn.room.find(FIND_SOURCES).length;
        
        
        
        var num_storage = cur_room.find(FIND_STRUCTURES,{filter: s => s.structureType == STRUCTURE_STORAGE }).length;

        var SpawnLoc = currentSpawn;
        
        // This is likely to throw type errors.
        try{
            var miner_body = Memory.creepBody[SR]['miner'];
            
            var transportBody = Memory.creepBody[SR]['transport'];
            
            var upgraderBody = Memory.creepBody[SR]['upgrader'];
            
            var workerBody = Memory.creepBody[SR]['worker'];
            
            var collectorBody = Memory.creepBody[SR]['collector'];
        }catch(TypeError){
            bodyBuilder.run(currentSpawn);
            
            var miner_body = Memory.creepBody[SR]['miner'];
            
            var transportBody = Memory.creepBody[SR]['transport'];
            
            var upgraderBody = Memory.creepBody[SR]['upgrader'];
            
            var workerBody = Memory.creepBody[SR]['worker'];
            
            var collectorBody = Memory.creepBody[SR]['collector'];
        }

        
        // If any of the bodies are undfined or 50 ticks have passed assign a body to each type.
        if(miner_body == undefined || miner_body == undefined || miner_body == undefined || miner_body == undefined || Memory.T == 1){
            bodyBuilder.run(currentSpawn);
        }
        
        var mem = Memory.population;
        
        
        // Declare a name 
        
        var name = '';
        

        if (mem['trooper']['total'] < Memory.troops_needed){
            name = currentSpawn.createCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,RANGED_ATTACK,RANGED_ATTACK],"Troop"+Memory.N,{'role':'trooper','rally_flag':'troops'});
        }

        // Emergency spawn code begins
        
        // Spawn a upgrader if the controller looks like its on its way to downgrading.
        if (currentSpawn.room.controller.ticksToDowngrade <4900 && currentSpawn.canCreateCreep(upgraderBody) != OK && mem['upgrader']['room'][SR] < 1){
            name = spawnCommands.spawnNew(spawnObject = currentSpawn,creep_body = [WORK,CARRY,MOVE],creep_name = "Eup"+Memory.N,creep_memory = {'role':'upgrader','emergency':true})
        }
        
        if (mem['miner']['room'][SR] > 0 && mem['truck']['station'][SR] == 0 && num_links < num_sources + 1){
            name = spawnCommands.spawnNew(spawnObject = currentSpawn,creep_body = [CARRY,CARRY,MOVE,MOVE],"ETruck"+Memory.N,creep_name = 'ETruck'+Memory.N,creep_memory = {'role':'truck','collect_dropped':true,'emergency':true})

        }
        
        var Emergency_distributers = _.filter(Game.creeps,c => c.memory.role == 'distributer' && c.room.name == cur_room.name && c.memory.emergency == true).length;
        
        var Non_Emergency_distributers = _.filter(Game.creeps,c => c.memory.role == 'distributer' && c.room.name == cur_room.name && c.memory.emergency != true).length;
        
        if (Emergency_distributers < 2 && Non_Emergency_distributers == 0 && currentSpawn.canCreateCreep(transportBody) != OK && num_storage == 1){
            name = spawnCommands.spawnNew(spawnObject = currentSpawn,creep_body = [CARRY,CARRY,MOVE,MOVE],creep_name = "Edistributer"+Memory.N,creep_memory = {'role':'distributer','emergency':true});
        }
        
        
        if (mem['miner']['room'][SR] == 0 &&  mem['harvester']['room'][SR] < 4){
            name = spawnCommands.spawnNew(spawnObject = currentSpawn,creep_body = [WORK,MOVE,CARRY],creep_name = "Harvester"+Memory.N,creep_memory = {'role':'harvester','emergency':true})
        }
        
        // Emergency code ends

        var extractors = cur_room.find(FIND_MY_STRUCTURES,{filter: s => s.structureType == STRUCTURE_EXTRACTOR});
        
        var minerals = cur_room.find(FIND_MINERALS,{filter: m => m.mineralAmount > 0})
        
        var collectorBody = Memory.creepBody[SpawnLoc.room.name]['collector'];
        
        if(mem['collector']['room'][SR] < 1 && extractors.length > 0 && minerals.length > 0){
            name = spawnCommands.spawnNew(spawnObject = currentSpawn,creep_body = collectorBody,creep_name = 'Collector '+Memory.N,creep_memory = {'role':'collector'}) 
        }
        
        var construction_sites = cur_room.find(FIND_CONSTRUCTION_SITES)

        // number of upgraders
        var upgraders_needed = Memory.Upgraders_needed[cur_room];

        if(upgraders_needed == undefined || Memory.T == 1){
            
            var harvest_cost = ecoAI.harvestCost(SpawnLoc);
            
            ecoAI.capUpgraderParts(SpawnLoc)
            
            var budget_by_room = {'W53S33':3000,'W52S33':3000,'W51S33':1500,'W52S34':1800}
            
            Memory.Upgraders_needed[cur_room] = ecoAI.optimalUpgraders(SpawnLoc,upgraderBody,budget = budget_by_room[cur_room.name] - harvest_cost);
            
            upgraders_needed = Memory.Upgraders_needed[cur_room];
        }
        
        var upgraderBody = Memory.creepBody[SR]['upgrader'];
        
        if (mem['upgrader']['room'][SR] <  upgraders_needed){
            name = spawnCommands.spawnNew(spawnObject = currentSpawn,creep_body = upgraderBody,creep_name = "Up "+Memory.N,creep_memory = {'role':'upgrader'}) 
        }
        
        // Builders before upgraders
        if (mem['builder']['room'][SR] < 2 && (construction_sites.length > 0)){
            name = spawnCommands.spawnNew(spawnObject = currentSpawn,creep_body = workerBody,creep_name = 'Con '+Memory.N,creep_memory = {'role':'builder'}) 
        } 
        
        // Only build trucks if there are no links! 
        
        var num_links = currentSpawn.room.find(FIND_STRUCTURES, {filter : s => s.structureType == STRUCTURE_LINK} ).length;
        
        if(num_links < num_sources + 1){
            var trucks_needed = num_sources;
        } else {
            var trucks_needed = 1;
        }
        
        var transportBody = Memory.creepBody[SpawnLoc.room.name]['transport'];
        
        if (mem['truck']['station'][SR] < trucks_needed){ 
            name = spawnCommands.spawnNew(spawnObject = currentSpawn,creep_body = transportBody,creep_name = "Truck "+Memory.N,creep_memory = {'role':'truck',
                'station':cur_room.name,'droplocation':cur_room.name}) 
        } 
        // Miner body
        
        var miner_body = Memory.creepBody[SpawnLoc.room.name]['miner'];
        
        // How many work parts do the miners in the room currently have?
        var work_parts_in_miner = _.filter(miner_body,p => p == WORK).length;

        if(mem['miner']['room'][SR]*work_parts_in_miner < num_sources*5  && mem['miner']['room'][SR] < 6){
            
            name = spawnCommands.spawnNew(spawnObject = currentSpawn,creep_body = miner_body,creep_name = "Miner"+Memory.N,creep_memory = {'role':'miner','station':cur_room.name})
        } 
        
        if(num_storage == 1){
            if (_.filter(Game.creeps, (c)=>c.memory.role == 'distributer' && c.room.name == cur_room.name && c.memory.emergency != true && c.ticksToLive > 100).length < 2){
                
                spawnCommands.spawnNew(spawnObject = currentSpawn,creep_body = transportBody,creep_name = "Distributer"+Memory.N,creep_memory = {'role':'distributer','station':cur_room.name,'droplocation':cur_room.name})
                
            } else if (mem['maintance']['room'][SR] < 1 && cur_room.storage.store[RESOURCE_ENERGY] > 10000){
                name = spawnCommands.spawnNew(spawnObject = currentSpawn,creep_body = [WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],creep_name = "Maintance "+Memory.N,creep_memory = {'role':'maintance'}) 

            }
            if(num_links >= 2){
                if(mem['linker']['room'][SR] < 1){
                    name = spawnCommands.spawnNew(spawnObject = currentSpawn,creep_body = [CARRY,CARRY,CARRY,CARRY,MOVE],creep_name = 'Linker'+Memory.N,creep_memory = {'role':'linker'}) 
                }
            }
        }

        if (name != -4 && name != -6 && name != undefined && name != ''){
                console.log(""+spawn+" "+name);
                Memory.N = Memory.N +1;
        }
    }
}

module.exports = spawnControl;