var ecoAI = require('eco.AI');
// Module designs creep bodies for creeps in various roles. Each role has a body generated by a function in this module.

var bodyBuilder = {
    
    // Sets the Memory object if it is not defined, then computes the bodies at each step.
    run:function(SpawnLoc){
        
        if(Memory.creepBody == undefined){
            Memory.creepBody = {}
        }
        if(Memory.creepBody[SpawnLoc.room.name] == undefined){
            Memory.creepBody[SpawnLoc.room.name] = {}
        }
        
        // Try to set every body type to the correct value.
        Memory.creepBody[SpawnLoc.room.name]['miner'] = bodyBuilder.largest_miner(SpawnLoc);
        
        Memory.creepBody[SpawnLoc.room.name]['transport'] = bodyBuilder.largest_transport(SpawnLoc);
        
        Memory.creepBody[SpawnLoc.room.name]['upgrader'] = bodyBuilder.largest_upgrader(SpawnLoc)
        
        Memory.creepBody[SpawnLoc.room.name]['worker'] = bodyBuilder.largest_worker(SpawnLoc)
        

        
          
    },
    
    // Build the largest transport the room can.
    largest_transport:function(SpawnLoc){
        
        var room_development = SpawnLoc.room.energyCapacityAvailable;
        
        var transport_body = new Array(CARRY,MOVE);
        
        var flip = true;
        
        var cost_of_transport = ecoAI.bodyCost(transport_body);
        
        while(cost_of_transport < Math.min(room_development -50,600)){
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
        
        var cost_of_miner = ecoAI.bodyCost(miner_body);
        
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
    
    // Largest upgrader, if roads is false then it needs a move part per each other part
    largest_upgrader:function(SpawnLoc,roads = true){
        
        var cur_room = SpawnLoc.room;
        
        var room_development = cur_room.energyCapacityAvailable;
        
        var upgrader_body = new Array(CARRY,MOVE);
        
        var cost_of_upgrader = ecoAI.bodyCost(upgrader_body);
        
        if(roads){
            var Fatigue = -1;
        } else{
            var Fatigue = 0;
        }
        
        var work_parts = 0;
        
        
        while(cost_of_upgrader < room_development - 100){
            
            if(Fatigue > 0){
                upgrader_body.push(MOVE);
                cost_of_upgrader += 50;
                Fatigue = Fatigue -2;
            }
            else{
                // Every 4th work part add a carry part instead of a work part
                if (work_parts == 4){
                    work_parts = 0;
                    upgrader_body.push(CARRY);
                
                    cost_of_upgrader += 50;
                    if(roads){
                        Fatigue += 1;
                    } else{
                        Fatigue += 2;
                    }
                }
                else{
                    upgrader_body.push(WORK);
                    
                    cost_of_upgrader += 100;
                    if(roads){
                        Fatigue += 1;
                    } else{
                        Fatigue += 2;
                    }
                    work_parts += 1;
                }
            }
        }
        console.log(upgrader_body.sort())
        console.log('cost '+ecoAI.bodyCost(upgrader_body))
        console.log('capacity '+room_development)
        if(ecoAI.bodyCost(upgrader_body) <= room_development){
            
            return upgrader_body.sort();
        }
        
        
    },
    
    /* Largest upgrader
    largest_upgrader_old:function(SpawnLoc){
        
        var cur_room = SpawnLoc.room;
        
        var cur_controler = cur_room.controller;
        
        var room_development = cur_room.energyCapacityAvailable;
        
        var upgrader_body_by_RCL =   {1:[WORK,WORK,CARRY,MOVE],
                        2:[WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE],
                        
                        3:[WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE],
                        4:[WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
                        5:[WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
                        6:[WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                        7:[WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                        8:[WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
        };
        
        var upgraderBody = upgrader_body_by_RCL[cur_controler.level];
        
        if(ecoAI.bodyCost(upgraderBody) > room_development){
            var upgraderBody = upgrader_body_by_RCL[cur_controler.level -1];
        }
        
        return upgraderBody
    },*/
    
    
    // Largest worker
    largest_worker:function(SpawnLoc){
        
        var cur_room = SpawnLoc.room;
        
        var cur_controler = cur_room.controller;
        
        var room_development = cur_room.energyCapacityAvailable;
        
        var worker_body_by_RCL =   {1:[WORK,WORK,CARRY,MOVE],
                        2:[WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE], // The end of teir 2
                        3:[WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],//Max energy for RCL 3
                        4:[WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                        5:[WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                        6:[WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                        7:[WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                        8:[WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],
        };

        var workerBody = worker_body_by_RCL[cur_controler.level];

        if(ecoAI.bodyCost(workerBody) > room_development){
            var workerBody = worker_body_by_RCL[cur_controler.level -1] || [WORK,WORK,CARRY,MOVE];
        }
        
        return workerBody
    }
}


module.exports = bodyBuilder;
