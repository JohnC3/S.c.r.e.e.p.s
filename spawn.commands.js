// Holds instructions for activities like spawning remote miners and so on.

var spawnCommands = {
    
    // Function that handles spawning of creeps
    spawnNew:function(spawnObject,creep_body,creep_name,creep_memory){
        
        //,ttl = body.length*3 ttl is the number of ticks a new creep will take to replace the old one.
        
        var creep_role = creep_memory['role'];

        var mem = creep_memory;
        //console.log(JSON.stringify(mem))
        mem['spawnName'] = spawnObject.name;
        
        mem['spawnRoom'] = spawnObject.room.name;
        
        if(creep_role == 'truck'){
            mem['energy_pickedup'] = 0;
            mem['energy_delivered'] = 0;
        }
        
        if(creep_role == 'miner'){
            mem['energy_harvested'] = 0;
        }
        //console.log(JSON.stringify(mem))
        var name = spawnObject.createCreep(creep_body,creep_name+Memory.N,mem);
        
        return name;
    },
    
    // Send miners trucks and claimers to a given room to mine it and return resorces to the base that spawned them.
    remote_source_mine:function(RoomName,spawnObject,NumTrucks,numMiners,numClaimers,claim = false){
        
        // Add the room to my domain if it is not already.
        if(Memory.myDomain.indexOf(RoomName) == -1){
            Memory.myDomain.push(RoomName)
        }
        
        
        // First make sure the room is safe before doing anything.
        
        if(Memory.safety[RoomName]){
            

            // transport body
            var transport_body = bodyBuilder.largest_transport(spawnObject)
            
            transport_body.push(WORK)
            transport_body.push(MOVE)
            
            // Miner body
            var miner_body = bodyBuilder.largest_miner(spawnObject)

            var work_parts_in_miner = _.filter(miner_body,p => p == WORK).length;
            
            // Remember that if the ticks to live of a creep is less then the distance to the source in said room spawn a new one.
            
            var transit_time = 100;
            
            // Create miners until their are at least 5 WORK parts per source.
            var Miners = Memory.population['miner']['station'][RoomName]
            
            if(Memory.population['miner']['station'][RoomName+'TTL'] < transit_time){
                Miners = Miners - 1;
            }
            
            var transports = Memory.population['truck']['station'][RoomName]
            
            if(Memory.population['truck']['station'][RoomName+'TTL'] < transit_time){
                transports = transports - 1;
            }
            
            var claimers = Memory.population['claimer']['station'][RoomName] 
            
            if(Memory.population['claimer']['station'][RoomName+'TTL'] < transit_time){
                claimers = claimers - 1;
            }
            //
            if(Miners*work_parts_in_miner < numMiners*5 && Miners < 6){
                
                var name = spawnCommands.spawnNew(spawnObject,creep_body = miner_body,creep_name = 'R Miner',creep_memory = {'role':'miner','station':RoomName});
                //var name = spawnObject.createCreep(miner_body,'RemoteMiner'+Memory.N,{'role':'miner','station':RoomName});
    
            } else if (transports <  NumTrucks){
                var name = spawnCommands.spawnNew(spawnObject,creep_body = transport_body,creep_name = "R Truck",creep_memory = {'role':'truck','station':RoomName,'droplocation':spawnObject.room.name,'energy_pickedup':0,'energy_delivered':0});
                //var name = spawnObject.createCreep(transport_body,"RTruck"+Memory.N,{'role':'truck','station':RoomName,'droplocation':spawnObject.room.name,'energy_pickedup':0,'energy_delivered':0});
            } else if (claimers< numClaimers){ // && Game.rooms[RoomName].controller.reservation.ticksToEnd < 1500
                try{
                    var name = spawnCommands.spawnNew(spawnObject,creep_body = [MOVE,MOVE,CLAIM,CLAIM],creep_name = "Diplomat",creep_memory = {'role':'claimer','station':RoomName,'claimmode':claim});
                    //var name = spawnObject.createCreep([MOVE,MOVE,CLAIM,CLAIM],"Diplomat"+Memory.N,{'role':'claimer','station':RoomName,'claimmode':claim});
                    if (name == ERR_NOT_ENOUGH_ENERGY){
                        var name = spawnCommands.spawnNew(spawnObject,creep_body = [MOVE,CLAIM],creep_name = "Diplomat",creep_memory = {'role':'claimer','station':RoomName,'claimmode':claim});
                        //var name = spawnObject.createCreep([MOVE,CLAIM],"Diplomat"+Memory.N,{'role':'claimer','station':RoomName,'claimmode':claim});
                    }
                }catch(TypeError){
                    console.log('claimer error')
                }
            }
            
            if (name != -4 && name != -6 && name != undefined){
                    console.log(""+spawnObject.name+" "+name);
                    Memory.N = Memory.N +1;
            }
        }
    },
    
    // Dispatch builders to another room, along with trucks to dropoff energy in said room.
    dispatch_builders:function(RoomName,spawnObject,NumTrucks,numBuilders,numMiners = 1){
        
        if(Memory.myDomain.indexOf(RoomName) == -1){
            Memory.myDomain.push(RoomName)
        }
        
        var cur_room = spawnObject.room;
        
        var builders = Memory.population['builder']['station'][RoomName];
        
        
        
        if(builders < numBuilders){
            var workerBody = bodyBuilder.largest_worker(spawnObject)
            var name = spawnObject.createCreep(workerBody,"builder"+Memory.N,{'role':'builder','station':RoomName});
        }
        
        var trucks = Memory.population['truck']['station'][RoomName]
        
        if(trucks < NumTrucks){
            var transport_body = bodyBuilder.largest_transport(spawnObject)
            var name = spawnObject.createCreep(transport_body,"Hauler"+Memory.N,{'role':'truck','station':RoomName,'droplocation':RoomName});
        }
        
        var Miners = Memory.population['miner']['station'][RoomName]
        
        if(Miners < numMiners){
            var miner_body = bodyBuilder.largest_miner(spawnObject)
            var name = spawnObject.createCreep(miner_body,'RemoteMiner'+Memory.N,{'role':'miner','station':RoomName});

        }
        
        if (name != -4 && name != -6 && name != undefined){
                console.log(""+RoomName+" "+name);
                Memory.N = Memory.N +1;
        }
        
    }
    
}

module.exports = spawnCommands;