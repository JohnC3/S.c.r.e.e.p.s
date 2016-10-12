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
        
        try{
            spawnControl.new_economic(spawn);
        }catch(Error){
            console.log('Error in new economic code')
            spawnControl.economic(spawn);
        }
        
        
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

        var currentSpawn = Game.spawns[spawn];

        var cur_room = currentSpawn.room;
        
        if(Memory.myDomain.indexOf(cur_room.name) == -1){
            Memory.myDomain.push(cur_room.name)
        }
        
        var num_sources = currentSpawn.room.find(FIND_SOURCES).length;
        
        var num_links = currentSpawn.room.find(FIND_STRUCTURES, {filter : s => s.structureType == STRUCTURE_LINK} ).length;
        
        var num_storage = cur_room.find(FIND_STRUCTURES,{filter: s => s.structureType == STRUCTURE_STORAGE }).length;

        var SpawnLoc = currentSpawn;
        
        // This is likely to throw type errors.
        try{
            var miner_body = Memory.creepBody[SpawnLoc.room.name]['miner'];
            
            var transportBody = Memory.creepBody[SpawnLoc.room.name]['transport'];
            
            var upgraderBody = Memory.creepBody[SpawnLoc.room.name]['upgrader'];
            
            var workerBody = Memory.creepBody[SpawnLoc.room.name]['worker'];
            
            var collectorBody = Memory.creepBody[SpawnLoc.room.name]['collector'];
        }catch(TypeError){
            bodyBuilder.run(currentSpawn);
            
            var miner_body = Memory.creepBody[SpawnLoc.room.name]['miner'];
            
            var transportBody = Memory.creepBody[SpawnLoc.room.name]['transport'];
            
            var upgraderBody = Memory.creepBody[SpawnLoc.room.name]['upgrader'];
            
            var workerBody = Memory.creepBody[SpawnLoc.room.name]['worker'];
            
            var collectorBody = Memory.creepBody[SpawnLoc.room.name]['collector'];
        }

        
        // If any of the bodies are undfined or 50 ticks have passed assign a body to each type.
        if(miner_body == undefined || miner_body == undefined || miner_body == undefined || miner_body == undefined || Memory.T == 1){
            bodyBuilder.run(currentSpawn);
        }
        
        // number of upgraders
        try{
            var upgraders_needed = Memory.Upgraders_needed[cur_room];
        }catch(Error){
            console.log('errror in upgraders needed by room')
            Memory.Upgraders_needed = {}
        }
        
        if(upgraders_needed == undefined || Memory.T == 1){
            
            var harvest_cost = ecoAI.harvestCost(SpawnLoc);
            
            ecoAI.capUpgraderParts(SpawnLoc)
            
            var budget_by_room = {'W53S33':4000,'W52S33':3400,'W51S33':1500,'W52S34':1800}
            
            Memory.Upgraders_needed[cur_room] = ecoAI.optimalUpgraders(SpawnLoc,upgraderBody,budget = budget_by_room[cur_room.name] - harvest_cost);

            upgraders_needed = Memory.Upgraders_needed[cur_room];
            
            
            
        }

        var Harvesters = Memory.population['harvester']['room'][currentSpawn.room.name] ;

        var Builders = Memory.population['builder']['room'][currentSpawn.room.name] ;

        var Upgraders = Memory.population['upgrader']['room'][currentSpawn.room.name] ;

        var Miners = Memory.population['miner']['room'][currentSpawn.room.name] ;
        
        var Collectors = Memory.population['collector']['room'][currentSpawn.room.name] ;

        var Distributer = Memory.population['distributer']['room'][currentSpawn.room.name] ; 
        
        var Maintance = Memory.population['maintance']['room'][currentSpawn.room.name] ; 

        var Trucks = Memory.population['truck']['station'][currentSpawn.room.name] ;
        
        var Linkers = Memory.population['linker']['room'][currentSpawn.room.name] ;
        
        var Scouts = Memory.population['civilian']['room'][currentSpawn.room.name] ;

        var Troops = Memory.population['trooper']['total'] ;
        
        // Declare a name 
        
        var name = '';
        

        if (Troops < Memory.troops_needed){
            name = currentSpawn.createCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,RANGED_ATTACK,RANGED_ATTACK],"Troop"+Memory.N,{'role':'trooper','rally_flag':'troops'});
        }

        // Emergency spawn code begins
        
        
        
        // Spawn a upgrader if the controller looks like its on its way to downgrading.
        if (currentSpawn.room.controller.ticksToDowngrade <4900 && currentSpawn.canCreateCreep(upgraderBody) != OK && Upgraders < 1){
            var name = currentSpawn.createCreep([WORK,CARRY,MOVE],"Eupgrader"+Memory.N,{'role':'upgrader','emergency':true});
            console.log('Emergency spawning upgrader ' + currentSpawn.name)
        }
        
        if (Miners > 0 && Trucks == 0 && num_links < num_sources + 1){
            var name = currentSpawn.createCreep([CARRY,CARRY,MOVE,MOVE],"ETruck"+Memory.N,{'role':'truck','collect_dropped':true,'emergency':true});
            console.log('Emergency spawning truck ' + currentSpawn.name)
        }
        
        var Emergency_distributers = _.filter(Game.creeps,c => c.memory.role == 'distributer' && c.room.name == cur_room.name && c.memory.emergency == true).length;
        
        var Non_Emergency_distributers = _.filter(Game.creeps,c => c.memory.role == 'distributer' && c.room.name == cur_room.name && c.memory.emergency != true).length;
        
        if (Emergency_distributers < 2 && Non_Emergency_distributers == 0 && currentSpawn.canCreateCreep(transportBody) != OK && num_storage == 1){
            var name = currentSpawn.createCreep([CARRY,MOVE,CARRY,MOVE],"Edistributer"+Memory.N,{'role':'distributer','emergency':true});
            console.log('Emergency spawning distributer ' + currentSpawn.name)
        }
        if (Miners == 0 &&  Harvesters < 4){ // currentSpawn.canCreateCreep(workerBody) != OK &&
            var name = currentSpawn.createCreep([WORK,MOVE,CARRY],"Eharvester"+Memory.N,{'role':'harvester','emergency':true});
            console.log('Emergency spawning harvester ' + currentSpawn.name)
        }
        
        
        // Emergency spawn code ends
        
        var extractors = cur_room.find(FIND_MY_STRUCTURES,{filter: s => s.structureType == STRUCTURE_EXTRACTOR});
        
        var minerals = cur_room.find(FIND_MINERALS,{filter: m => m.mineralAmount > 0})
        
        //console.log(cur_room.name +' '+ minerals.length)
        
        
        
        
        
        
        if(Collectors < 1 && extractors.length > 0 && minerals.length > 0){
            var name = currentSpawn.createCreep(collectorBody,"Collector"+Memory.N,{'role':'collector'});
        }
        
        var construction_sites = cur_room.find(FIND_CONSTRUCTION_SITES)

        if (Builders < 2 && (construction_sites.length > 0)){
            var name = currentSpawn.createCreep(workerBody,"builder"+Memory.N,{'role':'builder'});
        } else if (Upgraders <  upgraders_needed){
            var name = currentSpawn.createCreep(upgraderBody,"upgrader"+Memory.N,{'role':'upgrader'});
        } 
        
        // Only build trucks if there are no links! 
        if(num_links < num_sources + 1){
            var trucks_needed = num_sources;
        } else {
            var trucks_needed = 1;
        }
        if (Trucks < trucks_needed){ 
            var name = currentSpawn.createCreep(transportBody,"Truck"+Memory.N,{'role':'truck','station':cur_room.name,'droplocation':cur_room.name});
        } 
        // Miner body
        
        // How many work parts do the miners in the room currently have?
        var work_parts_in_miner = _.filter(miner_body,p => p == WORK).length;

        if(Miners*work_parts_in_miner < num_sources*5  && Miners < 6){
            var name = currentSpawn.createCreep(miner_body,"Miner"+Memory.N,{'role':'miner','station':cur_room.name});
        } 
        
        if(num_storage == 1){
            if (_.filter(Game.creeps, (c)=>c.memory.role == 'distributer' && c.room.name == cur_room.name && c.memory.emergency != true && c.ticksToLive > 100).length < 2){
                
                var name = currentSpawn.createCreep(transportBody,"Distributer"+Memory.N,{'role':'distributer','station':cur_room.name,'droplocation':cur_room.name});
                
            } else if (Maintance < 1 && cur_room.storage.store[RESOURCE_ENERGY] > 10000){
                
                var name = currentSpawn.createCreep([WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],"Maintance "+Memory.N,{'role':'maintance'});
            }
            if(num_links >= 2){
                if(Linkers<1){
                    var name = currentSpawn.createCreep([CARRY,CARRY,CARRY,CARRY,MOVE],'Linker'+Memory.N,{'role':'linker'})
                }
            }
        }

        if (name != -4 && name != -6 && name != undefined){
                console.log(""+spawn+" "+name);
                Memory.N = Memory.N +1;
        }
        
        //spawnControl.spawnNew(currentSpawn,[WORK,MOVE,CARRY],1,"Eharvester"+Memory.N,{'role':'harvester','emergency':true})
        
    },
    
    new_economic:function(spawn){

        var currentSpawn = Game.spawns[spawn];

        var cur_room = currentSpawn.room;
        
        // Add a room that contains my spawn to my domain or rooms that are part of my nominal terratory.
        if(Memory.myDomain.indexOf(cur_room.name) == -1){
            Memory.myDomain.push(cur_room.name)
        }
        
        
        
        var num_sources = currentSpawn.room.find(FIND_SOURCES).length;
        
        
        
        var num_storage = cur_room.find(FIND_STRUCTURES,{filter: s => s.structureType == STRUCTURE_STORAGE }).length;

        var SpawnLoc = currentSpawn;
        
        // This is likely to throw type errors.
        try{
            var miner_body = Memory.creepBody[SpawnLoc.room.name]['miner'];
            
            var transportBody = Memory.creepBody[SpawnLoc.room.name]['transport'];
            
            var upgraderBody = Memory.creepBody[SpawnLoc.room.name]['upgrader'];
            
            var workerBody = Memory.creepBody[SpawnLoc.room.name]['worker'];
            
            var collectorBody = Memory.creepBody[SpawnLoc.room.name]['collector'];
        }catch(TypeError){
            bodyBuilder.run(currentSpawn);
            
            var miner_body = Memory.creepBody[SpawnLoc.room.name]['miner'];
            
            var transportBody = Memory.creepBody[SpawnLoc.room.name]['transport'];
            
            var upgraderBody = Memory.creepBody[SpawnLoc.room.name]['upgrader'];
            
            var workerBody = Memory.creepBody[SpawnLoc.room.name]['worker'];
            
            var collectorBody = Memory.creepBody[SpawnLoc.room.name]['collector'];
        }

        
        // If any of the bodies are undfined or 50 ticks have passed assign a body to each type.
        if(miner_body == undefined || miner_body == undefined || miner_body == undefined || miner_body == undefined || Memory.T == 1){
            bodyBuilder.run(currentSpawn);
        }
        
        var mem = Memory.population;
        
        var SR = currentSpawn.room.name;
        
        /*

        var Harvesters = mem['harvester']['room'][SR] ;

        var Builders = mem['builder']['room'][SR] ;


        var Miners = mem['miner']['room'][SR] ;
        
        var Collectors = mem['collector']['room'][SR] ;

        var Distributer = mem['distributer']['room'][SR] ; 
        
        var Maintance = mem['maintance']['room'][SR] ; 

        var Trucks = mem['truck']['station'][SR] ;
        
        var Linkers = mem['linker']['room'][SR] ;
        
        var Scouts = mem['civilian']['room'][SR] ;
        
        */
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
            
            var budget_by_room = {'W53S33':4000,'W52S33':3400,'W51S33':1500,'W52S34':1800}
            
            Memory.Upgraders_needed[cur_room] = ecoAI.optimalUpgraders(SpawnLoc,upgraderBody,budget = budget_by_room[cur_room.name] - harvest_cost);
            
            upgraders_needed = Memory.Upgraders_needed[cur_room];
        }
        
        var upgraderBody = Memory.creepBody[SR]['upgrader'];
        
        if (mem['upgrader']['room'][SR] <  upgraders_needed){
            name = spawnCommands.spawnNew(spawnObject = currentSpawn,creep_body = upgraderBody,creep_name = "Up "+Memory.N,creep_memory = {'role':'upgrader'}) 
        }
        
        // Builders before upgraders
        if (mem['harvester']['room'][SR] < 2 && (construction_sites.length > 0)){
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
            name = spawnCommands.spawnNew(spawnObject = currentSpawn,creep_body = transportBody,creep_name = "Truck "+Memory.N,creep_memory = {'role':'truck','station':cur_room.name,'droplocation':cur_room.name}) 
        } 
        // Miner body
        
        var miner_body = Memory.creepBody[SpawnLoc.room.name]['miner'];
        
        // How many work parts do the miners in the room currently have?
        var work_parts_in_miner = _.filter(miner_body,p => p == WORK).length;

        if(mem['miner']['room'][SR]*work_parts_in_miner < num_sources*5  && Miners < 6){
            
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