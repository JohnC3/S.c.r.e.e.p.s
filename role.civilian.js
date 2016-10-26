/*
 * The code for civilian creeps goes here, this code covers functions and attributes common to all civilian roles.
 * Civilian creeps are unable to fight and should flee from combat whenever possable.
 * Have the ability to recycle and refresh themselves.
 */

var civilian = {
    // Civilians have a few common properties the most important is moveing to assigned rooms.
    
    // For the sake of polymorphism we need a run function.
    run:function(creep){
        civilian.simple_goto(creep)
        
        if(!creep.memory.path) {
            creep.memory.path = creep.pos.findPathTo(Game.flags.Idle);
        }
        var move_err = creep.moveByPath(creep.memory.path)
        
        creep.say(move_err);
        
        if(move_err == -5){
            creep.memory.path = undefined
        }
    },

    
    // The current implementation of my creeps. 
    simple_goto:function(creep){
        
        if(creep.memory.station == undefined){
            creep.memory.station = creep.room.name;
        }
        
        // Memory.safety is a dict of room names that hash to the safety.
        
        if(creep.room.name != creep.memory.station){
            creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo(creep.memory.station)));
        }
        
    },
    
    // Taken from the documentation
    find_path:function(creep){
        
        let from = new RoomPosition(25, 25, creep.room.name);
        
        

        let to = new RoomPosition(25, 25, creep.memory.station);
        

        if(to === undefined){
            console.log('to undefined')
            
            console.log(new RoomPosition(25, 25, creep.memory.droplocation));
            
            console.log(new RoomPosition(25, 25, creep.memory.station));
        }
        // Use `findRoute` to calculate a high-level plan for this path, 
        // prioritizing highways and owned rooms
        let allowedRooms = { [ from.roomName ]: true };
        Game.map.findRoute(from.roomName, to.roomName, {
        	routeCallback(roomName) {
        		let parsed = /^[WS]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
        		let isHighway = (parsed[1] % 10 === 0) || (parsed[2] % 10 === 0);
        		let isMyRoom = Game.rooms[roomName] && 
        			Game.rooms[roomName].controller && 
        			Game.rooms[roomName].controller.my;
        		if (isHighway || isMyRoom) {
        			return 1;
        		} else {
        			return 2.5;
        		}
        	}
        }).forEach(function(info) {
        	allowedRooms[info.room] = true;
        });
        
        // Invoke PathFinder, allowing access only to rooms from `findRoute`
        let ret = PathFinder.search(from, to, {
        	roomCallback(roomName) {
        		if (allowedRooms[roomName] === undefined) {
        			return false;
        		}
        	}
        });
        
        console.log(ret.path);
    }
}

module.exports = civilian;