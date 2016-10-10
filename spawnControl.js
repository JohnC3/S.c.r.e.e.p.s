ecoAI = require('eco.AI')

intel = require('military.intelligence')

bodyBuilder = require('bodyBuilder')

var spawnControl = {
    
    run:function(spawn){
        
        var currentSpawn = Game.spawns[spawn];

        var cur_room = currentSpawn.room;
        
        var enemy_creeps = cur_room.find(FIND_HOSTILE_CREEPS);
        
        //Memory.creeps_needed[cur_room.name] = {};
        if(enemy_creeps.length > 0){
            spawnControl.military(spawn,enemy_creeps);
        }
        spawnControl.economic(spawn);
        
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
        }catch(TypeError){
            bodyBuilder.run(currentSpawn);
            
            var miner_body = Memory.creepBody[SpawnLoc.room.name]['miner'];
            
            var transportBody = Memory.creepBody[SpawnLoc.room.name]['transport'];
            
            var upgraderBody = Memory.creepBody[SpawnLoc.room.name]['upgrader'];
            
            var workerBody = Memory.creepBody[SpawnLoc.room.name]['worker'];
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
            
            Memory.Upgraders_needed[cur_room] = ecoAI.optimalUpgraders(SpawnLoc,upgraderBody,budget = 2000 - harvest_cost);

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

        var Troops = Memory.population['trooper']['total'] ;

        if (Troops < Memory.troops_needed){
            var name = currentSpawn.createCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,RANGED_ATTACK,RANGED_ATTACK],"Troop"+Memory.N,{'role':'trooper','rally_flag':'troops'});
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
        
        
        if(Collectors < 1 && extractors.length > 0){
            var name = currentSpawn.createCreep(workerBody,"Collector"+Memory.N,{'role':'collector'});
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
    
    // Function that handles spawning of creeps
    spawnNew:function(spawnObject,desired,body,name,memObject,byStation = true,ttl = body.length*3){
        
        // ttl is the number of ticks a new creep will take to replace the old one.
        
        var creep_role = memObject['role'];
        
        var rName = spawnObject.room.name;
        
        // How many creeps are either stationed or in the room.
        if(byStation){
            var cur_local_pop = Memory.population[creep_role]['station'][rName];
            
            // Lowest time to live among the creeps stationed in that room
            if(Memory.population[creep_role]['station'][rName+'TTL'] < ttl){
                cur_local_pop = cur_local_pop - 1;
            }
            
        }else{
            var cur_local_pop = Memory.population[creep_role]['room'][rName];
            
            // Lowest time to live among the creeps stationed in that room
            if(Memory.population[creep_role]['room'][rName+'TTL'] < ttl){
                cur_local_pop = cur_local_pop - 1;
            }
        }
        console.log(memObject)
        
        var extended = memObject;
        
        extended['spawn'] = spawnObject.name;
        
        console.log(extended)
        
        // Spawn if needed
        if(desired < cur_local_pop){
            
            var name = spawnObject.createCreep(body,name+Memory.N,extended);
            
            return name
            
        }
        

        
        
    },
    
    // Send miners trucks and claimers to a given room to mine it and return resorces to the base that spawned them.
    remote_source_mine:function(RoomName,SpawnLoc,NumTrucks,numMiners,numClaimers,claim = false){
        
        // transport body
        var transport_body = bodyBuilder.largest_transport(SpawnLoc)
        
        // Miner body
        var miner_body = bodyBuilder.largest_miner(SpawnLoc)
     
        var work_parts_in_miner = _.filter(miner_body,p => p == WORK).length;
        
        // Create miners until their are at least 5 WORK parts per source.
        var Miners = Memory.population['miner']['station'][RoomName]
        
        if(Memory.population['miner']['station'][RoomName+'TTL'] < 100){
            Miners = Miners - 1;
        }
        
        var transports = Memory.population['truck']['station'][RoomName]
        
        if(Memory.population['truck']['station'][RoomName+'TTL'] < 100){
            transports = transports - 1;
        }
        
        var claimers = Memory.population['claimer']['station'][RoomName] 
        
        if(Memory.population['claimer']['station'][RoomName+'TTL'] < 100){
            claimers = claimers - 1;
        }
        
        if(Miners*work_parts_in_miner < numMiners*5 && Miners < 6){
            var name = SpawnLoc.createCreep(miner_body,'RemoteMiner'+Memory.N,{'role':'miner','station':RoomName});

        } else if (transports <  NumTrucks){
            
            var name = SpawnLoc.createCreep(transport_body,"RTruck"+Memory.N,{'role':'truck','station':RoomName,'droplocation':SpawnLoc.room.name});
        } else if (claimers< numClaimers){ // && Game.rooms[RoomName].controller.reservation.ticksToEnd < 1500
            try{
                var name = SpawnLoc.createCreep([MOVE,MOVE,CLAIM,CLAIM],"Diplomat"+Memory.N,{'role':'claimer','station':RoomName,'claimmode':claim});
                if (name == ERR_NOT_ENOUGH_ENERGY){
                    var name = SpawnLoc.createCreep([MOVE,CLAIM],"Diplomat"+Memory.N,{'role':'claimer','station':RoomName,'claimmode':claim});
                }
            }catch(TypeError){
                console.log('claimer error')
            }
        }
        
        if (name != -4 && name != -6 && name != undefined){
                console.log(""+SpawnLoc.name+" "+name);
                Memory.N = Memory.N +1;
        }
    },
    
    // Dispatch builders to another room, along with trucks to dropoff energy in said room.
    dispatch_builders:function(RoomName,SpawnLoc,NumTrucks,numBuilders,numMiners = 1){
        
        var cur_room = SpawnLoc.room;
        
        var builders = Memory.population['builder']['station'][RoomName];
        
        
        
        if(builders < numBuilders){
            var workerBody = bodyBuilder.largest_worker(SpawnLoc)
            var name = SpawnLoc.createCreep(workerBody,"builder"+Memory.N,{'role':'builder','station':RoomName});
        }
        
        var trucks = Memory.population['truck']['station'][RoomName]
        
        if(trucks < NumTrucks){
            var transport_body = bodyBuilder.largest_transport(SpawnLoc)
            var name = SpawnLoc.createCreep(transport_body,"Hauler"+Memory.N,{'role':'truck','station':RoomName,'droplocation':RoomName});
        }
        
        var Miners = Memory.population['miner']['station'][RoomName]
        
        if(Miners < numMiners){
            var miner_body = bodyBuilder.largest_miner(SpawnLoc)
            var name = SpawnLoc.createCreep(miner_body,'RemoteMiner'+Memory.N,{'role':'miner','station':RoomName});

        }
        
        if (name != -4 && name != -6 && name != undefined){
                console.log(""+RoomName+" "+name);
                Memory.N = Memory.N +1;
        }
        
    }

    
}

module.exports = spawnControl;