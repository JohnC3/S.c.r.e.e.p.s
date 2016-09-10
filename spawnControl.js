var spawnControl = {
    run:function(spawn){
        
        var currentSpawn = Game.spawns[spawn];
        
        var cur_room = currentSpawn.room;
        
        var cur_controler = cur_room.controller;
        
        var room_development = cur_room.energyCapacityAvailable;
        
        var num_sources = currentSpawn.room.find(FIND_SOURCES).length;
        
        var num_links = currentSpawn.room.find(FIND_STRUCTURES, {filter : s => s.structureType == STRUCTURE_LINK} ).length;
        // The worker body changes based on energy capacity availalbe

        var level_bod =   {1:[WORK,WORK,CARRY,MOVE],
                        2:[WORK,WORK,CARRY,MOVE,MOVE,MOVE], // The end of teir 2
                        3:[WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],//Max energy for RCL 3
                        4:[WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
                        5:[WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                        6:[WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                        7:[WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                        8:[WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],
        };
        
        var level_bod_u =   {1:[WORK,WORK,CARRY,MOVE],
                        2:[WORK,WORK,CARRY,MOVE,MOVE,MOVE], // The end of teir 2
                        3:[WORK,WORK,CARRY,MOVE,MOVE,MOVE],//Max energy for RCL 3
                        4:[WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
                        5:[WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                        6:[WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                        7:[WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                        8:[WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
        };
        
        var level_bod_truck =   {1:[MOVE,MOVE,CARRY,CARRY],
                        2:[MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY], // The end of teir 2
                        3:[MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY],//Max energy for RCL 3
                        4:[MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY],
                        5:[MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY],
                        6:[MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY],
                        7:[MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY],
                        8:[MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY],
                        9:[MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY,MOVE,MOVE,CARRY,CARRY]
        };
        
        // Intended to create larger creeps.
        
        var workerBody = level_bod[cur_controler.level];

        var upgraderBody = level_bod_u[cur_controler.level];
        
        var transportBody = level_bod_truck[cur_controler.level];
        //console.log(workerBody);
        if (workerBody == undefined){
            var workerBody = [WORK,WORK,CARRY,MOVE];
            console.log('workerBody error ');
            console.log(room_development);
        }
        
        
        
        
        
            //var combatBody = [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK]
    
        var Harvesters = _.filter(Game.creeps, (c)=>c.memory.role == 'harvester' && c.room == currentSpawn.room);
        var Builders = _.filter(Game.creeps, (c)=>c.memory.role == 'builder' && c.room == currentSpawn.room);
        var Upgraders = _.filter(Game.creeps, (c)=>c.memory.role == 'upgrader' && c.room == currentSpawn.room);
        var Miners = _.filter(Game.creeps, (c)=>c.memory.role == 'miner' && c.room == currentSpawn.room);
        var Repairer = _.filter(Game.creeps, (c)=>c.memory.role == 'repairer');
        var Trucks = _.filter(Game.creeps, (c)=>c.memory.role == 'truck' && c.room == currentSpawn.room);
        var Troops = _.filter(Game.creeps, (c)=>c.memory.role == 'trooper');
        var Archers = _.filter(Game.creeps, (c)=>c.memory.role == 'archer');
        var Knights = _.filter(Game.creeps, (c)=>c.memory.role == 'knight');
        var Raider = _.filter(Game.creeps, (c)=>c.memory.role == 'raider');
        var Healer = _.filter(Game.creeps, (c)=>c.memory.role == 'healer');
        var Claimer = _.filter(Game.creeps, (c)=>c.memory.role == 'claimer');
        var Deconstructors = _.filter(Game.creeps, (c)=>c.memory.role == 'deconstructor');
        
        if (Memory.N % 50 == 1){
            console.log(''+cur_room.name+"\nh " + Harvesters.length+" bld " + Builders.length+" up " + Upgraders.length+"\nmine " + Miners.length+" trk " + Trucks.length+"\nsol " + Troops.length+" kni " + Knights.length+" raid " + Raider.length);
        }
        
        if (Miners.length == 0 && currentSpawn.canCreateCreep(workerBody) != OK && Harvesters.length < 4){
            currentSpawn.createCreep([WORK,MOVE,CARRY,MOVE],"Eharvester"+Memory.N,{'role':'harvester'});
            console.log('Emergency spawning harvester')
        }
        if (Game.spawns[spawn].room.controller.ticksToDowngrade <5000 && currentSpawn.canCreateCreep(upgraderBody) != OK){
            currentSpawn.createCreep([WORK,MOVE,CARRY,MOVE],"Eupgrader"+Memory.N,{'role':'upgrader'});
            console.log('Emergency spawning upgrader')
        }
        
        if (Trucks.length == 0){
            currentSpawn.createCreep([CARRY,CARRY,MOVE,MOVE],"ETruck"+Memory.N,{'role':'truck','collect_dropped':true});
            console.log('Emergency spawning truck')
        }
        
        if (_.filter(Game.creeps, (c)=>c.memory.role == 'distributer' && c.room.name == cur_room.name).length == 0){
            currentSpawn.createCreep([CARRY,CARRY,MOVE,MOVE],"Edistributer"+Memory.N,{'role':'distributer'});
            console.log('Emergency spawning distributer')
        }
   
        
        if(Game.flags.wartime != undefined){
            if (Troops.length < 5){
                var name = currentSpawn.createCreep([MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],"Troop"+Memory.N,{'role':'trooper','rally_flag':'troops'});
    
            } 
            if (Archers.length < 8){
                var name = currentSpawn.createCreep([MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK],"Archer"+Memory.N,{'role':'archer','rally_flag':'archers'});
    
            } else if (Knights.length < 4){
                var name = currentSpawn.createCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],"Knight"+Memory.N,{'role':'knight','rally_flag':'knights'});
                //var name = currentSpawn.createCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK],"Knight"+Memory.N,{'role':'knight','rally_flag':'knights'});
    
            } else if (Healer.length < 1){
                var name = currentSpawn.createCreep([TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL],"Healer"+Memory.N,{'role':'healer','rally_flag':'knights'});
            
            if (Deconstructors.length < 3){
            var name = Game.spawns.Spawn1.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],"DemoManr"+Memory.N,{'role':'deconstructor'});
                }
            
            }
        }
        else{
            
            if (Knights.length < 1){
                var name = currentSpawn.createCreep([TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],"Knight"+Memory.N,{'role':'knight','rally_flag':'knights'});
            } 
            
            else if (Healer.length < 1){
                var name = currentSpawn.createCreep([HEAL,HEAL,MOVE,MOVE],"Healer"+Memory.N,{'role':'healer','rally_flag':'knights'});
            } 
            else if (Deconstructors.length < 1){
            //var name = currentSpawn.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],"DemoManr"+Memory.N,{'role':'deconstructor'});
                }
            
        }
        
        
                // Builders!
        if (Builders.length == 0){
            var name = currentSpawn.createCreep(workerBody,"builder"+Memory.N,{'role':'builder'});
        }
        else if (Upgraders.length <  2*num_sources){
            var name = currentSpawn.createCreep(upgraderBody,"upgrader"+Memory.N,{'role':'upgrader'});
        } 
        
        if(cur_room.find(FIND_STRUCTURES,{filter: s => s.structureType == STRUCTURE_STORAGE }).length == 1){
            if (_.filter(Game.creeps, (c)=>c.memory.role == 'distributer' && c.memory.station == cur_room.name).length < 2){
                var name = currentSpawn.createCreep(transportBody,"Distributer"+Memory.N,{'role':'distributer','station':cur_room.name,'droplocation':cur_room.name});
            }
        }
        
        // Only build trucks if there are no links! 
        if(num_links < num_sources + 1){
            if (_.filter(Game.creeps, (c)=>c.memory.role == 'truck' && c.memory.station == cur_room.name).length < num_sources){ //Math.floor(2 * num_sources)){
                var name = currentSpawn.createCreep(transportBody,"Truck"+Memory.N,{'role':'truck','collect_dropped':true,'station':cur_room.name,'droplocation':cur_room.name});
            } else if (_.filter(Game.creeps, (c)=>c.memory.role == 'truck' && c.memory.station == cur_room.name).length < num_sources+1){ //Math.floor(2 * num_sources)+1){
                var name = currentSpawn.createCreep(transportBody,"Truck"+Memory.N,{'role':'truck','collect_dropped':false,'station':cur_room.name,'droplocation':cur_room.name});
            }
            
        }
        // Create a miner for every source in a room.
        if (_.filter(Game.creeps, (c)=>c.memory.role == 'miner'  && c.memory.station == cur_room.name).length < num_sources){
            var name = currentSpawn.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],"BigMiner"+Memory.N,{'role':'miner','station':cur_room.name});
        } 
        
        if (name != -4 && name != -6 && name != undefined){
                console.log(""+cur_room+"Creep: "+name);
                Memory.N = Memory.N +1;
            }

    },
    remote_source_mine:function(RoomName,SpawnLoc){
        if (_.filter(Game.creeps, (c)=>c.memory.role == 'miner' && c.memory.station == RoomName).length < 1){
            var name = SpawnLoc.createCreep([WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE],"RemoteMiner"+Memory.N,{'role':'miner','station':RoomName});
        } else if (_.filter(Game.creeps, (c)=>c.memory.role == 'truck' && c.memory.station == RoomName).length <  2){
            var name = SpawnLoc.createCreep([CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE],"RemoteTruck"+Memory.N,{'role':'truck','collect_dropped':true,'station':RoomName,'droplocation':SpawnLoc.room.name});
        } else if (_.filter(Game.creeps, (c)=>c.memory.role == 'claimer' && c.memory.station == RoomName).length < 1){
            var name = SpawnLoc.createCreep([MOVE,MOVE,CLAIM,CLAIM],"Diplomat"+Memory.N,{'role':'claimer','station':RoomName});
        }
    }
    /*,
    
    
    station:function(role,station,needed){
        if (_.filter(Game.creeps, (c)=>c.memory.role == role && c.memory.station == station).length < needed){
            var name = currentSpawn.createCreep([MOVE,CLAIM],"Diplomat"+Memory.N,{'role':role,'station':station});
            if (name != -4 && name != -6){
                console.log("Creep: "+name);
                Memory.N = Memory.N +1;
            }        
            
        }
        
    },
    establish_control:function(s){
        var a_spawn = Game.spawns[s];
        var r = a_spawn.room;
        var origin_x = a_spawn.pos.x;
        var origin_y = a_spawn.pos.y;
        var room_level = Game.spawns[s].room.controller.level;
        if(room_level == 2 && a_spawn.memory[''+room_level] == undefined){

            r.createConstructionSite(origin_x - 2,origin_y,STRUCTURE_EXTENSION)
            r.createConstructionSite(origin_x + 2,origin_y,STRUCTURE_EXTENSION)
            r.createConstructionSite(origin_x + 1,origin_y + 1,STRUCTURE_EXTENSION)
            r.createConstructionSite(origin_x - 1,origin_y + 1,STRUCTURE_EXTENSION)
            r.createConstructionSite(origin_x,origin_y + 2,STRUCTURE_EXTENSION)
            a_spawn.memory[''+room_level] = true;
        
        }
        if(room_level == 3 && a_spawn.memory[''+room_level] == undefined){

            r.createConstructionSite(origin_x - 1 ,origin_y - 1,STRUCTURE_EXTENSION)
            r.createConstructionSite(origin_x + 1 ,origin_y - 1,STRUCTURE_EXTENSION)
            r.createConstructionSite(origin_x,origin_y - 2,STRUCTURE_EXTENSION)
            r.createConstructionSite(origin_x - 2,origin_y - 2,STRUCTURE_EXTENSION)
            r.createConstructionSite(origin_x + 2,origin_y - 2,STRUCTURE_EXTENSION)

            r.createConstructionSite(origin_x + 2,origin_y + 2,STRUCTURE_TOWER)
            a_spawn.memory[''+room_level] = true;
        }
        if(room_level == 3 && a_spawn.memory[''+room_level] == undefined){

            r.createConstructionSite(origin_x - 1 ,origin_y - 3,STRUCTURE_EXTENSION)
            r.createConstructionSite(origin_x + 1 ,origin_y - 3,STRUCTURE_EXTENSION)
            r.createConstructionSite(origin_x,origin_y - 4,STRUCTURE_EXTENSION)
            r.createConstructionSite(origin_x - 2,origin_y - 4,STRUCTURE_EXTENSION)
            r.createConstructionSite(origin_x + 2,origin_y - 4,STRUCTURE_EXTENSION)
            
            r.createConstructionSite(origin_x - 4,origin_y,STRUCTURE_EXTENSION)
            r.createConstructionSite(origin_x + 4,origin_y,STRUCTURE_EXTENSION)
            r.createConstructionSite(origin_x + 1,origin_y + 4,STRUCTURE_EXTENSION)
            r.createConstructionSite(origin_x - 1,origin_y + 4,STRUCTURE_EXTENSION)
            r.createConstructionSite(origin_x -4,origin_y + 1,STRUCTURE_EXTENSION)
            

            r.createConstructionSite(origin_x - 2,origin_y + 2,STRUCTURE_STORAGE)
            a_spawn.memory[''+room_level] = true;
        }
    }*/
}

module.exports = spawnControl;