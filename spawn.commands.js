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
        
        if(mem['station'] == undefined){
            mem['station'] = mem['spawnRoom'];
        }
        
        
        //console.log(JSON.stringify(mem))
        var name = spawnObject.createCreep(creep_body,creep_name+Memory.N,mem);
        
        if(name == -10){
            console.log(spawnObject.name+'\n'+
            creep_name+'\n'+
            JSON.stringify(creep_body)+'\n'+
            creep_body.length+'\n'+
            JSON.stringify(spawnObject.canCreateCreep(creep_body))+'\n'+
            JSON.stringify(creep_memory)+'\n')
        }
        
        return name;
    },
    
    // Send miners trucks and claimers to a given room to mine it and return resorces to the base that spawned them.
    remote_source_mine:function(RoomName,spawnObject,NumTrucks,numMiners,numClaimers,claim = false,delivery_room = undefined){
        
        // Add the room to my domain if it is not already.
        if(Memory.myDomain.indexOf(RoomName) == -1){
            Memory.myDomain.push(RoomName)
        }
        
        if(claim != true && claim != false){
            claim = false
        }
        
        
        // First make sure the room is safe before doing anything.
        
        if(Memory.safety[RoomName]){
            
            // Optionally the delivery room can overide which room recives the resources.
            if(delivery_room == undefined){
                var drop_room = spawnObject.room.name
            } else{
                var drop_room = delivery_room
            }
            
            
            

            // transport body
            var transport_body = bodyBuilder.largest_transport(spawnObject,station = RoomName,cap = 1000)
            
            
            
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
            
            // How many miners are needed?
            
            if(Miners*work_parts_in_miner < numMiners*5 && Miners < 6){
                
                var name = spawnCommands.spawnNew(spawnObject,creep_body = miner_body,creep_name = 'R Miner',creep_memory = {'role':'miner','station':RoomName});

            } else if (transports <  NumTrucks){


                var name = spawnCommands.spawnNew(spawnObject,creep_body = transport_body,creep_name = "R Truck",creep_memory = {'role':'truck','station':RoomName,'droplocation':drop_room,'energy_pickedup':0,'energy_delivered':0});

            } else if (claimers< numClaimers){ // && Game.rooms[RoomName].controller.reservation.ticksToEnd < 1500


                var name = spawnCommands.spawnNew(spawnObject,creep_body = [MOVE,MOVE,CLAIM,CLAIM],creep_name = "Diplomat",creep_memory = {'role':'claimer','station':RoomName,'claimmode':claim});

                if (name == ERR_NOT_ENOUGH_ENERGY){

                    
                    var name = spawnCommands.spawnNew(spawnObject,creep_body = [MOVE,CLAIM],creep_name = "Diplomat",creep_memory = {'role':'claimer','station':RoomName,'claimmode':claim});

                }

            }

        }else{
            // If the room is not safe spawn a scout to check it out!
            
            var scouts = Memory.population['scout']['station'][RoomName] || 0;
            
            // scouts are disabled untill I can think of a way for them to work!
            
            if(scouts < 1){
                console.log(RoomName+' not safe for remote operations dispatching scout' )
                var name = spawnCommands.spawnNew(spawnObject,creep_body = [MOVE,ATTACK],creep_name = "Scout",creep_memory = {'role':'scout','station':RoomName});
            }
        }
            
        if (name != -4 && name != -6 && name != undefined){
                console.log(""+spawnObject.name+" "+name);
                Memory.N = Memory.N +1;
        }
    },
    // Dispatch trucks to get a specific resource from a room!
    
    dispatch_trucks:function(RoomName,spawnObject,number,resource = 'energy'){
        if(resource != 'energy'){
            console.log('you didnt write code on how to pickup anything but energy...')
        }
        
        
        
        
        
        // transport body
        var transport_body = bodyBuilder.largest_transport(spawnObject,station = RoomName,cap = 1000)
    },
    
    
    
    // Dispatch builders to another room, along with trucks to dropoff energy in said room.
    dispatch_builders:function(RoomName,spawnObject,numBuilders){
        
        if(Memory.myDomain.indexOf(RoomName) == -1){
            Memory.myDomain.push(RoomName)
        }
        
        var cur_room = spawnObject.room;
        
        var builders = Memory.population['builder']['station'][RoomName];
        
        if(builders < numBuilders){
            var workerBody = bodyBuilder.largest_worker(spawnObject)
            var name = spawnObject.createCreep(workerBody,"builder"+Memory.N,{'role':'builder','station':RoomName});
        }
        
        if (name != -4 && name != -6 && name != undefined){
                console.log(""+RoomName+" "+name);
                Memory.N = Memory.N +1;
        }
        
    }
    
}

module.exports = spawnCommands;