//dedicated, coordinated drop miners

var roleMiner = {

    run: function(room) {
        

        var miners = _.filter(Game.creeps, function (c) { return c.room.name == room && c.memory.role == 'miner'});
        var sources = Game.rooms[room].find(FIND_SOURCES);
        
        var freeMiners = new Array();
        for (a=0; a<miners.length; a++) {
            //if new room
            if (miners[a].memory.currRoom != miners[a].room.name) {
                miners[a].memory.currRoom = miners[a].room.name;
                miners[a].memory.currSource = false;
                miners[a].moveTo(new RoomPosition(25,25, miners[a].pos.roomName));
                miners[a].say('new room')
            }

            //find miners without source            
            if (!miners[a].memory.currSource) {
                freeMiners.push(miners[a]);
                
            }
        }
        
        for (i=0; i<miners.length; i++) {

            if (miners[i].memory.station == undefined) {
                miners[i].memory.station = miners[i].memory.currRoom;
                
            }
            
            if (miners[i].memory.station != miners[i].room.name) {
                
                // But they have been assigned to a source already!
                if (miners[i].memory.currSource != false){
                    var CS = Game.getObjectById(miners[i].memory.currSource)
                    if (CS.room.name != miners[i].memory.station){
                        
                        miners[i].memory.currSource = false;
                        console.log(''+miners[i].name+ 'Weird mine error')
                    }
                    
                }
                
                
	            var moveAttempt = miners[i].moveTo(miners[i].pos.findClosestByRange(miners[i].room.findExitTo(miners[i].memory.station)));
                if(moveAttempt == -2){
                    var creep = miners[a];
                    if(creep.pos.x == 49){
                        creep.move(LEFT);
                    } else if(creep.pos.x == 0){
                        creep.move(RIGHT);
                    }
                    
                } 
	        } else if (miners[i].memory.station == miners[i].room.name){
	            //miners[i].say('on station')
	            
	            var target = Game.getObjectById(miners[i].memory.currSource);
                //then harvest sources
                if (miners[i].harvest(target) == ERR_NOT_IN_RANGE) {
                    miners[i].moveTo(target);
                }
                //assign miners to sources
                for (a=0; a<sources.length; a++) {

                    let X = sources[a].pos.x;
                    let Y = sources[a].pos.y;
                    var sourceMinerCap = 8;// _.filter(miners[i].room.lookForAtArea(LOOK_TERRAIN, Y-1, X-1, Y+1, X+1, true), p => p.terrain == 'normal' || p.terrain == 'swamp').length;
                    
                    var minersOnSource = 0;
                    
                    for (j=0; j<miners.length; j++) {
                        if (miners[j].memory.currSource == sources[a].id) {
                            minersOnSource++;
                        }
                    }
                    
                    var numberToAdd = Math.floor(Math.min(miners.length / sources.length, sourceMinerCap) - minersOnSource);
    
                    for (j=0; j < Math.min(numberToAdd, freeMiners.length); j++) {
                        Game.getObjectById(freeMiners[j].id).memory.currSource = sources[a].id;   
                        freeMiners.shift();
                    }
                }
                
                //var creep = miners[i];
        	    //drop resouces if full capacity      
                if (miners[i].carry.energy == miners[i].carryCapacity) {
                    //THIS IS SUPER CPU INTENSIVE!
                    var link = miners[i].pos.findInRange(FIND_STRUCTURES, 2, { 
                        filter: (structure) => structure.structureType == STRUCTURE_LINK && structure.energy < structure.energyCapacity
                        });
            	       
            	        if (link.length > 0) {
            	            
        	                var j = miners[i].transfer(link[0], RESOURCE_ENERGY);
        	            }         else {
        	            miners[i].drop(RESOURCE_ENERGY);
        	        }
        	        //miners[i].drop(RESOURCE_ENERGY);
                }
                var target = Game.getObjectById(miners[i].memory.currSource);
                //then harvest sources
                if (miners[i].harvest(target) == ERR_NOT_IN_RANGE) {
                    miners[i].moveTo(target);
                }
	        }
        }
        
        //use free miners for cross-room allocation?
        for (b=0; b<freeMiners.length; b++) {
            try{
                Game.getObjectById(freeMiners[b].id).memory.currSource = sources[0].id;
            }
            catch(TypeError){
                console.log('ERR: Miner in room without any sources');
                console.log(freeMiners[b].name)
            }
        }

    }
};

module.exports = roleMiner;