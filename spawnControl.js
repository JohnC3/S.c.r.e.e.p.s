ecoAI = require('eco.AI')


bodyBuilder = require('bodyBuilder')

var spawnControl = {
    
    run:function(spawn){
        
        var currentSpawn = Game.spawns[spawn];

        var cur_room = currentSpawn.room;
        
        var enemy_creeps = cur_room.find(FIND_HOSTILE_CREEPS);

        spawnControl.economic(spawn)

        
        
    },
    economic:function(spawn){

        var currentSpawn = Game.spawns[spawn];

        var cur_room = currentSpawn.room;
        
        var cur_controler = cur_room.controller;
        
        var room_development = cur_room.energyCapacityAvailable;
        
        var num_sources = currentSpawn.room.find(FIND_SOURCES).length;
        
        var num_links = currentSpawn.room.find(FIND_STRUCTURES, {filter : s => s.structureType == STRUCTURE_LINK} ).length;
        
        var num_storage = cur_room.find(FIND_STRUCTURES,{filter: s => s.structureType == STRUCTURE_STORAGE }).length;
        // The worker body changes based on energy capacity availalbe

                                var worker_body_by_RCL =   {1:[WORK,WORK,CARRY,MOVE],
                                                2:[WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], // The end of teir 2
                                                3:[WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],//Max energy for RCL 3
                                                4:[WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                                5:[WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                                6:[WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                                7:[WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                                8:[WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],
                                };
                                
                                var upgrader_body_by_RCL =   {1:[WORK,WORK,CARRY,MOVE],
                                                2:[WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE],
                                                
                                                3:[WORK,WORK,WORK,MOVE,MOVE,CARRY,MOVE,MOVE,MOVE],
                                                4:[WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
                                                5:[WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
                                                6:[WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                                7:[WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                                8:[WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                };
                        
                                
                                var upgrader_body_by_RCL =   {1:[WORK,WORK,CARRY,MOVE],
                                                2:[WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE],
                                                
                                                3:[WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE],
                                                4:[WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
                                                5:[WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
                                                6:[WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                                7:[WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                                8:[WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                };
        
                                
                        
        
        
        
                                var workerBody = worker_body_by_RCL[cur_controler.level];
                                
                                //console.log(ecoAI.bodyCost(workerBody));
                        
                                var upgraderBody = upgrader_body_by_RCL[cur_controler.level];
                                
                                if(ecoAI.bodyCost(workerBody) > room_development || ecoAI.bodyCost(upgraderBody) > room_development){
                                    var workerBody = worker_body_by_RCL[cur_controler.level -1] || [WORK,WORK,CARRY,MOVE];
                                    
                                    var upgraderBody = upgrader_body_by_RCL[cur_controler.level -1];
                                }
        // number of upgraders
        try{
            var upgraders_needed = Memory.Upgraders_needed[cur_room];
        }catch(Error){
            console.log('errror in upgraders needed by room')
            Memory.Upgraders_needed = {}
        }
        if(upgraders_needed == undefined || Memory.T == 1){
            
            Memory.Upgraders_needed[cur_room] = ecoAI.optimalUpgraders(cur_room.name,upgraderBody,budget = 1800);
            
            upgraders_needed = Memory.Upgraders_needed[cur_room];
        }
        
        
        var transportBody = bodyBuilder.largest_transport(currentSpawn);

        var miner_body = bodyBuilder.largest_miner(currentSpawn)
        //.log(workerBody[0])
        //console.log('workerBody '+ecoAI.moveSpeed([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK]))
        
        
        var Harvesters = Memory.population['harvester']['room'][currentSpawn.room.name] || 0;

        var Builders = Memory.population['builder']['room'][currentSpawn.room.name] || 0;

        var Upgraders = Memory.population['upgrader']['room'][currentSpawn.room.name] || 0;

        var Miners = Memory.population['miner']['room'][currentSpawn.room.name] || 0;
        
        var Collectors = Memory.population['collector']['room'][currentSpawn.room.name] || 0;

        var Distributer = Memory.population['distributer']['room'][currentSpawn.room.name] || 0; 
        
        var Maintance = Memory.population['maintance']['room'][currentSpawn.room.name] || 0; 

        var Trucks = Memory.population['truck']['station'][currentSpawn.room.name] || 0;
        
        var Linkers = Memory.population['linker']['room'][currentSpawn.room.name] || 0;

        var Troops = Memory.population['trooper']['total'] || 0;

        var Troops = Memory.population['trooper']['total'] || 0; 
        
        var Archers = Memory.population['archer']['total'] || 0;

        var Knights = Memory.population['knight']['total'] || 0;

        var Raider = Memory.population['raider']['total'] || 0;

        var Healer = Memory.population['healer']['total'] || 0;
        
        var Claimer = Memory.population['claimer']['total'] || 0;
        
        //if (Memory.N % 10 == 1){
        //    console.log(''+cur_room.name+"\nh " + Harvesters +" bld " + Builders +" up " + Upgraders +"\nmine " + Miners +" trk " + Trucks +"\nsol " + Troops +" kni " + Knights +" raid " + Raider );
        //}
        
        
        
        /*if(cur_room.name == 'W52S33'){
            var builders = Memory.population['builder']['station']['W52S34'] || 0;
            if(builders < 2){
                var name = currentSpawn.createCreep(workerBody,"builder"+Memory.N,{'role':'builder','station':'W52S34'});
            }
        }*/
        

        if (Game.spawns[spawn].room.controller.ticksToDowngrade <4900 && currentSpawn.canCreateCreep(upgraderBody) != OK && Upgraders < 1){
            var name = currentSpawn.createCreep([WORK,CARRY,MOVE],"Eupgrader"+Memory.N,{'role':'upgrader','emergency':true});
            console.log('Emergency spawning upgrader ' + currentSpawn.name)
        }
        
        if (Miners > 0 && Trucks == 0 && num_links < num_sources + 1){
            var name = currentSpawn.createCreep([CARRY,CARRY,MOVE,MOVE],"ETruck"+Memory.N,{'role':'truck','collect_dropped':true,'emergency':true});
            console.log('Emergency spawning truck ' + currentSpawn.name)
        }
        if (Distributer == 0 && currentSpawn.canCreateCreep(transportBody) != OK && num_storage == 1){
            var name = currentSpawn.createCreep([CARRY,MOVE,CARRY,MOVE],"Edistributer"+Memory.N,{'role':'distributer','emergency':true});
            console.log('Emergency spawning distributer ' + currentSpawn.name)
        }
        if (Miners == 0 &&  Harvesters < 4){ // currentSpawn.canCreateCreep(workerBody) != OK &&
            var name = currentSpawn.createCreep([WORK,MOVE,CARRY],"Eharvester"+Memory.N,{'role':'harvester','emergency':true});
            console.log('Emergency spawning harvester ' + currentSpawn.name)
        }
        
        
        
        if (Raider < 0){
            var name = currentSpawn.createCreep([MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK],"Raider"+Memory.N,{'role':'raider','rally_flag':'troops','AttackStruct':true});
        
        }
        if (Troops < 2){
            var name = currentSpawn.createCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],"Troop"+Memory.N,{'role':'trooper','rally_flag':'troops'});
        } 
        
        var extractors = cur_room.find(FIND_MY_STRUCTURES,{filter: s => s.structureType == STRUCTURE_EXTRACTOR});
        
        
        if(Collectors < 1 && extractors.length > 0){
            var name = currentSpawn.createCreep(workerBody,"Collector"+Memory.N,{'role':'collector'});
        }
        
        var construction_sites = cur_room.find(FIND_CONSTRUCTION_SITES)

        if (Builders < num_sources && (construction_sites.length > 0)){ // || r_storage.store[RESOURCE_ENERGY] > 70000)){
            var name = currentSpawn.createCreep(workerBody,"builder"+Memory.N,{'role':'builder'});
        } else if (Upgraders <  upgraders_needed){
            var name = currentSpawn.createCreep(upgraderBody,"upgrader"+Memory.N,{'role':'upgrader'});
        } 
        
        // Only build trucks if there are no links! 
        if(num_links < num_sources + 1){
            if (_.filter(Game.creeps, (c)=>c.memory.role == 'truck' && c.memory.station == cur_room.name).length < num_sources){ //Math.floor(2 * num_sources)){
                var name = currentSpawn.createCreep(transportBody,"Truck"+Memory.N,{'role':'truck','station':cur_room.name,'droplocation':cur_room.name});
            } 
        } 
        
        // Miner body
        
        // How many work parts do the miners in the room currently have?
        var work_parts_in_miner = _.filter(miner_body,p => p == WORK).length;

        if(Miners*work_parts_in_miner < num_sources*5  && Miners < 6){

            var name = currentSpawn.createCreep(miner_body,"Miner"+Memory.N,{'role':'miner','station':cur_room.name});
        } 
        
        if(num_storage == 1){
            if (_.filter(Game.creeps, (c)=>c.memory.role == 'distributer' && c.room.name == cur_room.name && c.memory.emergency != true && c.ticksToLive > 100).length < 1){
                
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

    },
    
    
    
    remote_source_mine:function(RoomName,SpawnLoc,NumTrucks,numMiners,numClaimers,claim = false){
        
        // Energy available for spawning 
        var room_development = SpawnLoc.room.energyCapacityAvailable;
        
        var transport_body = bodyBuilder.largest_transport(SpawnLoc)
        
        // Miner body
        var miner_body = bodyBuilder.largest_miner(SpawnLoc)
     
        var work_parts_in_miner = _.filter(miner_body,p => p == WORK).length;
        
        // Create miners until their are at least 5 WORK parts per source.
        var Miners = Memory.population['miner']['station'][RoomName] || 0;

        var transports = Memory.population['truck']['station'][RoomName] || 0;
        
        var claimers = Memory.population['claimer']['station'][RoomName] || 0 
        
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
                console.log(""+RoomName+" "+name);
                Memory.N = Memory.N +1;
        }
    }
}

module.exports = spawnControl;