var transitAI = {
    // Manage paths to and from rooms.
    
    // First set up the seralized path holder. Which saves paths to room.memory and takes starting locations as keys.
    setup:function(){
        if(Memory.savedPaths == undefined){
            Memory.savedPaths = {}

        }
    },

    
    // Get the path in terms of rooms between two room names.
    room_sequence:function(pos1,pos2){
        
        transitAI.setup()
        
        // return -1 if the positions are in the same room.
        if(pos1.roomName == pos2.roomName){
            return -1;
        }
        
        
        // Turn the positions into strings to act as keys.
        var poskey1 = pos1.roomName+pos1.x+pos1.y;
        
        var poskey2 = pos2.roomName+pos2.x+pos2.y;
        
        var roomSequence = Memory.savedPaths[poskey1+poskey2];
        
        if(roomSequence == undefined){
            roomSequence = Game.map.findRoute(pos1.roomName,pos2.roomName);
            
            Memory.savedPaths[poskey1+poskey2] = roomSequence;
        }
        
        return roomSequence;
    },
    
    // Find the shortest path of all paths between a source and the home room.
    establish_roads:function(miner_creep){
        
        // clear all existing roads for reasons...
        //transitAI.clear_roads()
        
        // Get the position of the creeps storage.
        
        var targetPos = Game.rooms[miner_creep.memory.spawnRoom].storage.pos;
        
        // Check the room for links.
        
        var links = Game.rooms[miner_creep.memory.spawnRoom].find(FIND_MY_STRUCTURES,{filter: s => s.structureType == STRUCTURE_LINK})
        
        if(links.length > 0){
            targetPos = links//.push(targetPos)
            
            //console.log(JSON.stringify(links))
        }
        
        if(miner_creep.room.memory.src_path == undefined){
            PathFinder.use(true);
            
            var path = PathFinder.search(miner_creep.pos, targetPos,{swampCost:1})['path']
            //console.log(JSON.stringify(path))
            
            miner_creep.room.memory.src_path = Room.serializePath(path)
        }
        else{
            try{
                var path = Room.deserializePath(miner_creep.room.memory.src_path)
            }catch(Error){
                miner_creep.room.memory.src_path = undefined
                
                console.log(Error.message)
                
            }
            
        }
        
        // Find how many roads still need to be built.
        
        var to_build = 0;
        var built = 0;
        
        
        for (var x in path){
            
            
            
            // current position
            var p = path[x];
            
            // Current construction sites at this point in the path
            if(Game.rooms[p.roomName]){
                
            
                var con_sites = Game.rooms[p.roomName].lookForAt(LOOK_CONSTRUCTION_SITES,p.x,p.y);
                var roads = Game.rooms[p.roomName].lookForAt(LOOK_STRUCTURES,p.x,p.y);
                
                
                
                
                // Creat a road construction site.
                if(con_sites.length == 0 && roads.length == 0){
                    Game.rooms[p.roomName].createConstructionSite(p.x,p.y,STRUCTURE_ROAD);
                    
                }
                if(roads.length == 0 && con_sites.length == 1){
                    to_build += 1;
                }
            }
    
            
            
        }
        //console.log(JSON.stringify(roads))

        miner_creep.room.memory.src_path = undefined
        
        // If the route is done say so in memory.
        if(to_build > 0){
            Memory.road_network[miner_creep.memory.station] = false
            
        } else{
            Memory.road_network[miner_creep.memory.station] = true
        }
        
        // Track the length of the path
        
        if(Memory.road_length == undefined){
            Memory.road_length = {}
        }
        
        Memory.road_length[miner_creep.memory.station] = path.length
        
        
        
        
    },

    clear_roads:function(){
        for(var id in Game.constructionSites){
            var site = Game.constructionSites[id];
            
            if(site.structureType == STRUCTURE_ROAD && site.progress == 0){
                site.remove()
            }
            
        }
    }

    
    
        
}
module.exports = transitAI;