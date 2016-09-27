var spawnControl = {
    
    run:function(spawn){
        
        var currentSpawn = Game.spawns[spawn];

        var cur_room = currentSpawn.room;
        
        //if(){
        spawnControl.economic(spawn)
        //}
        //else{
            // Spawn defender
        //}
        
        
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
                        4:[WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
                        5:[WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                        6:[WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                        7:[WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                        8:[WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],
        };
        
        var upgrader_body_by_RCL =   {1:[WORK,WORK,CARRY,MOVE],
                        2:[WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE],
                        3:[WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE],
                        4:[WORK,WORK,WORK,CARRY,MOVE,MOVE],
                        5:[WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
                        6:[WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                        7:[WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                        8:[WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
        };
        
        var truck_body_by_RCL =   {1:[MOVE,MOVE,CARRY,CARRY],
                        2:[MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY], // The end of teir 2
                        3:[MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY],//Max energy for RCL 3
                        4:[MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY],
                        5:[MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY],
                        6:[MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY],
                        7:[MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY],
                        8:[MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY]
        };
        
        // number of upgraders
        var upgraders_needed_by_RCL =   {1:4,
                        2:10,
                        3:6,
                        4:6,
                        5:3,
                        6:3,
                        7:4,
                        8:1,
        };        
        
        
        
        var workerBody = worker_body_by_RCL[cur_controler.level];
        
        //console.log(spawnControl.bodyCost(workerBody));

        var upgraderBody = upgrader_body_by_RCL[cur_controler.level];
        
        var transportBody = spawnControl.largest_transport(currentSpawn);
        
        if(spawnControl.bodyCost(workerBody) > room_development || spawnControl.bodyCost(upgraderBody) > room_development){
            var workerBody = worker_body_by_RCL[cur_controler.level -1] || [WORK,WORK,CARRY,MOVE];
            
            var upgraderBody = upgrader_body_by_RCL[cur_controler.level -1];
            
            var transportBody = truck_body_by_RCL[cur_controler.level -1];
            
        }

        var Harvesters = Memory.population['harvester']['station'][currentSpawn.room.name] || 0;

        
        var Builders = Memory.population['builder']['room'][currentSpawn.room.name] || 0;

        var Upgraders = Memory.population['upgrader']['room'][currentSpawn.room.name] || 0;

        var Miners = Memory.population['miner']['room'][currentSpawn.room.name] || 0;
        
        var Collectors = Memory.population['collector']['room'][currentSpawn.room.name] || 0;

        var Distributer = Memory.population['distributer']['room'][currentSpawn.room.name] || 0; 

        var Trucks = Memory.population['truck']['room'][currentSpawn.room.name] || 0;

        var Troops = Memory.population['trooper']['total'] || 0;

        var Troops = Memory.population['trooper']['total'] || 0; 
        
        var Archers = Memory.population['archer']['total'] || 0;

        var Knights = Memory.population['knight']['total'] || 0;

        var Raider = Memory.population['raider']['total'] || 0;

        var Healer = Memory.population['healer']['total'] || 0;
        
        var Claimer = Memory.population['claimer']['total'] || 0;
        
        var Deconstructors = Memory.population['deconstructor']['total'] || 0;
       
        if (Memory.N % 10 == 1){
            console.log(''+cur_room.name+"\nh " + Harvesters +" bld " + Builders +" up " + Upgraders +"\nmine " + Miners +" trk " + Trucks +"\nsol " + Troops +" kni " + Knights +" raid " + Raider );
        }
        

        if (Game.spawns[spawn].room.controller.ticksToDowngrade <4900 && currentSpawn.canCreateCreep(upgraderBody) != OK){
            var name = currentSpawn.createCreep([WORK,CARRY,MOVE],"Eupgrader"+Memory.N,{'role':'upgrader','emergency':true});
            console.log('Emergency spawning upgrader' + cur_room.name)
        }
        
        if (Miners > 0 && Trucks == 0 && num_links < num_sources + 1){
            var name = currentSpawn.createCreep([CARRY,CARRY,MOVE,MOVE],"ETruck"+Memory.N,{'role':'truck','collect_dropped':true,'emergency':true});
            console.log('Emergency spawning truck' + cur_room.name)
        }
        if (Distributer == 0 && currentSpawn.canCreateCreep(transportBody) != OK && num_storage == 1){
            var name = currentSpawn.createCreep([CARRY,MOVE],"Edistributer"+Memory.N,{'role':'distributer','emergency':true});
            console.log('Emergency spawning distributer ' + cur_room.name)
        }
        if (Miners == 0 &&  Harvesters < 4){ // currentSpawn.canCreateCreep(workerBody) != OK &&
            var name = currentSpawn.createCreep([WORK,MOVE,CARRY],"Eharvester"+Memory.N,{'role':'harvester','emergency':true});
            console.log('Emergency spawning harvester ' + cur_room.name)
        }
        
        
        
        else if (Raider < 0){
            var name = currentSpawn.createCreep([MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK],"Raider"+Memory.N,{'role':'raider','rally_flag':'troops','AttackStruct':true});
        
        }
        if (Troops < 2){
            var name = currentSpawn.createCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK],"Troop"+Memory.N,{'role':'trooper','rally_flag':'troops'});
        } 

        var extractors = cur_room.find(FIND_MY_STRUCTURES,{filter: s => s.structureType == STRUCTURE_EXTRACTOR});
        
        
        if(Collectors < 1 && extractors.length > 0){
            var name = currentSpawn.createCreep(workerBody,"Collector"+Memory.N,{'role':'collector'});
        }
        
        var construction_sites = cur_room.find(FIND_CONSTRUCTION_SITES)
        
        
        //if (Memory.population['builder']['station']['W53S33'] < 4){ // || r_storage.store[RESOURCE_ENERGY] > 70000)){
        //    var name = currentSpawn.createCreep(workerBody,"builder"+Memory.N,{'role':'builder','station':'W53S33'});
        //}
        
        // Builders!
        if (Builders < num_sources && (construction_sites.length > 0)){ // || r_storage.store[RESOURCE_ENERGY] > 70000)){
            var name = currentSpawn.createCreep(workerBody,"builder"+Memory.N,{'role':'builder'});
        }
        else if (Upgraders <  upgraders_needed_by_RCL[cur_controler.level] ){
            var name = currentSpawn.createCreep(upgraderBody,"upgrader"+Memory.N,{'role':'upgrader'});
        } 
        
        // Only build trucks if there are no links! 
        if(num_links < num_sources + 1){
            if (_.filter(Game.creeps, (c)=>c.memory.role == 'truck' && c.memory.station == cur_room.name).length < num_sources){ //Math.floor(2 * num_sources)){
                var name = currentSpawn.createCreep(transportBody,"Truck"+Memory.N,{'role':'truck','station':cur_room.name,'droplocation':cur_room.name});
            } 
        } 
        
        // Miner body
        var miner_body = spawnControl.largest_miner(currentSpawn)
        // How many work parts do the miners in the room currently have?
        var work_parts_in_miner = _.filter(miner_body,p => p == WORK).length;
        //console.log(''+(Miners*work_parts_in_miner)+(num_sources*5))
        // Create miners until their are at least 5 WORK parts per source.
        if(Miners*work_parts_in_miner < num_sources*5){
            //console.log(Miners*work_parts_in_miner < num_sources*5 && currentSpawn.canCreateCreep(miner_body))
            //console.log('miners needed '+miner_body+ ' '+currentSpawn.canCreateCreep(miner_body)+' '+Miners*work_parts_in_miner+' '+num_sources*5)
            //console.log('energy needed' +spawnControl.bodyCost(miner_body))
            var name = currentSpawn.createCreep(miner_body,"Miner"+Memory.N,{'role':'miner','station':cur_room.name});
        } 
        
        if(num_storage == 1){
            if (_.filter(Game.creeps, (c)=>c.memory.role == 'distributer' && c.room.name == cur_room.name && c.memory.emergency != true && c.ticksToLive > 100).length < 1){
                var name = currentSpawn.createCreep(transportBody,"Distributer"+Memory.N,{'role':'distributer','station':cur_room.name,'droplocation':cur_room.name});
            }
            if(num_links >= 2){
                
                //if(_.filter(Game.creeps, (c)=>c.memory.role == 'linker'  && c.room.name == cur_room.name).length < 1){
                if(Memory.population['linker']['room'][currentSpawn.room.name]<1){
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
        
        var transport_body = spawnControl.largest_transport(SpawnLoc)
        
        // Miner body
        var miner_body = spawnControl.largest_miner(SpawnLoc)
     
        var work_parts_in_miner = _.filter(miner_body,p => p == WORK).length;
        
        // Create miners until their are at least 5 WORK parts per source.
        var Miners = Memory.population['miner']['station'][RoomName] || 0;

        var transports = Memory.population['truck']['station'][RoomName] || 0;
        
        if(Miners*work_parts_in_miner < numMiners*5){
            var name = SpawnLoc.createCreep(miner_body,'RemoteMiner'+Memory.N,{'role':'miner','station':RoomName});
            //var name = SpawnLoc.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],"RemoteMiner"+Memory.N,{'role':'miner','station':RoomName});
        } else if (transports <  NumTrucks){
            var name = SpawnLoc.createCreep(transport_body,"RTruck"+Memory.N,{'role':'truck','station':RoomName,'droplocation':SpawnLoc.room.name});
        } else if (_.filter(Game.creeps, (c)=>c.memory.role == 'claimer' && c.memory.station == RoomName).length < numClaimers){ // && Game.rooms[RoomName].controller.reservation.ticksToEnd < 1500
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
    },
    // Build the largest transport the room can.
    largest_transport:function(SpawnLoc){
        
        var room_development = SpawnLoc.room.energyCapacityAvailable;
        
        var transport_body = new Array(CARRY,MOVE);
        
        var flip = true;
        
        var cost_of_transport = spawnControl.bodyCost(transport_body);
        
        while(cost_of_transport < room_development -50){
            if(flip){
                transport_body.push(CARRY);
                cost_of_transport += 50;
                flip = false;
            } else{
                transport_body.push(MOVE);
                cost_of_transport += 50;
                flip = true;
            }
        }
        // If the number of MOVE parts is not equal to the number of carry parts fix it.
        if(_.filter(transport_body,p => p == MOVE).length != _.filter(transport_body,p => p == CARRY).length){
            transport_body.pop()
        }
        //console.log(transport_body)
        return transport_body
    },
    // Build the largest miner the room can.
    largest_miner:function(SpawnLoc){
        
        var room_development = SpawnLoc.room.energyCapacityAvailable;
        
        var miner_body = new Array(CARRY);
        
        var cost_of_miner = spawnControl.bodyCost(miner_body);
        
        var flip = true;
        
        var work_parts = 0;
        
        while(cost_of_miner < room_development -100 && work_parts < 5){
            if(flip){
                miner_body.push(WORK);
                cost_of_miner += 100;
                work_parts += 1;
                flip = false;
            } else{
                miner_body.push(MOVE);
                cost_of_miner += 50;
                flip = true;
            }
        }
        return miner_body
    },
    bodyCost:function(body){
        var partCost = {work:100,carry:50,move:50,tough:10,claim:600,attack:80,ranged_attack:150,heal:250};
        var total = 0;
        for(var i = 0; i<body.length; i++){
            total = total + partCost[body[i]]; 
            
        }
        return total;
    }
}

module.exports = spawnControl;